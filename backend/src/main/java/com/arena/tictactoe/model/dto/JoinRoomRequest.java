package com.arena.tictactoe.model.dto;

public class JoinRoomRequest {
    private String roomCode;
    private String username;

    public JoinRoomRequest() {}

    public JoinRoomRequest(String roomCode, String username) {
        this.roomCode = roomCode;
        this.username = username;
    }

    public String getRoomCode() {
        return roomCode;
    }

    public void setRoomCode(String roomCode) {
        this.roomCode = roomCode;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}
