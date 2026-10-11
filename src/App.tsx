import React, { useState, useEffect } from 'react';
import { 
  Swords, 
  Code2, 
  Terminal, 
  BookOpen, 
  CheckCircle, 
  Award, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Columns, 
  User, 
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GameRoomState, PlayerSymbol, StompLogEntry } from './types/game';
import { gameEngine } from './services/gameEngine';
import { soundManager } from './services/soundEffects';
import { ArenaBoard } from './components/ArenaBoard';
import { DuelistCard } from './components/DuelistCard';
import { CodeExplorer } from './components/CodeExplorer';
import { StompInspector } from './components/StompInspector';
import { SetupGuide } from './components/SetupGuide';
import { TestChecklist } from './components/TestChecklist';
import { HandshakeSubmission } from './components/HandshakeSubmission';

export default function App() {
  const [activeTab, setActiveTab] = useState<'ARENA' | 'CODE' | 'STOMP' | 'SETUP' | 'TESTS' | 'HANDSHAKE'>('ARENA');
  const [room, setRoom] = useState<GameRoomState | null>(null);
  const [stompLogs, setStompLogs] = useState<StompLogEntry[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // User input states
  const [gladiatorName, setGladiatorName] = useState<string>('Maximus');
  const [joinCodeInput, setJoinCodeInput] = useState<string>('');
  const [toastMsg, setToastMsg] = useState<{ text: string; isError?: boolean } | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Play Mode: 'SINGLE' (regular view) or 'SPLIT' (dual side-by-side view to test 2 players right on screen!)
  const [dualView, setDualView] = useState<boolean>(true);

  useEffect(() => {
    const unsubRoom = gameEngine.subscribe((newRoom) => {
      setRoom(newRoom);
      if (newRoom?.winner) {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#7e8f47', '#e2c070', '#9db259', '#f4f1ea']
        });
      }
    });

    const unsubLogs = gameEngine.subscribeLogs((newLogs) => {
      setStompLogs(newLogs);
    });

    return () => {
      unsubRoom();
      unsubLogs();
    };
  }, []);

  const showToast = (text: string, isError = false) => {
    setToastMsg({ text, isError });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const copyRoomCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    showToast(`Copied Room Code "${code}" to clipboard!`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.enabled = next;
  };

  const handleCreateRoom = () => {
    try {
      const newRoom = gameEngine.createRoom(gladiatorName);
      showToast(`Arena Room ${newRoom.roomCode} created!`);
    } catch (e: any) {
      showToast(e.message, true);
    }
  };

  const handleJoinRoom = () => {
    if (!joinCodeInput || joinCodeInput.trim().length !== 6) {
      showToast('Please enter a 6-character room code.', true);
      return;
    }
    try {
      gameEngine.joinRoom(joinCodeInput, gladiatorName || 'Player 2');
      showToast(`Joined Arena ${joinCodeInput.toUpperCase()}!`);
    } catch (e: any) {
      showToast(e.message, true);
    }
  };

  const handleSimulateChallenger = () => {
    if (!room) return;
    try {
      gameEngine.joinRoom(room.roomCode, 'Aurelius (Challenger)');
      showToast('Challenger joined the arena!');
    } catch (e: any) {
      showToast(e.message, true);
    }
  };

  const handleCellClick = (index: number, symbol: PlayerSymbol) => {
    try {
      gameEngine.makeMove(index, symbol);
    } catch (e: any) {
      showToast(e.message, true);
    }
  };

  const handleRematch = (symbol: PlayerSymbol) => {
    try {
      gameEngine.requestRematch(symbol);
      showToast(`${symbol} voted for rematch!`);
    } catch (e: any) {
      showToast(e.message, true);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e1312] text-[#f4f1ea] flex flex-col font-sans selection:bg-[#7e8f47]/30 selection:text-[#f4f1ea] arena-bg-grid">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-2xl text-xs sm:text-sm font-medium animate-fadeIn ${
            toastMsg.isError
              ? 'bg-[#261515] border-[#d9534f] text-[#f8d7da]'
              : 'bg-[#15201a] border-[#7e8f47] text-[#f4f1ea] shadow-[0_0_20px_rgba(126,143,71,0.25)]'
          }`}
        >
          {toastMsg.isError ? (
            <AlertCircle className="w-4 h-4 text-[#d9534f]" />
          ) : (
            <Sparkles className="w-4 h-4 text-[#9db259]" />
          )}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Top Application Header */}
      <header className="sticky top-0 z-40 bg-[#0e1312]/90 backdrop-blur-md border-b border-[#283730] px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#151d1a] border border-[#3d5248] flex items-center justify-center text-xl shadow-md">
              ⚔️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-base sm:text-lg tracking-wider text-[#faf7f0]">
                  TIC-TAC-TOE ARENA
                </h1>
                <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-[#7e8f47]/20 border border-[#7e8f47]/50 text-[#b7ce67] font-semibold">
                  SPRING BOOT STOMP
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1">
            <button
              onClick={() => setActiveTab('ARENA')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'ARENA'
                  ? 'bg-[#7e8f47] text-[#0e1312] shadow-md font-bold'
                  : 'text-[#9c9789] hover:text-[#f4f1ea] hover:bg-[#16211c]'
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Live Arena</span>
            </button>

            <button
              onClick={() => setActiveTab('CODE')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'CODE'
                  ? 'bg-[#7e8f47] text-[#0e1312] shadow-md font-bold'
                  : 'text-[#9c9789] hover:text-[#f4f1ea] hover:bg-[#16211c]'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Spring Boot Source</span>
            </button>

            <button
              onClick={() => setActiveTab('STOMP')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'STOMP'
                  ? 'bg-[#7e8f47] text-[#0e1312] shadow-md font-bold'
                  : 'text-[#9c9789] hover:text-[#f4f1ea] hover:bg-[#16211c]'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>STOMP Inspector</span>
              {stompLogs.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-[#b7ce67] animate-pulse" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('SETUP')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'SETUP'
                  ? 'bg-[#7e8f47] text-[#0e1312] shadow-md font-bold'
                  : 'text-[#9c9789] hover:text-[#f4f1ea] hover:bg-[#16211c]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Setup & Deploy</span>
            </button>

            <button
              onClick={() => setActiveTab('TESTS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'TESTS'
                  ? 'bg-[#7e8f47] text-[#0e1312] shadow-md font-bold'
                  : 'text-[#9c9789] hover:text-[#f4f1ea] hover:bg-[#16211c]'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Play-Test Matrix</span>
            </button>

            <button
              onClick={() => setActiveTab('HANDSHAKE')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'HANDSHAKE'
                  ? 'bg-[#7e8f47] text-[#0e1312] shadow-md font-bold'
                  : 'text-[#9c9789] hover:text-[#f4f1ea] hover:bg-[#16211c]'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Handshake Package</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className="p-1.5 rounded-lg text-[#9c9789] hover:text-[#f4f1ea] hover:bg-[#16211c] transition-colors ml-1"
              title={soundEnabled ? 'Mute SFX' : 'Enable SFX'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-[#9db259]" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
        {/* TAB 1: LIVE ARENA */}
        {activeTab === 'ARENA' && (
          <div className="flex-1 flex flex-col">
            {/* View Sub-header */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-[#faf7f0]">
                  Grandmaster Duel Arena
                </h2>
                <p className="text-xs text-[#9c9789] mt-0.5">
                  Real-time authoritative match engine • Alternating turns enforced by server
                </p>
              </div>

              {room && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-[#141a18] border border-[#283730] rounded-lg">
                    <span className="text-xs text-[#9c9789]">Chamber:</span>
                    <strong className="text-xs font-mono-code text-[#b7ce67] tracking-wider">
                      {room.roomCode}
                    </strong>
                    <button
                      onClick={() => copyRoomCode(room.roomCode)}
                      className="text-[#9c9789] hover:text-[#f4f1ea]"
                      title="Copy code"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-[#9db259]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <button
                    onClick={() => setDualView(!dualView)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                      dualView
                        ? 'bg-[#1d2722] border-[#7e8f47] text-[#b7ce67]'
                        : 'bg-[#141a18] border-[#283730] text-[#9c9789]'
                    }`}
                    title="Toggle dual split-view to test both players simultaneously"
                  >
                    <Columns className="w-3.5 h-3.5" />
                    <span>Dual Player Split View</span>
                  </button>

                  <button
                    onClick={() => gameEngine.resetRoom()}
                    className="px-3 py-1.5 bg-[#141a18] border border-[#283730] hover:border-[#d9534f] text-xs text-[#9c9789] hover:text-[#d9534f] rounded-lg transition-colors"
                  >
                    Leave Match
                  </button>
                </div>
              )}
            </div>

            {/* If NO ROOM is active: Welcome / Room Creation Screen */}
            {!room ? (
              <div className="max-w-3xl w-full mx-auto my-auto p-6 sm:p-10 bg-[#141a18] border border-[#283730] rounded-2xl shadow-2xl text-center">
                <div className="inline-block px-3.5 py-1 bg-[#7e8f47]/15 border border-[#7e8f47]/30 rounded-full text-xs font-bold text-[#b7ce67] tracking-widest mb-4 uppercase">
                  Online Multiplayer Chamber
                </div>
                <h3 className="font-display text-2xl sm:text-4xl font-bold text-[#faf7f0] mb-3">
                  Step Onto the Battlefield
                </h3>
                <p className="text-xs sm:text-sm text-[#9c9789] max-w-xl mx-auto mb-8 leading-relaxed">
                  Connect across browser tabs or different devices over WebSockets. Create a chamber or enter a 6-character room code.
                </p>

                {/* Nickname Input */}
                <div className="max-w-sm mx-auto mb-8 text-left">
                  <label className="block text-xs font-bold text-[#9c9789] uppercase tracking-wider mb-2">
                    Gladiator Nickname
                  </label>
                  <input
                    type="text"
                    value={gladiatorName}
                    onChange={(e) => setGladiatorName(e.target.value)}
                    placeholder="Enter nickname"
                    maxLength={16}
                    className="w-full px-4 py-2.5 bg-[#0e1312] border border-[#283730] rounded-xl text-sm text-[#f4f1ea] outline-none focus:border-[#7e8f47] transition-all"
                  />
                </div>

                {/* Action Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  {/* Create Room Card */}
                  <div className="p-6 bg-[#0e1312] border border-[#283730] rounded-xl hover:border-[#3d5248] transition-all flex flex-col justify-between">
                    <div>
                      <div className="text-3xl mb-3">🏛️</div>
                      <h4 className="font-display font-bold text-base text-[#faf7f0] mb-1">
                        Create New Match
                      </h4>
                      <p className="text-xs text-[#9c9789] mb-5 leading-relaxed">
                        Become the Host, claim Player X, and generate a unique 6-character room code.
                      </p>
                    </div>
                    <button
                      onClick={handleCreateRoom}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-[#7e8f47] to-[#687738] hover:from-[#9db259] hover:to-[#7e8f47] text-[#0e1312] font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg active:scale-95"
                    >
                      <span>Create Chamber</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Join Room Card */}
                  <div className="p-6 bg-[#0e1312] border border-[#283730] rounded-xl hover:border-[#3d5248] transition-all flex flex-col justify-between">
                    <div>
                      <div className="text-3xl mb-3">⚔️</div>
                      <h4 className="font-display font-bold text-base text-[#faf7f0] mb-1">
                        Join Existing Duel
                      </h4>
                      <p className="text-xs text-[#9c9789] mb-4 leading-relaxed">
                        Enter a 6-character code shared by a friend to step in as Challenger (Player O).
                      </p>
                    </div>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={joinCodeInput}
                        onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                        placeholder="ROOM CODE"
                        maxLength={6}
                        className="w-full px-3 py-2 bg-[#141a18] border border-[#283730] rounded-xl text-center font-mono-code font-bold text-base text-[#e2c070] tracking-widest outline-none focus:border-[#7e8f47]"
                      />
                      <button
                        onClick={handleJoinRoom}
                        className="w-full py-2.5 px-4 bg-[#1a2520] hover:bg-[#22332a] border border-[#3d5248] hover:border-[#7e8f47] text-[#b7ce67] font-bold text-xs sm:text-sm rounded-xl transition-all active:scale-95"
                      >
                        Join Chamber
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : room.status === 'WAITING_FOR_PLAYER' ? (
              /* WAITING LOBBY */
              <div className="max-w-md w-full mx-auto my-auto p-8 bg-[#141a18] border border-[#283730] rounded-2xl shadow-2xl text-center">
                <div className="text-4xl mb-3 animate-bounce">🛡️</div>
                <h3 className="font-display text-xl font-bold text-[#faf7f0] mb-1">
                  Chamber Created
                </h3>
                <p className="text-xs text-[#9c9789] mb-6">
                  Share this room code with your opponent or simulate a challenger join:
                </p>

                <div className="flex items-center justify-center gap-3 p-4 bg-[#0e1312] border border-dashed border-[#7e8f47] rounded-xl mb-6">
                  <span className="font-mono-code text-3xl font-extrabold text-[#b7ce67] tracking-widest">
                    {room.roomCode}
                  </span>
                  <button
                    onClick={() => copyRoomCode(room.roomCode)}
                    className="p-2 rounded-lg bg-[#1a2520] border border-[#3d5248] text-xs text-[#ded8ca] hover:text-[#f4f1ea]"
                    title="Copy Room Code"
                  >
                    {copiedCode ? <Check className="w-4 h-4 text-[#9db259]" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleSimulateChallenger}
                    className="w-full py-3 px-4 bg-[#7e8f47] hover:bg-[#9db259] text-[#0e1312] font-bold text-xs rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Simulate Challenger Join (1-Click)</span>
                  </button>

                  <button
                    onClick={() => gameEngine.resetRoom()}
                    className="w-full py-2 px-4 bg-[#0e1312] border border-[#283730] text-xs text-[#9c9789] hover:text-[#ded8ca] rounded-xl transition-all"
                  >
                    Cancel & Leave
                  </button>
                </div>
              </div>
            ) : (
              /* ACTIVE GAME ARENA (Single or Dual Split View) */
              <div className="flex-1 flex flex-col justify-center">
                {/* Central Turn Banner */}
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div
                    className={`inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full border text-xs sm:text-sm font-bold tracking-wider shadow-lg ${
                      room.currentTurn === 'X'
                        ? 'bg-[#e2c070]/15 border-[#e2c070]/40 text-[#e2c070]'
                        : 'bg-[#9db259]/15 border-[#9db259]/40 text-[#9db259]'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-current animate-pulse" />
                    <span>
                      {room.status === 'IN_PROGRESS'
                        ? `ACTIVE TURN: ${room.currentTurn === 'X' ? room.playerX.username : room.playerO?.username} (${room.currentTurn})`
                        : room.status === 'FINISHED_X_WON'
                        ? `VICTORY: ${room.playerX.username} (X) WON!`
                        : room.status === 'FINISHED_O_WON'
                        ? `VICTORY: ${room.playerO?.username} (O) WON!`
                        : room.status === 'FINISHED_DRAW'
                        ? 'HONORABLE STALEMATE (DRAW)'
                        : 'MATCH PAUSED (DISCONNECTED)'}
                    </span>
                  </div>
                </div>

                {/* DUAL SPLIT-SCREEN VIEW vs SINGLE BOARD VIEW */}
                {dualView ? (
                  /* SPLIT VIEW: Side-by-side player perspectives */
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto w-full">
                    {/* Player 1 (X) Perspective */}
                    <div className="p-5 bg-[#141a18] border border-[#283730] rounded-2xl shadow-xl flex flex-col">
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#283730]">
                        <span className="text-xs font-bold text-[#e2c070] flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          <span>Player 1 View (X)</span>
                        </span>
                        <span className="text-[11px] text-[#9c9789]">
                          {room.currentTurn === 'X' ? '👉 Your Turn to Play' : 'Waiting for O...'}
                        </span>
                      </div>

                      <DuelistCard
                        player={room.playerX}
                        symbol="X"
                        isActiveTurn={room.currentTurn === 'X' && room.status === 'IN_PROGRESS'}
                        isCurrentClient={true}
                      />

                      <ArenaBoard
                        board={room.board}
                        winningLine={room.winningLine}
                        currentTurn={room.currentTurn}
                        playerSymbol="X"
                        isInteractive={room.status === 'IN_PROGRESS'}
                        onCellClick={(idx) => handleCellClick(idx, 'X')}
                      />

                      <div className="mt-auto pt-3 border-t border-[#283730] flex items-center justify-between text-xs">
                        <span className="text-[#9c9789]">Click board to place X</span>
                        {room.status !== 'IN_PROGRESS' && (
                          <button
                            onClick={() => handleRematch('X')}
                            className="px-3 py-1 rounded bg-[#7e8f47] text-[#0e1312] font-semibold text-xs hover:bg-[#9db259]"
                          >
                            Vote Rematch (X)
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Player 2 (O) Perspective */}
                    <div className="p-5 bg-[#141a18] border border-[#283730] rounded-2xl shadow-xl flex flex-col">
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#283730]">
                        <span className="text-xs font-bold text-[#9db259] flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          <span>Player 2 View (O)</span>
                        </span>
                        <span className="text-[11px] text-[#9c9789]">
                          {room.currentTurn === 'O' ? '👉 Your Turn to Play' : 'Waiting for X...'}
                        </span>
                      </div>

                      <DuelistCard
                        player={room.playerO}
                        symbol="O"
                        isActiveTurn={room.currentTurn === 'O' && room.status === 'IN_PROGRESS'}
                        isCurrentClient={true}
                      />

                      <ArenaBoard
                        board={room.board}
                        winningLine={room.winningLine}
                        currentTurn={room.currentTurn}
                        playerSymbol="O"
                        isInteractive={room.status === 'IN_PROGRESS'}
                        onCellClick={(idx) => handleCellClick(idx, 'O')}
                      />

                      <div className="mt-auto pt-3 border-t border-[#283730] flex items-center justify-between text-xs">
                        <span className="text-[#9c9789]">Click board to place O</span>
                        {room.status !== 'IN_PROGRESS' && (
                          <button
                            onClick={() => handleRematch('O')}
                            className="px-3 py-1 rounded bg-[#7e8f47] text-[#0e1312] font-semibold text-xs hover:bg-[#9db259]"
                          >
                            Vote Rematch (O)
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* SINGLE CENTERED BOARD VIEW */
                  <div className="max-w-md w-full mx-auto">
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <DuelistCard
                        player={room.playerX}
                        symbol="X"
                        isActiveTurn={room.currentTurn === 'X' && room.status === 'IN_PROGRESS'}
                      />
                      <DuelistCard
                        player={room.playerO}
                        symbol="O"
                        isActiveTurn={room.currentTurn === 'O' && room.status === 'IN_PROGRESS'}
                      />
                    </div>

                    <ArenaBoard
                      board={room.board}
                      winningLine={room.winningLine}
                      currentTurn={room.currentTurn}
                      isInteractive={room.status === 'IN_PROGRESS'}
                      onCellClick={(idx) => handleCellClick(idx, room.currentTurn)}
                    />

                    {room.status !== 'IN_PROGRESS' && (
                      <div className="p-4 bg-[#141a18] border border-[#7e8f47] rounded-xl text-center space-y-3 mt-4">
                        <h4 className="font-display font-bold text-base text-[#faf7f0]">
                          {room.status === 'FINISHED_X_WON'
                            ? `🏆 ${room.playerX.username} (X) Won!`
                            : room.status === 'FINISHED_O_WON'
                            ? `🏆 ${room.playerO?.username} (O) Won!`
                            : 'Honorable Stalemate (Draw)'}
                        </h4>
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => handleRematch('X')}
                            className="px-4 py-2 bg-[#7e8f47] text-[#0e1312] font-bold text-xs rounded-lg hover:bg-[#9db259]"
                          >
                            Request Rematch
                          </button>
                          <button
                            onClick={() => gameEngine.resetRoom()}
                            className="px-4 py-2 bg-[#1a2520] border border-[#3d5248] text-xs text-[#ded8ca] rounded-lg"
                          >
                            Return Home
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SPRING BOOT & FRONTEND CODE */}
        {activeTab === 'CODE' && <CodeExplorer />}

        {/* TAB 3: STOMP INSPECTOR */}
        {activeTab === 'STOMP' && (
          <StompInspector logs={stompLogs} onClear={() => setStompLogs([])} />
        )}

        {/* TAB 4: SETUP & DEPLOYMENT */}
        {activeTab === 'SETUP' && <SetupGuide />}

        {/* TAB 5: PLAY-TEST MATRIX */}
        {activeTab === 'TESTS' && <TestChecklist />}

        {/* TAB 6: HANDSHAKE SUBMISSION */}
        {activeTab === 'HANDSHAKE' && <HandshakeSubmission />}
      </main>

      {/* Footer */}
      <footer className="bg-[#0e1312] border-t border-[#283730] py-3 px-6 text-center text-xs text-[#9c9789]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <span>Tic-Tac-Toe Arena • Built for Handshake "Create a Multiplayer Game"</span>
          <span className="font-mono-code text-[11px] text-[#7e8f47]">
            Java 17 • Spring Boot 3.3.4 • Spring WebSocket (STOMP) • Vercel & Render
          </span>
        </div>
      </footer>
    </div>
  );
}
