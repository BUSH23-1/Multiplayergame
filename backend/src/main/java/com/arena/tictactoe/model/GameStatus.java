package com.arena.tictactoe.model;

/**
 * Lifecycle states of an online Tic-Tac-Toe Arena match.
 */
public enum GameStatus {
    WAITING_FOR_PLAYER,   // Host created room, waiting for player 2
    IN_PROGRESS,          // Both players connected, game active
    FINISHED_X_WON,       // Player X completed 3 in a row
    FINISHED_O_WON,       // Player O completed 3 in a row
    FINISHED_DRAW,        // All 9 cells occupied with no winner
    PLAYER_DISCONNECTED,  // One player disconnected unexpectedly
    ABANDONED             // Match cancelled or closed
}
