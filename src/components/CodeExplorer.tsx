import React, { useState } from 'react';
import { PROJECT_FILES, ProjectFileItem } from '../data/projectFiles';
import JSZip from 'jszip';
import { 
  Folder, 
  FileCode, 
  Download, 
  Copy, 
  Check, 
  FileText, 
  Coffee, 
  Code,
  Search,
  ExternalLink
} from 'lucide-react';

export const CodeExplorer: React.FC = () => {
  const [selectedPath, setSelectedPath] = useState<string>('backend/pom.xml');
  const [search, setSearch] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);

  const selectedFile = PROJECT_FILES.find(f => f.path === selectedPath) || PROJECT_FILES[0];

  const filteredFiles = PROJECT_FILES.filter(f => 
    f.path.toLowerCase().includes(search.toLowerCase()) ||
    f.description.toLowerCase().includes(search.toLowerCase())
  );

  const copyCurrentFile = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadProjectZip = async () => {
    setDownloading(true);
    try {
      const zip = new JSZip();

      // Add backend files
      PROJECT_FILES.forEach(file => {
        zip.file(file.path, file.content);
      });

      // Add root README.md
      zip.file('README.md', `# Tic-Tac-Toe Arena — Full-Stack Multiplayer Game

Authoritative Real-Time Multiplayer Tic-Tac-Toe Game.
- Backend: Java 17 + Spring Boot 3.3.4 + STOMP WebSockets
- Frontend: HTML5, CSS3 (Olive & Ink theme), Vanilla JavaScript

## Run Backend
\`\`\`bash
cd backend
mvn clean package
mvn spring-boot:run
\`\`\`

## Run Frontend
\`\`\`bash
cd frontend
# Open index.html in browser or serve via:
npx serve .
\`\`\`
`);

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'tictactoe-arena-fullstack-springboot.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error generating zip:', e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-[#141a18] border border-[#283730] rounded-xl overflow-hidden shadow-2xl flex flex-col h-[700px]">
      {/* Top Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-[#0e1312] border-b border-[#283730]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#7e8f47]/20 border border-[#7e8f47]/40 flex items-center justify-center text-[#9db259]">
            <Coffee className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#f4f1ea] font-display">
              Java Spring Boot 3 & Frontend Source Code
            </h3>
            <p className="text-xs text-[#9c9789]">
              {PROJECT_FILES.length} production files • Fully typed & ready to compile
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={downloadProjectZip}
            disabled={downloading}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#7e8f47] text-[#0e1312] font-semibold text-xs hover:bg-[#9db259] transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading ? 'Zipping...' : 'Download Project (.zip)'}</span>
          </button>
        </div>
      </div>

      {/* Main Split Body: File Tree (left) + Code Editor (right) */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* Left: File Explorer Sidebar */}
        <div className="w-full md:w-72 bg-[#101514] border-b md:border-b-0 md:border-r border-[#283730] flex flex-col">
          {/* Search box */}
          <div className="p-3 border-b border-[#283730]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#9c9789]" />
              <input
                type="text"
                placeholder="Search files..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#17201c] border border-[#283730] rounded-lg text-[#f4f1ea] placeholder-[#6b7280] outline-none focus:border-[#7e8f47]"
              />
            </div>
          </div>

          {/* File Tree List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 text-xs">
            {/* Backend Header */}
            <div className="px-2 py-1 text-[11px] font-bold text-[#7e8f47] uppercase tracking-wider flex items-center gap-1.5">
              <Coffee className="w-3 h-3" />
              <span>Spring Boot Backend</span>
            </div>
            {filteredFiles.filter(f => f.category === 'backend').map(file => (
              <button
                key={file.path}
                onClick={() => setSelectedPath(file.path)}
                className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center gap-2 transition-colors ${
                  selectedPath === file.path
                    ? 'bg-[#7e8f47]/20 text-[#b7ce67] font-semibold border border-[#7e8f47]/40'
                    : 'text-[#ded8ca] hover:bg-[#18221e]'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-[#9db259] shrink-0" />
                <span className="truncate">{file.filename}</span>
              </button>
            ))}

            {/* Frontend Header */}
            <div className="px-2 pt-3 pb-1 text-[11px] font-bold text-[#e2c070] uppercase tracking-wider flex items-center gap-1.5">
              <Code className="w-3 h-3" />
              <span>Frontend (HTML/CSS/JS)</span>
            </div>
            {filteredFiles.filter(f => f.category === 'frontend').map(file => (
              <button
                key={file.path}
                onClick={() => setSelectedPath(file.path)}
                className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center gap-2 transition-colors ${
                  selectedPath === file.path
                    ? 'bg-[#e2c070]/20 text-[#e2c070] font-semibold border border-[#e2c070]/40'
                    : 'text-[#ded8ca] hover:bg-[#18221e]'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-[#e2c070] shrink-0" />
                <span className="truncate">{file.filename}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Code Viewer */}
        <div className="flex-1 flex flex-col min-h-0 bg-[#0a0d0c]">
          {/* File Header Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#0f1412] border-b border-[#283730]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono-code font-bold text-[#b7ce67]">
                  {selectedFile.path}
                </span>
                <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-[#1e2723] text-[#9c9789] border border-[#283730]">
                  {selectedFile.language}
                </span>
              </div>
              <p className="text-[11px] text-[#9c9789] mt-0.5">
                {selectedFile.description}
              </p>
            </div>

            <button
              onClick={copyCurrentFile}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#16211c] border border-[#2d3f37] text-xs text-[#ded8ca] hover:text-[#f4f1ea] hover:bg-[#1c2a24] transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#9db259]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy File'}</span>
            </button>
          </div>

          {/* Code Viewer Body */}
          <div className="flex-1 overflow-auto p-4 font-mono-code text-xs leading-relaxed text-[#ded8ca]">
            <pre className="whitespace-pre">{selectedFile.content}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
