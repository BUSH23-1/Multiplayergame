package com.arena.tictactoe.controller;

import com.arena.tictactoe.model.GameRoom;
import com.arena.tictactoe.model.Player;
import com.arena.tictactoe.model.PlayerSymbol;
import com.arena.tictactoe.model.dto.CreateRoomRequest;
import com.arena.tictactoe.model.dto.GameStateResponse;
import com.arena.tictactoe.model.dto.JoinRoomRequest;
import com.arena.tictactoe.model.dto.MoveMessage;
import com.arena.tictactoe.service.GameService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST API Controller for Room Management, Initial Handshake, and Diagnostics.
 */
@RestController
@RequestMapping("/api/game")
public class GameRestController {

    private final GameService gameService;
    private final SimpMessagingTemplate messagingTemplate;

    public GameRestController(GameService gameService, SimpMessagingTemplate messagingTemplate) {
        this.gameService = gameService;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Health check endpoint for Render/deployment pinging.
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "service", "Tic-Tac-Toe Arena Authoritative Server",
            "activeRooms", gameService.getAllRooms().size()
        ));
    }

    /**
     * Creates a new multiplayer room.
     */
    @PostMapping("/create")
    public ResponseEntity<?> createRoom(@RequestBody(required = false) CreateRoomRequest request) {
        String username = request != null ? request.getUsername() : "Player 1";
        GameRoom room = gameService.createRoom(username);
        Player host = room.getPlayerX();

        GameStateResponse response = GameStateResponse.fromRoom(room, host.getId(), PlayerSymbol.X);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Joins an existing room by room code.
     */
    @PostMapping("/join")
    public ResponseEntity<?> joinRoom(@RequestBody JoinRoomRequest request) {
        if (request == null || request.getRoomCode() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Room code is required."));
        }

        try {
            GameRoom room = gameService.joinRoom(request.getRoomCode(), request.getUsername());
            Player guest = room.getPlayerO();

            GameStateResponse response = GameStateResponse.fromRoom(room, guest.getId(), PlayerSymbol.O);

            // Broadcast room state to any already subscribed players (Host waiting in WebSocket)
            messagingTemplate.convertAndSend("/topic/room/" + room.getRoomCode(), response);

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Fetches current state of a room.
     */
    @GetMapping("/room/{code}")
    public ResponseEntity<?> getRoomState(@PathVariable("code") String code) {
        GameRoom room = gameService.getRoom(code);
        if (room == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Room not found."));
        }
        return ResponseEntity.ok(GameStateResponse.fromRoom(room));
    }

    /**
     * REST endpoint for moves (fallback or alternate to WebSocket).
     */
    @PostMapping("/move")
    public ResponseEntity<?> makeMove(@RequestBody MoveMessage move) {
        try {
            GameRoom room = gameService.makeMove(move.getRoomCode(), move.getPlayerId(), move.getCellIndex());
            GameStateResponse response = GameStateResponse.fromRoom(room);
            messagingTemplate.convertAndSend("/topic/room/" + room.getRoomCode(), response);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
