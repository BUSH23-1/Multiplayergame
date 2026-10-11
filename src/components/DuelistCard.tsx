import React from 'react';
import { Player, PlayerSymbol } from '../types/game';

interface DuelistCardProps {
  player: Player | null;
  symbol: PlayerSymbol;
  isActiveTurn: boolean;
  isCurrentClient?: boolean;
}

export const DuelistCard: React.FC<DuelistCardProps> = ({
  player,
  symbol,
  isActiveTurn,
  isCurrentClient
}) => {
  const isX = symbol === 'X';

  return (
    <div
      className={`
        flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl transition-all duration-200 border
        ${isActiveTurn
          ? 'bg-[#1a2520] border-[#7e8f47] shadow-[0_0_20px_rgba(126,143,71,0.22)] scale-[1.01]'
          : 'bg-[#151d1a] border-[#26352e]'
        }
      `}
    >
      {/* Symbol Crest */}
      <div
        className={`
          w-11 h-11 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center font-display font-extrabold text-2xl
          ${isX
            ? 'bg-[#e2c070]/15 text-[#e2c070] border border-[#e2c070]/40'
            : 'bg-[#9db259]/15 text-[#9db259] border border-[#9db259]/40'
          }
        `}
      >
        {symbol}
      </div>

      {/* Duelist Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-sm sm:text-base text-[#f4f1ea] truncate">
            {player ? player.username : 'Awaiting Challenger...'}
          </h4>
          {isCurrentClient && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#7e8f47]/20 border border-[#7e8f47]/50 text-[#b7ce67] font-semibold">
              YOU
            </span>
          )}
        </div>
        <p className="text-xs text-[#9c9789]">
          {isX ? 'Host & Opening Move' : 'Challenger (Second Move)'}
        </p>
      </div>

      {/* Online / Turn / Rematch Indicators */}
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              player?.connected
                ? 'bg-[#9db259] shadow-[0_0_8px_#9db259]'
                : 'bg-[#6b7280]'
            }`}
          />
          <span className="text-[11px] text-[#9c9789]">
            {player?.connected ? 'Online' : 'Waiting'}
          </span>
        </div>

        {player?.wantsRematch && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#7e8f47] text-[#0e1312] font-bold">
            Rematch Ready
          </span>
        )}
      </div>
    </div>
  );
};
