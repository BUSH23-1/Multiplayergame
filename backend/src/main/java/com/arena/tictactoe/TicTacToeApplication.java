package com.arena.tictactoe;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main Spring Boot Application Entry Point.
 * Starts the Tic-Tac-Toe Arena real-time authoritative server on configured port.
 */
@SpringBootApplication
public class TicTacToeApplication {

    public static void main(String[] args) {
        SpringApplication.run(TicTacToeApplication.class, args);
        System.out.println("=================================================");
        System.out.println(" ⚔️  Tic-Tac-Toe Arena Game Server Started!      ");
        System.out.println(" STOMP WebSocket endpoint: /ws                   ");
        System.out.println(" REST API Base URL:        /api/game             ");
        System.out.println("=================================================");
    }
}
