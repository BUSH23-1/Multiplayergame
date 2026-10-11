package com.arena.tictactoe.model.dto;

public class CreateRoomRequest {
    private String username;

    public CreateRoomRequest() {}

    public CreateRoomRequest(String username) {
        this.username = username;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}
