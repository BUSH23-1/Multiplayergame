package com.arena.tictactoe.service;

import com.arena.tictactoe.model.GameRoom;
import com.arena.tictactoe.model.GameStatus;
import com.arena.tictactoe.model.Player;
import com.arena.tictactoe.model.PlayerSymbol;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Authoritative Game Service managing room lifecycle, state validation,
 * turn enforcement, and win/draw evaluation.
 */
@Service
public class GameService {

    // 8 possible winning combinations on a 3x3 grid
    private static final int[][] WINNING_LINES = {
        {0, 1, 2}, // Row 1
        {3, 4, 5}, // Row 2
        {6, 7, 8}, // Row 3
        {0, 3, 6}, // Column 1
        {1, 4, 7}, // Column 2
        {2, 5, 8}, // Column 3
        {0, 4, 8}, // Diagonal top-left to bottom-right
        {2, 4, 6}  // Diagonal top-right to bottom-left
    };

    private static final String CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Unambiguous chars
    private static final SecureRandom RANDOM = new SecureRandom();

    // In-memory room store (single instance). Rooms are retained in memory.
    private final Map<String, GameRoom> rooms = new ConcurrentHashMap<>();
    // Mapping from WebSocket sessionId to roomCode
    private final Map<String, String> sessionToRoom = new ConcurrentHashMap<>();
    // Mapping from WebSocket sessionId to playerId
    private final Map<String, String> sessionToPlayer = new ConcurrentHashMap<>();

    /**
     * Generates a 6-character random room code.
     */
    public String generateRoomCode() {
        StringBuilder sb = new StringBuilder(6);
        for (int i = 0; i < 6; i++) {
            sb.append(CODE_CHARS.charAt(RANDOM.nextInt(CODE_CHARS.length())));
        }
        return sb.toString();
    }

    /**
     * Creates a new multiplayer room with the host as Player X.
     */
    public synchronized GameRoom createRoom(String hostUsername) {
        String cleanUsername = (hostUsername == null || hostUsername.trim().isEmpty())
                ? "Player 1"
                : hostUsername.trim();

        String roomCode;
        do {
            roomCode = generateRoomCode();
        } while (rooms.containsKey(roomCode));

        String hostId = "p-" + UUID.randomUUID().toString().substring(0, 8);
        Player host = new Player(hostId, cleanUsername, PlayerSymbol.X);

        GameRoom room = new GameRoom(roomCode, host);
        rooms.put(roomCode, room);
        return room;
    }

    /**
     * Joins an existing room as Player O.
     */
    public synchronized GameRoom joinRoom(String roomCode, String guestUsername) {
        if (roomCode == null) {
            throw new IllegalArgumentException("Room code cannot be null.");
        }
        String normalizedCode = roomCode.trim().toUpperCase();
        GameRoom room = rooms.get(normalizedCode);

        if (room == null) {
            throw new IllegalArgumentException("Room code '" + normalizedCode + "' not found. Check the code and try again.");
        }

        if (room.isFull()) {
            throw new IllegalStateException("Room '" + normalizedCode + "' is already full (maximum 2 players).");
        }

        String cleanUsername = (guestUsername == null || guestUsername.trim().isEmpty())
                ? "Player 2"
                : guestUsername.trim();

        String guestId = "p-" + UUID.randomUUID().toString().substring(0, 8);
        Player guest = new Player(guestId, cleanUsername, PlayerSymbol.O);

        room.setPlayerO(guest);
        room.setStatus(GameStatus.IN_PROGRESS);
        room.setCurrentTurn(PlayerSymbol.X);
        room.setLastActionMessage("Match started! " + room.getPlayerX().getUsername() + " (X) vs " + guest.getUsername() + " (O). It's X's turn.");
        room.setLastActivityAt(Instant.now());

        return room;
    }

    /**
     * Fetches a room by its code.
     */
    public GameRoom getRoom(String roomCode) {
        if (roomCode == null) return null;
        return rooms.get(roomCode.trim().toUpperCase());
    }

    /**
     * Authoritatively processes a move on the board.
     */
    public synchronized GameRoom makeMove(String roomCode, String playerId, int cellIndex) {
        if (roomCode == null) {
            throw new IllegalArgumentException("Room code is required.");
        }
        GameRoom room = rooms.get(roomCode.trim().toUpperCase());
        if (room == null) {
            throw new IllegalArgumentException("Room not found.");
        }

        if (room.getStatus() != GameStatus.IN_PROGRESS) {
            throw new IllegalStateException("Game is not in progress (Current status: " + room.getStatus() + ").");
        }

        if (cellIndex < 0 || cellIndex > 8) {
            throw new IllegalArgumentException("Invalid cell index. Must be between 0 and 8.");
        }

        String[] board = room.getBoard();
        if (board[cellIndex] != null) {
            throw new IllegalStateException("Cell " + cellIndex + " is already occupied by " + board[cellIndex] + ".");
        }

        // Validate player identity and turn
        Player movingPlayer = room.getPlayerById(playerId);
        if (movingPlayer == null) {
            throw new IllegalArgumentException("Player not authorized for this room.");
        }

        if (movingPlayer.getSymbol() != room.getCurrentTurn()) {
            throw new IllegalStateException("It is not your turn. Waiting for " + room.getCurrentTurn() + ".");
        }

        // Execute move
        PlayerSymbol moveSymbol = movingPlayer.getSymbol();
        board[cellIndex] = moveSymbol.name();
        room.setMoveCount(room.getMoveCount() + 1);
        room.setLastActivityAt(Instant.now());

        // Check for victory
        int[] winningLine = findWinningLine(board, moveSymbol.name());
        if (winningLine != null) {
            room.setWinner(moveSymbol);
            room.setWinningLine(winningLine);
            room.setStatus(moveSymbol == PlayerSymbol.X ? GameStatus.FINISHED_X_WON : GameStatus.FINISHED_O_WON);
            room.setLastActionMessage(movingPlayer.getUsername() + " (" + moveSymbol + ") wins the match!");
            return room;
        }

        // Check for draw (all 9 cells filled)
        if (isBoardFull(board)) {
            room.setStatus(GameStatus.FINISHED_DRAW);
            room.setLastActionMessage("Match ended in a draw! All cells filled.");
            return room;
        }

        // Toggle turn
        PlayerSymbol nextTurn = moveSymbol.opponent();
        room.setCurrentTurn(nextTurn);
        Player nextPlayer = room.getPlayerBySymbol(nextTurn);
        String nextPlayerName = nextPlayer != null ? nextPlayer.getUsername() : nextTurn.name();
        room.setLastActionMessage("Move placed at cell " + cellIndex + ". Now " + nextPlayerName + " (" + nextTurn + ")'s turn.");

        return room;
    }

    /**
     * Checks if given symbol has completed any winning line.
     */
    private int[] findWinningLine(String[] board, String symbol) {
        for (int[] line : WINNING_LINES) {
            if (symbol.equals(board[line[0]]) &&
                symbol.equals(board[line[1]]) &&
                symbol.equals(board[line[2]])) {
                return line;
            }
        }
        return null;
    }

    private boolean isBoardFull(String[] board) {
        for (String cell : board) {
            if (cell == null) return false;
        }
        return true;
    }

    /**
     * Handles rematch request. When both players request or either requests,
     * resets the board.
     */
    public synchronized GameRoom requestRematch(String roomCode, String playerId) {
        GameRoom room = getRoom(roomCode);
        if (room == null) throw new IllegalArgumentException("Room not found.");

        Player player = room.getPlayerById(playerId);
        if (player == null) throw new IllegalArgumentException("Player not in room.");

        player.setWantsRematch(true);

        Player opponent = (player.getSymbol() == PlayerSymbol.X) ? room.getPlayerO() : room.getPlayerX();

        if (opponent == null || opponent.isWantsRematch()) {
            // Both voted or single player ready, reset board!
            room.resetForRematch();
        } else {
            room.setLastActionMessage(player.getUsername() + " requested a rematch. Waiting for opponent...");
        }
        return room;
    }

    public synchronized void registerSession(String sessionId, String roomCode, String playerId) {
        sessionToRoom.put(sessionId, roomCode.toUpperCase());
        sessionToPlayer.put(sessionId, playerId);
        GameRoom room = getRoom(roomCode);
        if (room != null) {
            Player p = room.getPlayerById(playerId);
            if (p != null) {
                p.setSessionId(sessionId);
                p.setConnected(true);
            }
        }
    }

    public synchronized GameRoom handleDisconnect(String sessionId) {
        String roomCode = sessionToRoom.remove(sessionId);
        String playerId = sessionToPlayer.remove(sessionId);

        if (roomCode != null && playerId != null) {
            GameRoom room = getRoom(roomCode);
            if (room != null) {
                Player player = room.getPlayerById(playerId);
                if (player != null) {
                    player.setConnected(false);
                    if (room.getStatus() == GameStatus.IN_PROGRESS) {
                        room.setStatus(GameStatus.PLAYER_DISCONNECTED);
                        room.setLastActionMessage(player.getUsername() + " disconnected from the match.");
                    }
                }
                return room;
            }
        }
        return null;
    }

    public Map<String, GameRoom> getAllRooms() {
        return rooms;
    }
}
