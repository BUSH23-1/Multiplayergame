import React, { useState } from 'react';
import { Award, Copy, Check, ExternalLink, Image, Sparkles } from 'lucide-react';

export const HandshakeSubmission: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const projectTitle = "Tic-Tac-Toe Arena — Real-Time Multiplayer Game";
  const shortDescription = "Full-stack real-time multiplayer Tic-Tac-Toe arena powered by Java 17, Spring Boot 3.3.4, and STOMP WebSockets over SockJS. Features server-authoritative win/turn enforcement, 6-character room codes, live cross-device synchronization, rematch handshake, and responsive olive & ink styling.";
  
  const techStack = "Java 17, Spring Boot 3.3.4, Spring WebSocket, STOMP Messaging, SockJS, Maven, HTML5, CSS3, Vanilla JavaScript, Vercel, Render.";

  const featuresList = `• Real-time multiplayer synchronization using Spring STOMP WebSockets (/ws).
• Server-authoritative move validation & alternating turn enforcement.
• 8-combination win detection (3 rows, 3 columns, 2 diagonals) and stalemate logic.
• Dynamic 6-character room codes with instant copy & join capabilities.
• Automatic role assignment (Host = X, Challenger = O).
• Rematch voting handshake without leaving the game room.
• Disconnection detection via Spring SessionDisconnectEvent listener.
• Custom olive and ink color aesthetic with subtle glowing accents.
• 100% responsive interface across desktop, tablet, and mobile devices.`;

  return (
    <div className="bg-[#141a18] border border-[#283730] rounded-xl overflow-hidden shadow-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#283730] pb-4">
        <div className="w-10 h-10 rounded-xl bg-[#7e8f47]/20 border border-[#7e8f47]/40 flex items-center justify-center text-[#9db259]">
          <Award className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#f4f1ea] font-display">
            Handshake Project Submission Package
          </h3>
          <p className="text-xs text-[#9c9789]">
            Pre-formatted submission copy compliant with Handshake "Create a Multiplayer Game" brief.
          </p>
        </div>
      </div>

      {/* Title */}
      <div className="p-4 bg-[#0e1312] border border-[#283730] rounded-xl">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-[#9db259] uppercase tracking-wider">
            Project Title
          </span>
          <button
            onClick={() => copyText('title', projectTitle)}
            className="flex items-center gap-1 text-xs text-[#ded8ca] hover:text-[#f4f1ea]"
          >
            {copiedKey === 'title' ? <Check className="w-3.5 h-3.5 text-[#9db259]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy</span>
          </button>
        </div>
        <p className="text-sm font-semibold text-[#f4f1ea]">{projectTitle}</p>
      </div>

      {/* Description under 500 characters */}
      <div className="p-4 bg-[#0e1312] border border-[#283730] rounded-xl">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#9db259] uppercase tracking-wider">
              Project Description
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#1e2723] text-[#b7ce67] border border-[#3d5248]">
              {shortDescription.length} / 500 chars (Verified)
            </span>
          </div>
          <button
            onClick={() => copyText('desc', shortDescription)}
            className="flex items-center gap-1 text-xs text-[#ded8ca] hover:text-[#f4f1ea]"
          >
            {copiedKey === 'desc' ? <Check className="w-3.5 h-3.5 text-[#9db259]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy</span>
          </button>
        </div>
        <p className="text-xs text-[#ded8ca] leading-relaxed">{shortDescription}</p>
      </div>

      {/* Technologies */}
      <div className="p-4 bg-[#0e1312] border border-[#283730] rounded-xl">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-[#e2c070] uppercase tracking-wider">
            Technologies Used
          </span>
          <button
            onClick={() => copyText('tech', techStack)}
            className="flex items-center gap-1 text-xs text-[#ded8ca] hover:text-[#f4f1ea]"
          >
            {copiedKey === 'tech' ? <Check className="w-3.5 h-3.5 text-[#9db259]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy</span>
          </button>
        </div>
        <p className="text-xs font-mono-code text-[#ded8ca]">{techStack}</p>
      </div>

      {/* Features breakdown */}
      <div className="p-4 bg-[#0e1312] border border-[#283730] rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-[#b7ce67] uppercase tracking-wider">
            Implemented Features
          </span>
          <button
            onClick={() => copyText('features', featuresList)}
            className="flex items-center gap-1 text-xs text-[#ded8ca] hover:text-[#f4f1ea]"
          >
            {copiedKey === 'features' ? <Check className="w-3.5 h-3.5 text-[#9db259]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy</span>
          </button>
        </div>
        <pre className="text-xs font-sans text-[#ded8ca] leading-relaxed whitespace-pre-wrap">
          {featuresList}
        </pre>
      </div>

      {/* Screenshot & Cover Image Guidance */}
      <div className="p-4 bg-[#17201c] border border-[#3d5248] rounded-xl space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[#9db259]">
          <Image className="w-4 h-4" />
          <span>Screenshot & Cover Image Guidance</span>
        </div>
        <ul className="text-xs text-[#9c9789] space-y-1 list-disc list-inside">
          <li><strong>Hero Shot 1:</strong> Active match screen showing Player 1 (X) and Player 2 (O) cards with glowing turn banner.</li>
          <li><strong>Hero Shot 2:</strong> Winning celebration screen with highlighted olive strike line and victory card.</li>
          <li><strong>Hero Shot 3:</strong> Dual-device or split-window photo demonstrating live real-time synchronization between two players.</li>
          <li><strong>Aspect Ratio:</strong> 16:9 (1920x1080) for cover banner, PNG format with clear contrast.</li>
        </ul>
      </div>

      {/* Next Steps for Improvements */}
      <div className="p-4 bg-[#0e1312] border border-[#283730] rounded-xl">
        <span className="text-xs font-bold text-[#ded8ca] uppercase tracking-wider block mb-2">
          Future Roadmap & Improvements
        </span>
        <ul className="text-xs text-[#9c9789] space-y-1 list-disc list-inside">
          <li>PostgreSQL database persistence with Spring Data JPA for match history & lifetime player MMR stats.</li>
          <li>Global match-making queue with ELO ranking algorithm.</li>
          <li>Turn countdown timer (e.g., 15-second blitz clock) with server-side timeout auto-forfeit.</li>
          <li>Custom board themes and unlockable avatar crests.</li>
        </ul>
      </div>
    </div>
  );
};
