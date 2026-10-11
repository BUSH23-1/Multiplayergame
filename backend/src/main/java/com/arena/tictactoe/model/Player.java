package com.arena.tictactoe.model;

import java.io.Serializable;
import java.time.Instant;

/**
 * Representation of a player in a game room.
 */
public class Player implements Serializable {
    private String id;
    private String username;
    private PlayerSymbol symbol;
    private String sessionId;
    private boolean connected;
    private boolean wantsRematch;
    private Instant joinedAt;

    public Player() {
        this.joinedAt = Instant.now();
        this.connected = true;
        this.wantsRematch = false;
    }

    public Player(String id, String username, PlayerSymbol symbol) {
        this();
        this.id = id;
        this.username = username;
        this.symbol = symbol;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public PlayerSymbol getSymbol() {
        return symbol;
    }

    public void setSymbol(PlayerSymbol symbol) {
        this.symbol = symbol;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public boolean isConnected() {
        return connected;
    }

    public void setConnected(boolean connected) {
        this.connected = connected;
    }

    public boolean isWantsRematch() {
        return wantsRematch;
    }

    public void setWantsRematch(boolean wantsRematch) {
        this.wantsRematch = wantsRematch;
    }

    public Instant getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(Instant joinedAt) {
        this.joinedAt = joinedAt;
    }
}
