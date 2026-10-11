package com.arena.tictactoe.model;

import java.io.Serializable;
import java.time.Instant;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/**
 * Authoritative Game Room maintaining state for two players and the 3x3 grid.
 */
public class GameRoom implements Serializable {
    private String roomCode;
    private Player playerX;
    private Player playerO;
    private String[] board; // 9 elements: null, "X", or "O"
    private PlayerSymbol currentTurn;
    private GameStatus status;
    private PlayerSymbol winner;
    private int[] winningLine; // e.g. [0, 1, 2]
    private int moveCount;
    private String lastActionMessage;
    private Instant createdAt;
    private Instant lastActivityAt;

    public GameRoom() {
        this.board = new String[9];
        this.currentTurn = PlayerSymbol.X;
        this.status = GameStatus.WAITING_FOR_PLAYER;
        this.moveCount = 0;
        this.createdAt = Instant.now();
        this.lastActivityAt = Instant.now();
    }

    public GameRoom(String roomCode, Player host) {
        this();
        this.roomCode = roomCode;
        this.playerX = host;
        this.lastActionMessage = "Room created. Waiting for Player 2 to join...";
    }

    public void resetForRematch() {
        Arrays.fill(this.board, null);
        this.winner = null;
        this.winningLine = null;
        this.moveCount = 0;
        this.status = GameStatus.IN_PROGRESS;
        // Alternate starting player or start with X
        this.currentTurn = PlayerSymbol.X;
        if (this.playerX != null) this.playerX.setWantsRematch(false);
        if (this.playerO != null) this.playerO.setWantsRematch(false);
        this.lastActionMessage = "Rematch initiated! " + this.playerX.getUsername() + " (X) goes first.";
        this.lastActivityAt = Instant.now();
    }

    public boolean isFull() {
        return playerX != null && playerO != null;
    }

    public Player getPlayerBySymbol(PlayerSymbol symbol) {
        if (symbol == PlayerSymbol.X) return playerX;
        if (symbol == PlayerSymbol.O) return playerO;
        return null;
    }

    public Player getPlayerById(String playerId) {
        if (playerX != null && playerX.getId().equals(playerId)) return playerX;
        if (playerO != null && playerO.getId().equals(playerId)) return playerO;
        return null;
    }

    // Getters and Setters
    public String getRoomCode() {
        return roomCode;
    }

    public void setRoomCode(String roomCode) {
        this.roomCode = roomCode;
    }

    public Player getPlayerX() {
        return playerX;
    }

    public void setPlayerX(Player playerX) {
        this.playerX = playerX;
    }

    public Player getPlayerO() {
        return playerO;
    }

    public void setPlayerO(Player playerO) {
        this.playerO = playerO;
    }

    public String[] getBoard() {
        return board;
    }

    public void setBoard(String[] board) {
        this.board = board;
    }

    public PlayerSymbol getCurrentTurn() {
        return currentTurn;
    }

    public void setCurrentTurn(PlayerSymbol currentTurn) {
        this.currentTurn = currentTurn;
    }

    public GameStatus getStatus() {
        return status;
    }

    public void setStatus(GameStatus status) {
        this.status = status;
    }

    public PlayerSymbol getWinner() {
        return winner;
    }

    public void setWinner(PlayerSymbol winner) {
        this.winner = winner;
    }

    public int[] getWinningLine() {
        return winningLine;
    }

    public void setWinningLine(int[] winningLine) {
        this.winningLine = winningLine;
    }

    public int getMoveCount() {
        return moveCount;
    }

    public void setMoveCount(int moveCount) {
        this.moveCount = moveCount;
    }

    public String getLastActionMessage() {
        return lastActionMessage;
    }

    public void setLastActionMessage(String lastActionMessage) {
        this.lastActionMessage = lastActionMessage;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getLastActivityAt() {
        return lastActivityAt;
    }

    public void setLastActivityAt(Instant lastActivityAt) {
        this.lastActivityAt = lastActivityAt;
    }
}
