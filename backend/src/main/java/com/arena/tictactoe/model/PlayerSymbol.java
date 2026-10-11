package com.arena.tictactoe.model;

/**
 * Symbol assigned to each player on the Tic-Tac-Toe grid.
 */
public enum PlayerSymbol {
    X,
    O;

    public PlayerSymbol opponent() {
        return this == X ? O : X;
    }
}
