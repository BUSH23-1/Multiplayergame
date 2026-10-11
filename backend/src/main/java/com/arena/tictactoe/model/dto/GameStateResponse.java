package com.arena.tictactoe.model.dto;

import com.arena.tictactoe.model.GameRoom;
import com.arena.tictactoe.model.GameStatus;
import com.arena.tictactoe.model.Player;
import com.arena.tictactoe.model.PlayerSymbol;

public class GameStateResponse {
    private String roomCode;
    private Player playerX;
    private Player playerO;
    private String[] board;
    private PlayerSymbol currentTurn;
    private GameStatus status;
    private PlayerSymbol winner;
    private int[] winningLine;
    private int moveCount;
    private String message;
    private String assignedPlayerId; // Set in response to create/join for client recognition
    private PlayerSymbol assignedSymbol;

    public GameStateResponse() {}

    public static GameStateResponse fromRoom(GameRoom room, String assignedPlayerId, PlayerSymbol assignedSymbol) {
        GameStateResponse res = new GameStateResponse();
        res.setRoomCode(room.getRoomCode());
        res.setPlayerX(room.getPlayerX());
        res.setPlayerO(room.getPlayerO());
        res.setBoard(room.getBoard());
        res.setCurrentTurn(room.getCurrentTurn());
        res.setStatus(room.getStatus());
        res.setWinner(room.getWinner());
        res.setWinningLine(room.getWinningLine());
        res.setMoveCount(room.getMoveCount());
        res.setMessage(room.getLastActionMessage());
        res.setAssignedPlayerId(assignedPlayerId);
        res.setAssignedSymbol(assignedSymbol);
        return res;
    }

    public static GameStateResponse fromRoom(GameRoom room) {
        return fromRoom(room, null, null);
    }

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

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getAssignedPlayerId() {
        return assignedPlayerId;
    }

    public void setAssignedPlayerId(String assignedPlayerId) {
        this.assignedPlayerId = assignedPlayerId;
    }

    public PlayerSymbol getAssignedSymbol() {
        return assignedSymbol;
    }

    public void setAssignedSymbol(PlayerSymbol assignedSymbol) {
        this.assignedSymbol = assignedSymbol;
    }
}
