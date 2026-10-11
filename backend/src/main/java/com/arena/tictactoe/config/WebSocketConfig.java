package com.arena.tictactoe.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Spring WebSocket Configuration using STOMP subprotocol and SockJS fallback.
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Destination prefix for broker broadcasts to clients
        config.enableSimpleBroker("/topic");
        // Prefix for messages bound for @MessageMapping annotated methods
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Primary STOMP endpoint with SockJS fallback
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();

        // Plain WebSocket endpoint for clients without SockJS
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*");
    }
}
