package com.arena.tictactoe.listener;

import com.arena.tictactoe.model.GameRoom;
import com.arena.tictactoe.model.dto.GameStateResponse;
import com.arena.tictactoe.service.GameService;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

/**
 * Listens for WebSocket session disconnect events to cleanly detect
 * when a player closes their tab, drops Wi-Fi, or leaves the arena.
 */
@Component
public class WebSocketEventListener {

    private final GameService gameService;
    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketEventListener(GameService gameService, SimpMessagingTemplate messagingTemplate) {
        this.gameService = gameService;
        this.messagingTemplate = messagingTemplate;
    }

    @EventListener
    public void handleSessionDisconnect(SessionDisconnectEvent event) {
        String sessionId = event.getSessionId();
        GameRoom affectedRoom = gameService.handleDisconnect(sessionId);
        if (affectedRoom != null) {
            GameStateResponse response = GameStateResponse.fromRoom(affectedRoom);
            messagingTemplate.convertAndSend(
                "/topic/room/" + affectedRoom.getRoomCode(),
                response
            );
        }
    }
}
