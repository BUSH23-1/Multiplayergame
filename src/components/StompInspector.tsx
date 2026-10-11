import React, { useState } from 'react';
import { StompLogEntry } from '../types/game';
import { Terminal, ArrowDownRight, ArrowUpRight, ShieldAlert, Copy, Trash2, Check } from 'lucide-react';

interface StompInspectorProps {
  logs: StompLogEntry[];
  onClear: () => void;
}

export const StompInspector: React.FC<StompInspectorProps> = ({ logs, onClear }) => {
  const [filter, setFilter] = useState<'ALL' | 'IN' | 'OUT' | 'SYSTEM'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = logs.filter(log => {
    if (filter === 'ALL') return true;
    return log.direction === filter;
  });

  const copyPayload = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-[#141a18] border border-[#283730] rounded-xl overflow-hidden shadow-xl flex flex-col h-[520px]">
      {/* Inspector Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-[#0e1312] border-b border-[#283730]">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#9db259]" />
          <h3 className="text-sm font-semibold text-[#f4f1ea] font-mono-code">
            STOMP Protocol Frame Inspector
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#1e2723] text-[#b7ce67] border border-[#3d5248]">
            {logs.length} frames
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Pills */}
          <div className="flex rounded-lg bg-[#151d1a] p-0.5 border border-[#283730] text-xs">
            {(['ALL', 'OUT', 'IN', 'SYSTEM'] as const).map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filter === type
                    ? 'bg-[#7e8f47] text-[#0e1312] font-semibold'
                    : 'text-[#9c9789] hover:text-[#f4f1ea]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <button
            onClick={onClear}
            className="p-1.5 rounded text-[#9c9789] hover:text-[#e07a78] hover:bg-[#201515] transition-colors"
            title="Clear Frame Logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Frame Stream List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 font-mono-code text-xs">
        {filtered.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-[#9c9789] gap-2">
            <Terminal className="w-8 h-8 opacity-40 text-[#7e8f47]" />
            <p>No STOMP frames recorded yet.</p>
            <p className="text-[11px] text-[#6b7280]">
              Create a room, make a move, or join a match to see live WebSocket packet exchanges.
            </p>
          </div>
        ) : (
          filtered.map(log => {
            const isOut = log.direction === 'OUT';
            const isIn = log.direction === 'IN';
            const isSys = log.direction === 'SYSTEM';

            return (
              <div
                key={log.id}
                className={`p-2.5 rounded-lg border transition-all ${
                  isOut
                    ? 'bg-[#121916] border-[#2d3f37]'
                    : isIn
                    ? 'bg-[#16211a] border-[#385143]'
                    : 'bg-[#1b1c18] border-[#44422e]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5">
                    {isOut && <ArrowUpRight className="w-3.5 h-3.5 text-[#e2c070]" />}
                    {isIn && <ArrowDownRight className="w-3.5 h-3.5 text-[#9db259]" />}
                    {isSys && <ShieldAlert className="w-3.5 h-3.5 text-[#d6b772]" />}
                    <span
                      className={`font-bold ${
                        isOut ? 'text-[#e2c070]' : isIn ? 'text-[#9db259]' : 'text-[#d6b772]'
                      }`}
                    >
                      {log.command}
                    </span>
                    {log.destination && (
                      <span className="text-[#9c9789] bg-[#0e1312] px-1.5 py-0.5 rounded border border-[#283730]">
                        {log.destination}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#6b7280]">{log.timestamp}</span>
                    <button
                      onClick={() => copyPayload(log.id, log.payload)}
                      className="text-[#9c9789] hover:text-[#f4f1ea] transition-colors"
                      title="Copy Frame Payload"
                    >
                      {copiedId === log.id ? (
                        <Check className="w-3 h-3 text-[#9db259]" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>

                <pre className="text-[11px] text-[#ded8ca] bg-[#0a0d0c] p-2 rounded border border-[#1f2824] overflow-x-auto whitespace-pre-wrap break-all">
                  {log.payload}
                </pre>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info Box */}
      <div className="px-3 py-2 bg-[#0d1210] border-t border-[#283730] text-[11px] text-[#9c9789] flex items-center justify-between">
        <span>Protocol: STOMP over SockJS (`/ws`)</span>
        <span>Broker Prefix: `/topic` • App Prefix: `/app`</span>
      </div>
    </div>
  );
};
