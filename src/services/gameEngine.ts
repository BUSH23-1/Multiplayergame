import { GameRoomState, GameStatus, Player, PlayerSymbol, StompLogEntry } from '../types/game';
import { soundManager } from './soundEffects';

const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

class GameEngine {
  private channel: BroadcastChannel | null = null;
  private currentRoom: GameRoomState | null = null;
  private logs: StompLogEntry[] = [];
  private listeners: ((room: GameRoomState | null) => void)[] = [];
  private logListeners: ((logs: StompLogEntry[]) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('ttt_arena_channel');
        this.channel.onmessage = (event) => {
          const { type, payload } = event.data;
          if (type === 'ROOM_SYNC') {
            this.currentRoom = payload;
            this.notify();
          } else if (type === 'STOMP_LOG') {
            this.appendLog(payload, false);
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel error:', e);
      }
    }
  }

  private generateCode(): string {
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += CODE_CHARS.charAt(Math.floor(Math.random() * CODE_CHARS.length));
    }
    return result;
  }

  private appendLog(entry: StompLogEntry, broadcast: boolean = true) {
    this.logs = [entry, ...this.logs.slice(0, 99)];
    this.notifyLogs();
    if (broadcast && this.channel) {
      this.channel.postMessage({ type: 'STOMP_LOG', payload: entry });
    }
  }

  private logFrame(direction: 'OUT' | 'IN' | 'SYSTEM', command: string, payload: string, destination?: string) {
    const entry: StompLogEntry = {
      id: 'stomp-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      direction,
      command,
      destination,
      payload
    };
    this.appendLog(entry);
  }

  public getRoom(): GameRoomState | null {
    return this.currentRoom;
  }

  public getLogs(): StompLogEntry[] {
    return this.logs;
  }

  public subscribe(fn: (room: GameRoomState | null) => void) {
    this.listeners.push(fn);
    fn(this.currentRoom);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  public subscribeLogs(fn: (logs: StompLogEntry[]) => void) {
    this.logListeners.push(fn);
    fn(this.logs);
    return () => {
      this.logListeners = this.logListeners.filter(l => l !== fn);
    };
  }

  private notify() {
    this.listeners.forEach(fn => fn(this.currentRoom));
    if (this.channel && this.currentRoom) {
      this.channel.postMessage({ type: 'ROOM_SYNC', payload: this.currentRoom });
    }
  }

  private notifyLogs() {
    this.logListeners.forEach(fn => fn(this.logs));
  }

  public createRoom(hostName: string = 'Player 1'): GameRoomState {
    const code = this.generateCode();
    const host: Player = {
      id: 'p-' + Math.random().toString(36).substring(2, 9),
      username: hostName.trim() || 'Player 1',
      symbol: 'X',
      connected: true,
      wantsRematch: false,
      joinedAt: new Date().toISOString()
    };

    const room: GameRoomState = {
      roomCode: code,
      playerX: host,
      playerO: null,
      board: Array(9).fill(null),
      currentTurn: 'X',
      status: 'WAITING_FOR_PLAYER',
      winner: null,
      winningLine: null,
      moveCount: 0,
      lastActionMessage: 'Room created. Waiting for Player 2 to enter room code.',
      createdAt: new Date().toISOString()
    };

    this.currentRoom = room;

    // Simulate STOMP connection & subscription
    this.logFrame('OUT', 'CONNECT', 'accept-version:1.1,1.2\nheart-beat:10000,10000');
    this.logFrame('IN', 'CONNECTED', 'version:1.2\nheart-beat:10000,10000\nsession:sess-' + host.id);
    this.logFrame('OUT', 'SUBSCRIBE', `id:sub-0\ndestination:/topic/room/${code}`);
    this.logFrame('SYSTEM', 'REST POST', `/api/game/create => HTTP 201 Created (Room: ${code})`);

    this.notify();
    return room;
  }

  public joinRoom(roomCode: string, guestName: string = 'Player 2'): GameRoomState {
    const norm = roomCode.trim().toUpperCase();
    if (!this.currentRoom || this.currentRoom.roomCode !== norm) {
      // In simulation mode, let's create a simulated host if not present
      const host: Player = {
        id: 'p-host-sim',
        username: 'Gladiator_Prime',
        symbol: 'X',
        connected: true,
        wantsRematch: false,
        joinedAt: new Date().toISOString()
      };
      this.currentRoom = {
        roomCode: norm,
        playerX: host,
        playerO: null,
        board: Array(9).fill(null),
        currentTurn: 'X',
        status: 'WAITING_FOR_PLAYER',
        winner: null,
        winningLine: null,
        moveCount: 0,
        lastActionMessage: 'Room created.',
        createdAt: new Date().toISOString()
      };
    }

    if (this.currentRoom.playerO && this.currentRoom.playerO.connected) {
      throw new Error(`Room '${norm}' is already full (maximum 2 players).`);
    }

    const guest: Player = {
      id: 'p-' + Math.random().toString(36).substring(2, 9),
      username: guestName.trim() || 'Player 2',
      symbol: 'O',
      connected: true,
      wantsRematch: false,
      joinedAt: new Date().toISOString()
    };

    this.currentRoom.playerO = guest;
    this.currentRoom.status = 'IN_PROGRESS';
    this.currentRoom.currentTurn = 'X';
    this.currentRoom.lastActionMessage = `Match started! ${this.currentRoom.playerX.username} (X) vs ${guest.username} (O). Turn: X`;

    this.logFrame('OUT', 'CONNECT', 'accept-version:1.1,1.2\nclient:stomp-web');
    this.logFrame('IN', 'CONNECTED', 'session:sess-' + guest.id);
    this.logFrame('OUT', 'SUBSCRIBE', `id:sub-1\ndestination:/topic/room/${norm}`);
    this.logFrame('OUT', 'SEND', JSON.stringify({ roomCode: norm, playerId: guest.id }), '/app/join-announce');
    this.logFrame('IN', 'MESSAGE', JSON.stringify({ status: 'IN_PROGRESS', playerO: guest.username }), `/topic/room/${norm}`);

    this.notify();
    return this.currentRoom;
  }

  public makeMove(cellIndex: number, requestingSymbol: PlayerSymbol, requestingPlayerId?: string): GameRoomState {
    if (!this.currentRoom) throw new Error('No active room found.');
    const r = this.currentRoom;

    if (r.status !== 'IN_PROGRESS') {
      throw new Error(`Cannot move: game is in status '${r.status}'.`);
    }

    if (cellIndex < 0 || cellIndex > 8) {
      throw new Error('Invalid cell position.');
    }

    if (r.board[cellIndex] !== null) {
      soundManager.playError();
      throw new Error(`Cell ${cellIndex} is already occupied by ${r.board[cellIndex]}.`);
    }

    if (r.currentTurn !== requestingSymbol) {
      soundManager.playError();
      throw new Error(`It is not ${requestingSymbol}'s turn. Current turn is ${r.currentTurn}.`);
    }

    // Apply move
    r.board[cellIndex] = requestingSymbol;
    r.moveCount += 1;
    soundManager.playMove(requestingSymbol);

    // Check winning combinations
    let winningLine: number[] | null = null;
    for (const line of WINNING_LINES) {
      if (
        r.board[line[0]] === requestingSymbol &&
        r.board[line[1]] === requestingSymbol &&
        r.board[line[2]] === requestingSymbol
      ) {
        winningLine = line;
        break;
      }
    }

    if (winningLine) {
      r.winner = requestingSymbol;
      r.winningLine = winningLine;
      r.status = requestingSymbol === 'X' ? 'FINISHED_X_WON' : 'FINISHED_O_WON';
      const winnerName = requestingSymbol === 'X' ? r.playerX.username : r.playerO?.username;
      r.lastActionMessage = `🏆 ${winnerName} (${requestingSymbol}) won the match!`;
      soundManager.playWin();

      this.logFrame('OUT', 'SEND', JSON.stringify({ roomCode: r.roomCode, cellIndex, symbol: requestingSymbol }), '/app/move');
      this.logFrame('IN', 'MESSAGE', JSON.stringify({ status: r.status, winner: requestingSymbol, winningLine }), `/topic/room/${r.roomCode}`);
      this.notify();
      return r;
    }

    // Check draw
    const isFull = r.board.every(c => c !== null);
    if (isFull) {
      r.status = 'FINISHED_DRAW';
      r.lastActionMessage = 'Honorable Stalemate! All cells are occupied.';
      this.logFrame('OUT', 'SEND', JSON.stringify({ roomCode: r.roomCode, cellIndex, symbol: requestingSymbol }), '/app/move');
      this.logFrame('IN', 'MESSAGE', JSON.stringify({ status: 'FINISHED_DRAW' }), `/topic/room/${r.roomCode}`);
      this.notify();
      return r;
    }

    // Next turn
    r.currentTurn = requestingSymbol === 'X' ? 'O' : 'X';
    const nextPlayerName = r.currentTurn === 'X' ? r.playerX.username : r.playerO?.username;
    r.lastActionMessage = `Move registered at cell ${cellIndex}. Turn passes to ${nextPlayerName} (${r.currentTurn}).`;

    this.logFrame('OUT', 'SEND', JSON.stringify({ roomCode: r.roomCode, cellIndex, symbol: requestingSymbol }), '/app/move');
    this.logFrame('IN', 'MESSAGE', JSON.stringify({ board: r.board, currentTurn: r.currentTurn }), `/topic/room/${r.roomCode}`);

    this.notify();
    return r;
  }

  public requestRematch(symbol: PlayerSymbol): GameRoomState {
    if (!this.currentRoom) throw new Error('No active room.');
    const r = this.currentRoom;

    if (symbol === 'X') r.playerX.wantsRematch = true;
    if (symbol === 'O' && r.playerO) r.playerO.wantsRematch = true;

    const bothReady = r.playerX.wantsRematch && (r.playerO ? r.playerO.wantsRematch : true);

    if (bothReady) {
      r.board = Array(9).fill(null);
      r.winner = null;
      r.winningLine = null;
      r.moveCount = 0;
      r.status = 'IN_PROGRESS';
      r.currentTurn = 'X';
      r.playerX.wantsRematch = false;
      if (r.playerO) r.playerO.wantsRematch = false;
      r.lastActionMessage = 'Rematch started! X makes the opening move.';

      this.logFrame('OUT', 'SEND', JSON.stringify({ roomCode: r.roomCode }), '/app/rematch');
      this.logFrame('IN', 'MESSAGE', JSON.stringify({ status: 'IN_PROGRESS', message: 'Rematch started' }), `/topic/room/${r.roomCode}`);
    } else {
      const requester = symbol === 'X' ? r.playerX.username : r.playerO?.username;
      r.lastActionMessage = `${requester} voted for a rematch. Waiting for opponent...`;
      this.logFrame('OUT', 'SEND', JSON.stringify({ roomCode: r.roomCode, symbol }), '/app/rematch');
    }

    this.notify();
    return r;
  }

  public simulateDisconnect(symbol: PlayerSymbol) {
    if (!this.currentRoom) return;
    const r = this.currentRoom;
    if (symbol === 'X') r.playerX.connected = false;
    if (symbol === 'O' && r.playerO) r.playerO.connected = false;
    r.status = 'PLAYER_DISCONNECTED';
    r.lastActionMessage = `Player ${symbol} disconnected from the socket session.`;
    this.logFrame('SYSTEM', 'EVENT', `SessionDisconnectEvent: Player ${symbol} closed session`);
    this.logFrame('IN', 'MESSAGE', JSON.stringify({ status: 'PLAYER_DISCONNECTED' }), `/topic/room/${r.roomCode}`);
    this.notify();
  }

  public resetRoom() {
    this.currentRoom = null;
    this.notify();
  }
}

export const gameEngine = new GameEngine();
