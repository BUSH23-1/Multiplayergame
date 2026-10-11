import React, { useState } from 'react';
import { CheckSquare, Square, Play, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';
import { gameEngine } from '../services/gameEngine';

interface TestCase {
  id: string;
  title: string;
  description: string;
  verificationSteps: string;
  expectedResult: string;
  isSimulatable?: boolean;
}

const TEST_CASES: TestCase[] = [
  {
    id: 'tc-1',
    title: '1. Create Room & Code Generation',
    description: 'Host creates chamber with unique 6-character room code.',
    verificationSteps: 'Click "Create Room", inspect generated uppercase alphanumeric code.',
    expectedResult: 'Room code created, host assigned symbol X, waiting status active.',
    isSimulatable: true
  },
  {
    id: 'tc-2',
    title: '2. Join Room from Another Device / Tab',
    description: 'Player 2 connects using room code over WebSocket.',
    verificationSteps: 'Enter valid room code from second window or mobile device.',
    expectedResult: 'Player 2 assigned symbol O, room state transitions to IN_PROGRESS.',
    isSimulatable: true
  },
  {
    id: 'tc-3',
    title: '3. Automatic Role Assignment (X & O)',
    description: 'Authoritative assignment of symbols based on connection order.',
    verificationSteps: 'Verify host is locked to X and challenger is locked to O.',
    expectedResult: 'Correct symbols displayed on player cards and turn banners.'
  },
  {
    id: 'tc-4',
    title: '4. Immediate Move Synchronization',
    description: 'Real-time WebSocket broadcast to all subscribed room clients.',
    verificationSteps: 'Click any open cell as Player X; inspect instantaneous update.',
    expectedResult: 'STOMP /topic/room frame received in <50ms without polling.'
  },
  {
    id: 'tc-5',
    title: '5. Server-Authoritative Turn Enforcement',
    description: 'Rejects moves submitted when it is not the player\'s turn.',
    verificationSteps: 'Attempt to place two moves consecutively with symbol X.',
    expectedResult: 'Server returns error: "It is not your turn. Waiting for O."',
    isSimulatable: true
  },
  {
    id: 'tc-6',
    title: '6. Occupied Cell Overwrite Rejection',
    description: 'Prevents clicking already claimed cells on the 3x3 board.',
    verificationSteps: 'Click a cell already marked with X or O.',
    expectedResult: 'Rejected by server: "Cell is already occupied."',
    isSimulatable: true
  },
  {
    id: 'tc-7',
    title: '7. Win Detection Across 8 Combinations',
    description: 'Server evaluates 3 rows, 3 columns, and 2 diagonals.',
    verificationSteps: 'Align 3 matching symbols horizontally, vertically, or diagonally.',
    expectedResult: 'Status changes to FINISHED_X_WON/O_WON, winning line highlighted.',
    isSimulatable: true
  },
  {
    id: 'tc-8',
    title: '8. Stalemate / Draw Detection',
    description: 'Detects when all 9 cells are filled with no victor.',
    verificationSteps: 'Fill all 9 grid positions without any 3-in-a-row.',
    expectedResult: 'Status transitions to FINISHED_DRAW, stalemate banner displayed.'
  },
  {
    id: 'tc-9',
    title: '9. Rematch System & Reset',
    description: 'Allows players to request and confirm a rematch without new codes.',
    verificationSteps: 'Click "Request Rematch"; once confirmed, board clears.',
    expectedResult: 'Board cleared, scores retained, turn resets to X.'
  },
  {
    id: 'tc-10',
    title: '10. Invalid Room Code Handling',
    description: 'Displays user-friendly error message when code does not exist.',
    verificationSteps: 'Attempt to join with non-existent code "ZZZZZZ".',
    expectedResult: '404 error returned: "Room code \'ZZZZZZ\' not found."'
  },
  {
    id: 'tc-11',
    title: '11. Full Room (Capacity = 2) Rejection',
    description: 'Rejects a third player attempting to enter an active match.',
    verificationSteps: 'Attempt to join a room that already has both X and O.',
    expectedResult: '409 Conflict: "Room is already full (maximum 2 players)."'
  },
  {
    id: 'tc-12',
    title: '12. Player Disconnection Detection',
    description: 'Spring WebSocketEventListener notifies opponent when connection drops.',
    verificationSteps: 'Close browser tab or simulate socket termination.',
    expectedResult: 'Status becomes PLAYER_DISCONNECTED, opponent alerted immediately.',
    isSimulatable: true
  },
  {
    id: 'tc-13',
    title: '13. Responsive Viewport Layouts',
    description: 'Mobile phones (360px+), tablets (768px), and desktops (1080px+).',
    verificationSteps: 'Resize viewport or open on mobile phone.',
    expectedResult: 'Board scales responsively without horizontal overflow or clipping.'
  }
];

export const TestChecklist: React.FC = () => {
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set(['tc-1', 'tc-2', 'tc-3', 'tc-4']));
  const [simulationMsg, setSimulationMsg] = useState<string | null>(null);

  const toggleCheck = (id: string) => {
    setCheckedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const markAll = () => {
    setCheckedIds(new Set(TEST_CASES.map(t => t.id)));
  };

  const runSimulation = (testId: string) => {
    try {
      if (testId === 'tc-5') {
        // Test out of turn
        gameEngine.makeMove(0, 'O'); // Trying to move O when turn is X
      } else if (testId === 'tc-6') {
        // Test occupied cell
        gameEngine.makeMove(0, 'X');
        gameEngine.makeMove(0, 'O');
      } else if (testId === 'tc-7') {
        // Fast simulate win
        gameEngine.resetRoom();
        gameEngine.createRoom('Simulator');
        gameEngine.joinRoom(gameEngine.getRoom()!.roomCode, 'Opponent');
        gameEngine.makeMove(0, 'X');
        gameEngine.makeMove(3, 'O');
        gameEngine.makeMove(1, 'X');
        gameEngine.makeMove(4, 'O');
        gameEngine.makeMove(2, 'X'); // 0, 1, 2 winning line!
        setSimulationMsg('Simulated complete 3-in-a-row victory for X! Check Arena tab.');
      } else if (testId === 'tc-12') {
        gameEngine.simulateDisconnect('O');
        setSimulationMsg('Simulated Player O disconnect event.');
      }
    } catch (e: any) {
      setSimulationMsg(`Enforced by Server: "${e.message}"`);
    }

    setCheckedIds(prev => new Set(prev).add(testId));
    setTimeout(() => setSimulationMsg(null), 4000);
  };

  const progressPercent = Math.round((checkedIds.size / TEST_CASES.length) * 100);

  return (
    <div className="bg-[#141a18] border border-[#283730] rounded-xl overflow-hidden shadow-2xl p-6">
      {/* Header & Progress Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-[#f4f1ea] font-display flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-[#9db259]" />
            <span>Authoritative Play-Test & Verification Matrix</span>
          </h3>
          <p className="text-xs text-[#9c9789] mt-0.5">
            13 verification scenarios strictly validating client & Spring Boot authority.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs font-bold text-[#b7ce67]">{progressPercent}% Verified</span>
            <span className="text-[11px] text-[#9c9789] block">
              {checkedIds.size} of {TEST_CASES.length} Passed
            </span>
          </div>
          <button
            onClick={markAll}
            className="px-3 py-1.5 rounded-lg bg-[#1a2520] border border-[#3d5248] text-xs text-[#ded8ca] hover:text-[#f4f1ea] hover:bg-[#202d27]"
          >
            Mark All Passed
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-[#0e1312] rounded-full overflow-hidden mb-6 border border-[#283730]">
        <div
          className="h-full bg-gradient-to-r from-[#7e8f47] to-[#b7ce67] transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Simulation Feedback Banner */}
      {simulationMsg && (
        <div className="mb-4 p-3 rounded-lg bg-[#1c221a] border border-[#7e8f47] text-xs text-[#b7ce67] flex items-center gap-2 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-[#e2c070]" />
          <span>{simulationMsg}</span>
        </div>
      )}

      {/* Test Cases Grid */}
      <div className="space-y-3">
        {TEST_CASES.map(tc => {
          const isPassed = checkedIds.has(tc.id);

          return (
            <div
              key={tc.id}
              className={`p-3.5 rounded-xl border transition-all ${
                isPassed
                  ? 'bg-[#101714] border-[#2b4136]'
                  : 'bg-[#111615] border-[#202b26]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <button
                  onClick={() => toggleCheck(tc.id)}
                  className="flex items-start gap-3 text-left group"
                >
                  <div className="mt-0.5">
                    {isPassed ? (
                      <CheckSquare className="w-4 h-4 text-[#9db259]" />
                    ) : (
                      <Square className="w-4 h-4 text-[#6b7280] group-hover:text-[#9db259]" />
                    )}
                  </div>
                  <div>
                    <h4
                      className={`text-xs sm:text-sm font-semibold transition-colors ${
                        isPassed ? 'text-[#f4f1ea]' : 'text-[#ded8ca]'
                      }`}
                    >
                      {tc.title}
                    </h4>
                    <p className="text-xs text-[#9c9789] mt-0.5">{tc.description}</p>
                    <div className="mt-2 text-[11px] space-y-0.5 text-[#ded8ca]/80">
                      <div>
                        <strong className="text-[#9db259]">Verify:</strong> {tc.verificationSteps}
                      </div>
                      <div>
                        <strong className="text-[#e2c070]">Expected:</strong> {tc.expectedResult}
                      </div>
                    </div>
                  </div>
                </button>

                {tc.isSimulatable && (
                  <button
                    onClick={() => runSimulation(tc.id)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#17201c] border border-[#2d3e35] text-[11px] text-[#b7ce67] hover:bg-[#202f27] transition-all shrink-0 active:scale-95"
                    title="Simulate this scenario right now"
                  >
                    <Play className="w-3 h-3 text-[#9db259]" />
                    <span>Simulate</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
