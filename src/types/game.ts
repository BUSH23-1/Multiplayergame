export type PlayerSymbol = 'X' | 'O';

export type GameStatus =
  | 'WAITING_FOR_PLAYER'
  | 'IN_PROGRESS'
  | 'FINISHED_X_WON'
  | 'FINISHED_O_WON'
  | 'FINISHED_DRAW'
  | 'PLAYER_DISCONNECTED';

export interface Player {
  id: string;
  username: string;
  symbol: PlayerSymbol;
  connected: boolean;
  wantsRematch: boolean;
  joinedAt: string;
}

export interface GameRoomState {
  roomCode: string;
  playerX: Player;
  playerO: Player | null;
  board: (PlayerSymbol | null)[]; // 9 items
  currentTurn: PlayerSymbol;
  status: GameStatus;
  winner: PlayerSymbol | null;
  winningLine: number[] | null;
  moveCount: number;
  lastActionMessage: string;
  createdAt: string;
}

export interface StompLogEntry {
  id: string;
  timestamp: string;
  direction: 'OUT' | 'IN' | 'SYSTEM';
  command: string;
  destination?: string;
  payload: string;
}
