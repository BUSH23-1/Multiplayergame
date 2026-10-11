package com.arena.tictactoe.model.dto;

import com.arena.tictactoe.model.PlayerSymbol;

public class MoveMessage {
    private String roomCode;
    private String playerId;
    private PlayerSymbol symbol;
    private int cellIndex; // 0 to 8

    public MoveMessage() {}

    public MoveMessage(String roomCode, String playerId, PlayerSymbol symbol, int cellIndex) {
        this.roomCode = roomCode;
        this.playerId = playerId;
        this.symbol = symbol;
        this.cellIndex = cellIndex;
    }

    public String getRoomCode() {
        return roomCode;
    }

    public void setRoomCode(String roomCode) {
        this.roomCode = roomCode;
    }

    public String getPlayerId() {
        return playerId;
    }

    public void setPlayerId(String playerId) {
        this.playerId = playerId;
    }

    public PlayerSymbol getSymbol() {
        return symbol;
    }

    public void setSymbol(PlayerSymbol symbol) {
        this.symbol = symbol;
    }

    public int getCellIndex() {
        return cellIndex;
    }

    public void setCellIndex(int cellIndex) {
        this.cellIndex = cellIndex;
    }
}
