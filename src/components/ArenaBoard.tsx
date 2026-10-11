import React from 'react';
import { PlayerSymbol } from '../types/game';

interface ArenaBoardProps {
  board: (PlayerSymbol | null)[];
  winningLine: number[] | null;
  currentTurn: PlayerSymbol;
  playerSymbol?: PlayerSymbol | 'SPECTATOR';
  isInteractive: boolean;
  onCellClick: (index: number) => void;
}

export const ArenaBoard: React.FC<ArenaBoardProps> = ({
  board,
  winningLine,
  currentTurn,
  playerSymbol,
  isInteractive,
  onCellClick
}) => {
  return (
    <div className="relative w-full max-w-[380px] sm:max-w-[420px] aspect-square mx-auto my-4 select-none">
      {/* Outer ambient glow frame */}
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-[#7e8f47]/20 via-[#283730]/40 to-[#141a18] blur-sm -z-10" />

      {/* 3x3 Grid Board */}
      <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-2.5 sm:gap-3.5 p-3.5 sm:p-4 bg-[#0e1312] border border-[#283730] rounded-2xl shadow-2xl">
        {board.map((cellValue, idx) => {
          const isWinningCell = winningLine?.includes(idx);
          const isOccupied = cellValue !== null;
          const isAllowedMove = isInteractive && !isOccupied && (playerSymbol === undefined || playerSymbol === currentTurn);

          return (
            <button
              key={idx}
              onClick={() => onCellClick(idx)}
              disabled={isOccupied || !isInteractive}
              aria-label={`Cell ${idx} ${cellValue ? cellValue : 'empty'}`}
              className={`
                relative flex items-center justify-center rounded-xl font-display font-extrabold
                text-4xl sm:text-5xl md:text-6xl transition-all duration-200 outline-none
                ${isOccupied 
                  ? 'cursor-default' 
                  : isAllowedMove 
                    ? 'cursor-pointer hover:bg-[#1a2420] hover:border-[#7e8f47] hover:scale-[1.02] active:scale-[0.98]' 
                    : 'cursor-not-allowed opacity-80'
                }
                ${isWinningCell 
                  ? 'bg-[#7e8f47]/30 border-2 border-[#b7ce67] shadow-[0_0_24px_rgba(126,143,71,0.5)] animate-pulse' 
                  : 'bg-[#151d1a] border border-[#26352e]'
                }
                ${cellValue === 'X' ? 'text-[#e2c070] drop-shadow-[0_0_12px_rgba(226,192,112,0.4)]' : ''}
                ${cellValue === 'O' ? 'text-[#a4ba57] drop-shadow-[0_0_12px_rgba(164,186,87,0.45)]' : ''}
              `}
            >
              {cellValue && (
                <span className="transform transition-transform scale-100 duration-150">
                  {cellValue}
                </span>
              )}

              {/* Ghost preview on hover if cell is open & it's player's turn */}
              {!isOccupied && isAllowedMove && (
                <span className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-25 transition-opacity text-3xl font-display text-[#ded8ca]">
                  {currentTurn}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
