package com.arena.tictactoe.controller;

import com.arena.tictactoe.model.GameRoom;
import com.arena.tictactoe.model.dto.GameStateResponse;
import com.arena.tictactoe.model.dto.MoveMessage;
import com.arena.tictactoe.model.dto.RematchRequest;
import com.arena.tictactoe.service.GameService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;

/**
 * STOMP WebSocket Message Controller.
 * Handles client actions routed through `/app/*` and broadcasts authoritative
 * updates to `/topic/room/{roomCode}`.
 */
@Controller
public class GameWebSocketController {

    private final GameService gameService;
    private final SimpMessagingTemplate messagingTemplate;

    public GameWebSocketController(GameService gameService, SimpMessagingTemplate messagingTemplate) {
        this.gameService = gameService;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Handles moves submitted by clients via STOMP: destination /app/move
     */
    @MessageMapping("/move")
    public void handleMove(@Payload MoveMessage message, SimpMessageHeaderAccessor headerAccessor) {
        String roomCode = message.getRoomCode();
        try {
            GameRoom updatedRoom = gameService.makeMove(
                roomCode,
                message.getPlayerId(),
                message.getCellIndex()
            );

            // Broadcast authoritative game state to both players
            GameStateResponse response = GameStateResponse.fromRoom(updatedRoom);
            messagingTemplate.convertAndSend("/topic/room/" + roomCode.toUpperCase(), response);

        } catch (Exception e) {
            // Send error event back to room topic
            messagingTemplate.convertAndSend(
                "/topic/room/" + roomCode.toUpperCase(),
                Map.of(
                    "type", "ERROR",
                    "message", e.getMessage(),
                    "playerId", message.getPlayerId()
                )
            );
        }
    }

    /**
     * Handles rematch requests: destination /app/rematch
     */
    @MessageMapping("/rematch")
    public void handleRematch(@Payload RematchRequest request) {
        String roomCode = request.getRoomCode();
        try {
            GameRoom updatedRoom = gameService.requestRematch(roomCode, request.getPlayerId());
            GameStateResponse response = GameStateResponse.fromRoom(updatedRoom);
            messagingTemplate.convertAndSend("/topic/room/" + roomCode.toUpperCase(), response);
        } catch (Exception e) {
            messagingTemplate.convertAndSend(
                "/topic/room/" + roomCode.toUpperCase(),
                Map.of("type", "ERROR", "message", e.getMessage())
            );
        }
    }

    /**
     * Associates the WebSocket session with the room and player: destination /app/join-announce
     */
    @MessageMapping("/join-announce")
    public void handleJoinAnnounce(@Payload Map<String, String> payload, SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();
        String roomCode = payload.get("roomCode");
        String playerId = payload.get("playerId");

        if (sessionId != null && roomCode != null && playerId != null) {
            gameService.registerSession(sessionId, roomCode, playerId);
            GameRoom room = gameService.getRoom(roomCode);
            if (room != null) {
                GameStateResponse response = GameStateResponse.fromRoom(room);
                messagingTemplate.convertAndSend("/topic/room/" + roomCode.toUpperCase(), response);
            }
        }
    }
}
