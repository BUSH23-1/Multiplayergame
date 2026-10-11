package com.arena.tictactoe.model.dto;

public class RematchRequest {
    private String roomCode;
    private String playerId;

    public RematchRequest() {}

    public RematchRequest(String roomCode, String playerId) {
        this.roomCode = roomCode;
        this.playerId = playerId;
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
}
