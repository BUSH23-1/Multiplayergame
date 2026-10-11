export interface ProjectFileItem {
  path: string;
  filename: string;
  language: string;
  category: 'backend' | 'frontend' | 'config';
  description: string;
  content: string;
}

export const PROJECT_FILES: ProjectFileItem[] = [
  {
    path: 'backend/pom.xml',
    filename: 'pom.xml',
    language: 'xml',
    category: 'backend',
    description: 'Maven Project Object Model with Spring Boot 3.3.4, Spring Web, & Spring WebSocket',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.4</version>
        <relativePath/>
    </parent>
    
    <groupId>com.arena</groupId>
    <artifactId>tictactoe-arena-backend</artifactId>
    <version>1.0.0</version>
    <name>tictactoe-arena-backend</name>
    <description>Authoritative Tic-Tac-Toe Arena Server using Java 17 and Spring Boot STOMP WebSockets</description>

    <properties>
        <java.version>17</java.version>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <!-- Spring Boot Web for REST Controllers -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- Spring WebSocket & STOMP subprotocol -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-websocket</artifactId>
        </dependency>

        <!-- JSON Serialization -->
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
        </dependency>

        <!-- Spring Boot Test -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>`
  },
  {
    path: 'backend/src/main/resources/application.properties',
    filename: 'application.properties',
    language: 'properties',
    category: 'backend',
    description: 'Spring Boot server port and CORS configuration',
    content: `# Dynamic port for Render / Railway container runtime
server.port=\${PORT:8080}
spring.application.name=tictactoe-arena-backend

# CORS Allowed Origins (Comma-separated for local dev and production frontends)
app.cors.allowed-origins=\${ALLOWED_ORIGINS:http://localhost:3000,http://localhost:5173,http://127.0.0.1:5500,https://*.vercel.app}

# Logging configuration
logging.level.org.springframework.web.socket=INFO
logging.level.com.arena.tictactoe=DEBUG`
  },
  {
    path: 'backend/src/main/java/com/arena/tictactoe/TicTacToeApplication.java',
    filename: 'TicTacToeApplication.java',
    language: 'java',
    category: 'backend',
    description: 'Main Spring Boot application class',
    content: `package com.arena.tictactoe;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class TicTacToeApplication {
    public static void main(String[] args) {
        SpringApplication.run(TicTacToeApplication.class, args);
        System.out.println("⚔️ Tic-Tac-Toe Arena Authoritative Server Running on port: 8080");
        System.out.println("STOMP WebSocket endpoint: /ws");
    }
}`
  },
  {
    path: 'backend/src/main/java/com/arena/tictactoe/model/PlayerSymbol.java',
    filename: 'PlayerSymbol.java',
    language: 'java',
    category: 'backend',
    description: 'Enum representing X and O player symbols',
    content: `package com.arena.tictactoe.model;

public enum PlayerSymbol {
    X,
    O;

    public PlayerSymbol opponent() {
        return this == X ? O : X;
    }
}`
  },
  {
    path: 'backend/src/main/java/com/arena/tictactoe/model/GameStatus.java',
    filename: 'GameStatus.java',
    language: 'java',
    category: 'backend',
    description: 'Authoritative lifecycle states of a match',
    content: `package com.arena.tictactoe.model;

public enum GameStatus {
    WAITING_FOR_PLAYER,
    IN_PROGRESS,
    FINISHED_X_WON,
    FINISHED_O_WON,
    FINISHED_DRAW,
    PLAYER_DISCONNECTED,
    ABANDONED
}`
  },
  {
    path: 'backend/src/main/java/com/arena/tictactoe/model/Player.java',
    filename: 'Player.java',
    language: 'java',
    category: 'backend',
    description: 'Model for player entity, session ID, and status',
    content: `package com.arena.tictactoe.model;

import java.io.Serializable;
import java.time.Instant;

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

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public PlayerSymbol getSymbol() { return symbol; }
    public void setSymbol(PlayerSymbol symbol) { this.symbol = symbol; }
    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
    public boolean isConnected() { return connected; }
    public void setConnected(boolean connected) { this.connected = connected; }
    public boolean isWantsRematch() { return wantsRematch; }
    public void setWantsRematch(boolean wantsRematch) { this.wantsRematch = wantsRematch; }
    public Instant getJoinedAt() { return joinedAt; }
    public void setJoinedAt(Instant joinedAt) { this.joinedAt = joinedAt; }
}`
  },
  {
    path: 'backend/src/main/java/com/arena/tictactoe/model/GameRoom.java',
    filename: 'GameRoom.java',
    language: 'java',
    category: 'backend',
    description: 'Authoritative state for a room, 3x3 board array, and players',
    content: `package com.arena.tictactoe.model;

import java.io.Serializable;
import java.time.Instant;
import java.util.Arrays;

public class GameRoom implements Serializable {
    private String roomCode;
    private Player playerX;
    private Player playerO;
    private String[] board; // 9 elements: null, "X", or "O"
    private PlayerSymbol currentTurn;
    private GameStatus status;
    private PlayerSymbol winner;
    private int[] winningLine;
    private int moveCount;
    private String lastActionMessage;
    private Instant createdAt;
    private Instant lastActivityAt;

    public GameRoom() {
        this.board = new String[9];
        this.currentTurn = PlayerSymbol.X;
        this.status = GameStatus.WAITING_FOR_PLAYER;
        this.moveCount = 0;
        this.createdAt = Instant.now();
        this.lastActivityAt = Instant.now();
    }

    public GameRoom(String roomCode, Player host) {
        this();
        this.roomCode = roomCode;
        this.playerX = host;
        this.lastActionMessage = "Chamber created. Waiting for Player 2 to join...";
    }

    public void resetForRematch() {
        Arrays.fill(this.board, null);
        this.winner = null;
        this.winningLine = null;
        this.moveCount = 0;
        this.status = GameStatus.IN_PROGRESS;
        this.currentTurn = PlayerSymbol.X;
        if (this.playerX != null) this.playerX.setWantsRematch(false);
        if (this.playerO != null) this.playerO.setWantsRematch(false);
        this.lastActionMessage = "Rematch initiated! " + this.playerX.getUsername() + " (X) moves first.";
        this.lastActivityAt = Instant.now();
    }

    public boolean isFull() { return playerX != null && playerO != null; }

    public Player getPlayerBySymbol(PlayerSymbol symbol) {
        if (symbol == PlayerSymbol.X) return playerX;
        if (symbol == PlayerSymbol.O) return playerO;
        return null;
    }

    public Player getPlayerById(String playerId) {
        if (playerX != null && playerX.getId().equals(playerId)) return playerX;
        if (playerO != null && playerO.getId().equals(playerId)) return playerO;
        return null;
    }

    // Getters and Setters
    public String getRoomCode() { return roomCode; }
    public void setRoomCode(String roomCode) { this.roomCode = roomCode; }
    public Player getPlayerX() { return playerX; }
    public void setPlayerX(Player playerX) { this.playerX = playerX; }
    public Player getPlayerO() { return playerO; }
    public void setPlayerO(Player playerO) { this.playerO = playerO; }
    public String[] getBoard() { return board; }
    public void setBoard(String[] board) { this.board = board; }
    public PlayerSymbol getCurrentTurn() { return currentTurn; }
    public void setCurrentTurn(PlayerSymbol currentTurn) { this.currentTurn = currentTurn; }
    public GameStatus getStatus() { return status; }
    public void setStatus(GameStatus status) { this.status = status; }
    public PlayerSymbol getWinner() { return winner; }
    public void setWinner(PlayerSymbol winner) { this.winner = winner; }
    public int[] getWinningLine() { return winningLine; }
    public void setWinningLine(int[] winningLine) { this.winningLine = winningLine; }
    public int getMoveCount() { return moveCount; }
    public void setMoveCount(int moveCount) { this.moveCount = moveCount; }
    public String getLastActionMessage() { return lastActionMessage; }
    public void setLastActionMessage(String lastActionMessage) { this.lastActionMessage = lastActionMessage; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getLastActivityAt() { return lastActivityAt; }
    public void setLastActivityAt(Instant lastActivityAt) { this.lastActivityAt = lastActivityAt; }
}`
  },
  {
    path: 'backend/src/main/java/com/arena/tictactoe/service/GameService.java',
    filename: 'GameService.java',
    language: 'java',
    category: 'backend',
    description: 'Core game service: turn enforcement, move validation, win & draw detection',
    content: `package com.arena.tictactoe.service;

import com.arena.tictactoe.model.GameRoom;
import com.arena.tictactoe.model.GameStatus;
import com.arena.tictactoe.model.Player;
import com.arena.tictactoe.model.PlayerSymbol;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class GameService {

    private static final int[][] WINNING_LINES = {
        {0, 1, 2}, {3, 4, 5}, {6, 7, 8}, // Rows
        {0, 3, 6}, {1, 4, 7}, {2, 5, 8}, // Columns
        {0, 4, 8}, {2, 4, 6}             // Diagonals
    };

    private static final String CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final Map<String, GameRoom> rooms = new ConcurrentHashMap<>();
    private final Map<String, String> sessionToRoom = new ConcurrentHashMap<>();
    private final Map<String, String> sessionToPlayer = new ConcurrentHashMap<>();

    public String generateRoomCode() {
        StringBuilder sb = new StringBuilder(6);
        for (int i = 0; i < 6; i++) {
            sb.append(CODE_CHARS.charAt(RANDOM.nextInt(CODE_CHARS.length())));
        }
        return sb.toString();
    }

    public synchronized GameRoom createRoom(String hostUsername) {
        String cleanUsername = (hostUsername == null || hostUsername.trim().isEmpty())
                ? "Player 1" : hostUsername.trim();

        String roomCode;
        do {
            roomCode = generateRoomCode();
        } while (rooms.containsKey(roomCode));

        String hostId = "p-" + UUID.randomUUID().toString().substring(0, 8);
        Player host = new Player(hostId, cleanUsername, PlayerSymbol.X);

        GameRoom room = new GameRoom(roomCode, host);
        rooms.put(roomCode, room);
        return room;
    }

    public synchronized GameRoom joinRoom(String roomCode, String guestUsername) {
        String normalizedCode = roomCode.trim().toUpperCase();
        GameRoom room = rooms.get(normalizedCode);

        if (room == null) {
            throw new IllegalArgumentException("Room code '" + normalizedCode + "' not found.");
        }
        if (room.isFull()) {
            throw new IllegalStateException("Room '" + normalizedCode + "' is full (2/2 players).");
        }

        String cleanUsername = (guestUsername == null || guestUsername.trim().isEmpty())
                ? "Player 2" : guestUsername.trim();

        String guestId = "p-" + UUID.randomUUID().toString().substring(0, 8);
        Player guest = new Player(guestId, cleanUsername, PlayerSymbol.O);

        room.setPlayerO(guest);
        room.setStatus(GameStatus.IN_PROGRESS);
        room.setCurrentTurn(PlayerSymbol.X);
        room.setLastActionMessage("Challenger joined! " + room.getPlayerX().getUsername() + " (X) vs " + guest.getUsername() + " (O). X moves first.");
        room.setLastActivityAt(Instant.now());

        return room;
    }

    public GameRoom getRoom(String roomCode) {
        if (roomCode == null) return null;
        return rooms.get(roomCode.trim().toUpperCase());
    }

    public synchronized GameRoom makeMove(String roomCode, String playerId, int cellIndex) {
        GameRoom room = rooms.get(roomCode.trim().toUpperCase());
        if (room == null) throw new IllegalArgumentException("Room not found.");

        if (room.getStatus() != GameStatus.IN_PROGRESS) {
            throw new IllegalStateException("Match is not in progress.");
        }
        if (cellIndex < 0 || cellIndex > 8) {
            throw new IllegalArgumentException("Invalid cell index.");
        }

        String[] board = room.getBoard();
        if (board[cellIndex] != null) {
            throw new IllegalStateException("Cell " + cellIndex + " is already occupied.");
        }

        Player movingPlayer = room.getPlayerById(playerId);
        if (movingPlayer == null) {
            throw new IllegalArgumentException("Player not authorized.");
        }
        if (movingPlayer.getSymbol() != room.getCurrentTurn()) {
            throw new IllegalStateException("Not your turn. Waiting for " + room.getCurrentTurn() + ".");
        }

        PlayerSymbol moveSymbol = movingPlayer.getSymbol();
        board[cellIndex] = moveSymbol.name();
        room.setMoveCount(room.getMoveCount() + 1);
        room.setLastActivityAt(Instant.now());

        // Check for Win
        int[] winningLine = findWinningLine(board, moveSymbol.name());
        if (winningLine != null) {
            room.setWinner(moveSymbol);
            room.setWinningLine(winningLine);
            room.setStatus(moveSymbol == PlayerSymbol.X ? GameStatus.FINISHED_X_WON : GameStatus.FINISHED_O_WON);
            room.setLastActionMessage(movingPlayer.getUsername() + " (" + moveSymbol + ") wins the duel!");
            return room;
        }

        // Check for Draw
        if (isBoardFull(board)) {
            room.setStatus(GameStatus.FINISHED_DRAW);
            room.setLastActionMessage("Match concluded in an honorable draw!");
            return room;
        }

        // Toggle Turn
        PlayerSymbol nextTurn = moveSymbol.opponent();
        room.setCurrentTurn(nextTurn);
        Player nextPlayer = room.getPlayerBySymbol(nextTurn);
        room.setLastActionMessage("Turn passes to " + (nextPlayer != null ? nextPlayer.getUsername() : nextTurn) + " (" + nextTurn + ").");

        return room;
    }

    private int[] findWinningLine(String[] board, String symbol) {
        for (int[] line : WINNING_LINES) {
            if (symbol.equals(board[line[0]]) &&
                symbol.equals(board[line[1]]) &&
                symbol.equals(board[line[2]])) {
                return line;
            }
        }
        return null;
    }

    private boolean isBoardFull(String[] board) {
        for (String cell : board) {
            if (cell == null) return false;
        }
        return true;
    }

    public synchronized GameRoom requestRematch(String roomCode, String playerId) {
        GameRoom room = getRoom(roomCode);
        if (room == null) throw new IllegalArgumentException("Room not found.");

        Player player = room.getPlayerById(playerId);
        if (player == null) throw new IllegalArgumentException("Player not in room.");

        player.setWantsRematch(true);
        Player opponent = (player.getSymbol() == PlayerSymbol.X) ? room.getPlayerO() : room.getPlayerX();

        if (opponent == null || opponent.isWantsRematch()) {
            room.resetForRematch();
        } else {
            room.setLastActionMessage(player.getUsername() + " requested rematch. Waiting for opponent...");
        }
        return room;
    }

    public synchronized void registerSession(String sessionId, String roomCode, String playerId) {
        sessionToRoom.put(sessionId, roomCode.toUpperCase());
        sessionToPlayer.put(sessionId, playerId);
        GameRoom room = getRoom(roomCode);
        if (room != null) {
            Player p = room.getPlayerById(playerId);
            if (p != null) {
                p.setSessionId(sessionId);
                p.setConnected(true);
            }
        }
    }

    public synchronized GameRoom handleDisconnect(String sessionId) {
        String roomCode = sessionToRoom.remove(sessionId);
        String playerId = sessionToPlayer.remove(sessionId);
        if (roomCode != null && playerId != null) {
            GameRoom room = getRoom(roomCode);
            if (room != null) {
                Player player = room.getPlayerById(playerId);
                if (player != null) {
                    player.setConnected(false);
                    if (room.getStatus() == GameStatus.IN_PROGRESS) {
                        room.setStatus(GameStatus.PLAYER_DISCONNECTED);
                        room.setLastActionMessage(player.getUsername() + " disconnected.");
                    }
                }
                return room;
            }
        }
        return null;
    }

    public Map<String, GameRoom> getAllRooms() { return rooms; }
}`
  },
  {
    path: 'backend/src/main/java/com/arena/tictactoe/config/WebSocketConfig.java',
    filename: 'WebSocketConfig.java',
    language: 'java',
    category: 'backend',
    description: 'Spring STOMP Message Broker and SockJS endpoint registration',
    content: `package com.arena.tictactoe.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();

        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*");
    }
}`
  },
  {
    path: 'backend/src/main/java/com/arena/tictactoe/config/CorsConfig.java',
    filename: 'CorsConfig.java',
    language: 'java',
    category: 'backend',
    description: 'CORS policy mapping for Vercel and local dev origins',
    content: `package com.arena.tictactoe.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}`
  },
  {
    path: 'backend/src/main/java/com/arena/tictactoe/controller/GameRestController.java',
    filename: 'GameRestController.java',
    language: 'java',
    category: 'backend',
    description: 'REST Controller for creating/joining rooms and health check',
    content: `package com.arena.tictactoe.controller;

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

@RestController
@RequestMapping("/api/game")
public class GameRestController {

    private final GameService gameService;
    private final SimpMessagingTemplate messagingTemplate;

    public GameRestController(GameService gameService, SimpMessagingTemplate messagingTemplate) {
        this.gameService = gameService;
        this.messagingTemplate = messagingTemplate;
    }

    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "service", "Tic-Tac-Toe Arena Authoritative Server",
            "activeRooms", gameService.getAllRooms().size()
        ));
    }

    @PostMapping("/create")
    public ResponseEntity<?> createRoom(@RequestBody(required = false) CreateRoomRequest request) {
        String username = request != null ? request.getUsername() : "Player 1";
        GameRoom room = gameService.createRoom(username);
        Player host = room.getPlayerX();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(GameStateResponse.fromRoom(room, host.getId(), PlayerSymbol.X));
    }

    @PostMapping("/join")
    public ResponseEntity<?> joinRoom(@RequestBody JoinRoomRequest request) {
        try {
            GameRoom room = gameService.joinRoom(request.getRoomCode(), request.getUsername());
            Player guest = room.getPlayerO();
            GameStateResponse response = GameStateResponse.fromRoom(room, guest.getId(), PlayerSymbol.O);

            messagingTemplate.convertAndSend("/topic/room/" + room.getRoomCode(), response);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/room/{code}")
    public ResponseEntity<?> getRoomState(@PathVariable("code") String code) {
        GameRoom room = gameService.getRoom(code);
        if (room == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Room not found."));
        return ResponseEntity.ok(GameStateResponse.fromRoom(room));
    }

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
}`
  },
  {
    path: 'backend/src/main/java/com/arena/tictactoe/controller/GameWebSocketController.java',
    filename: 'GameWebSocketController.java',
    language: 'java',
    category: 'backend',
    description: 'STOMP Controller routing /app/move and /app/rematch broadcasts',
    content: `package com.arena.tictactoe.controller;

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

@Controller
public class GameWebSocketController {

    private final GameService gameService;
    private final SimpMessagingTemplate messagingTemplate;

    public GameWebSocketController(GameService gameService, SimpMessagingTemplate messagingTemplate) {
        this.gameService = gameService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/move")
    public void handleMove(@Payload MoveMessage message) {
        String roomCode = message.getRoomCode();
        try {
            GameRoom updatedRoom = gameService.makeMove(roomCode, message.getPlayerId(), message.getCellIndex());
            GameStateResponse response = GameStateResponse.fromRoom(updatedRoom);
            messagingTemplate.convertAndSend("/topic/room/" + roomCode.toUpperCase(), response);
        } catch (Exception e) {
            messagingTemplate.convertAndSend(
                "/topic/room/" + roomCode.toUpperCase(),
                Map.of("type", "ERROR", "message", e.getMessage(), "playerId", message.getPlayerId())
            );
        }
    }

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

    @MessageMapping("/join-announce")
    public void handleJoinAnnounce(@Payload Map<String, String> payload, SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();
        String roomCode = payload.get("roomCode");
        String playerId = payload.get("playerId");

        if (sessionId != null && roomCode != null && playerId != null) {
            gameService.registerSession(sessionId, roomCode, playerId);
            GameRoom room = gameService.getRoom(roomCode);
            if (room != null) {
                messagingTemplate.convertAndSend("/topic/room/" + roomCode.toUpperCase(), GameStateResponse.fromRoom(room));
            }
        }
    }
}`
  },
  {
    path: 'backend/src/main/java/com/arena/tictactoe/listener/WebSocketEventListener.java',
    filename: 'WebSocketEventListener.java',
    language: 'java',
    category: 'backend',
    description: 'Detects socket disconnect events and alerts active opponent',
    content: `package com.arena.tictactoe.listener;

import com.arena.tictactoe.model.GameRoom;
import com.arena.tictactoe.model.dto.GameStateResponse;
import com.arena.tictactoe.service.GameService;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

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
            messagingTemplate.convertAndSend(
                "/topic/room/" + affectedRoom.getRoomCode(),
                GameStateResponse.fromRoom(affectedRoom)
            );
        }
    }
}`
  },
  {
    path: 'backend/Dockerfile',
    filename: 'Dockerfile',
    language: 'dockerfile',
    category: 'backend',
    description: 'Multi-stage Dockerfile for Render / Railway / Cloud deployment',
    content: `FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
ENV PORT=8080
EXPOSE 8080
ENTRYPOINT ["java", "-Dserver.port=\${PORT}", "-jar", "app.jar"]`
  },
  {
    path: 'frontend/index.html',
    filename: 'index.html',
    language: 'html',
    category: 'frontend',
    description: 'HTML5 interface with olive & ink theme, SockJS, and STOMP CDNs',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Tic-Tac-Toe Arena — Real-Time Multiplayer</title>
  <link rel="stylesheet" href="style.css" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/sockjs-client/1.6.1/sockjs.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/stomp.js/2.3.3/stomp.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js"></script>
</head>
<body>
  <!-- See full file in frontend/index.html -->
</body>
</html>`
  },
  {
    path: 'frontend/style.css',
    filename: 'style.css',
    language: 'css',
    category: 'frontend',
    description: 'Olive and Ink CSS theme with responsive 3x3 board and glowing states',
    content: `/* See full style.css file in repository */`
  },
  {
    path: 'frontend/app.js',
    filename: 'app.js',
    language: 'javascript',
    category: 'frontend',
    description: 'Vanilla JavaScript client connecting over STOMP WebSockets and REST APIs',
    content: `// See full app.js file in repository`
  },
  {
    path: 'frontend/vercel.json',
    filename: 'vercel.json',
    language: 'json',
    category: 'frontend',
    description: 'Vercel deployment rewrite rules and CORS headers',
    content: `{
  "version": 2,
  "name": "tic-tac-toe-arena-frontend",
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}`
  }
];
