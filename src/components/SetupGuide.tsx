import React, { useState } from 'react';
import { Terminal, Globe, Server, CheckCircle2, AlertTriangle, Copy, Check } from 'lucide-react';

export const SetupGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'LOCAL' | 'DEPLOY' | 'TROUBLESHOOT'>('LOCAL');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const copyCommand = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="bg-[#141a18] border border-[#283730] rounded-xl overflow-hidden shadow-2xl">
      {/* Navigation Tabs */}
      <div className="flex border-b border-[#283730] bg-[#0e1312]">
        <button
          onClick={() => setActiveTab('LOCAL')}
          className={`flex items-center gap-2 px-6 py-3.5 text-xs sm:text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'LOCAL'
              ? 'border-[#7e8f47] text-[#b7ce67] bg-[#17201c]'
              : 'border-transparent text-[#9c9789] hover:text-[#f4f1ea]'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Local Setup & Execution (Windows / Mac)</span>
        </button>

        <button
          onClick={() => setActiveTab('DEPLOY')}
          className={`flex items-center gap-2 px-6 py-3.5 text-xs sm:text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'DEPLOY'
              ? 'border-[#7e8f47] text-[#b7ce67] bg-[#17201c]'
              : 'border-transparent text-[#9c9789] hover:text-[#f4f1ea]'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Cloud Deployment (Render + Vercel)</span>
        </button>

        <button
          onClick={() => setActiveTab('TROUBLESHOOT')}
          className={`flex items-center gap-2 px-6 py-3.5 text-xs sm:text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'TROUBLESHOOT'
              ? 'border-[#7e8f47] text-[#b7ce67] bg-[#17201c]'
              : 'border-transparent text-[#9c9789] hover:text-[#f4f1ea]'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Troubleshooting & FAQ</span>
        </button>
      </div>

      {/* Tab 1: LOCAL SETUP */}
      {activeTab === 'LOCAL' && (
        <div className="p-6 space-y-6 text-sm text-[#ded8ca]">
          <div>
            <h3 className="text-lg font-bold text-[#f4f1ea] font-display flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-[#7e8f47] text-[#0e1312] flex items-center justify-center text-xs font-bold">1</span>
              Prerequisites & Environment
            </h3>
            <p className="text-[#9c9789] text-xs mb-3">
              Ensure you have Java 17+ JDK and Apache Maven 3.8+ installed on your system.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 bg-[#0e1312] border border-[#283730] rounded-lg">
                <span className="text-xs font-bold text-[#e2c070] block mb-1">Windows (Winget)</span>
                <code className="text-xs font-mono-code text-[#ded8ca] block">
                  winget install EclipseAdoptium.Temurin.17.JDK<br />
                  winget install Apache.Maven
                </code>
              </div>
              <div className="p-3.5 bg-[#0e1312] border border-[#283730] rounded-lg">
                <span className="text-xs font-bold text-[#9db259] block mb-1">macOS (Homebrew) / Linux</span>
                <code className="text-xs font-mono-code text-[#ded8ca] block">
                  brew install openjdk@17 maven<br />
                  # or: sudo apt install openjdk-17-jdk maven
                </code>
              </div>
            </div>
          </div>

          <hr className="border-[#283730]" />

          <div>
            <h3 className="text-lg font-bold text-[#f4f1ea] font-display flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-[#7e8f47] text-[#0e1312] flex items-center justify-center text-xs font-bold">2</span>
              Step 1: Start the Spring Boot Backend
            </h3>
            <p className="text-[#9c9789] text-xs mb-3">
              Open your Windows Command Prompt or PowerShell, navigate to the <code className="text-[#b7ce67]">backend/</code> directory, and execute:
            </p>

            <div className="relative group">
              <pre className="bg-[#0a0d0c] border border-[#283730] rounded-lg p-3 font-mono-code text-xs text-[#b7ce67] overflow-x-auto">
{`# 1. Navigate to backend directory
cd backend

# 2. Compile and package jar
mvn clean package -DskipTests

# 3. Launch Spring Boot application (runs on http://localhost:8080)
mvn spring-boot:run
# OR run the packaged jar directly:
java -jar target/tictactoe-arena-backend-1.0.0.jar`}
              </pre>
              <button
                onClick={() => copyCommand('cmd-backend', 'cd backend && mvn clean package -DskipTests && mvn spring-boot:run')}
                className="absolute right-3 top-3 px-2 py-1 bg-[#17201c] border border-[#283730] rounded text-xs text-[#ded8ca] hover:text-[#f4f1ea] flex items-center gap-1"
              >
                {copiedCmd === 'cmd-backend' ? <Check className="w-3 h-3 text-[#9db259]" /> : <Copy className="w-3 h-3" />}
                <span>Copy</span>
              </button>
            </div>
            <p className="text-xs text-[#9c9789] mt-2">
              ✓ Look for the console banner: <strong className="text-[#f4f1ea]">⚔️ Tic-Tac-Toe Arena Game Server Started!</strong> on port 8080.
            </p>
          </div>

          <hr className="border-[#283730]" />

          <div>
            <h3 className="text-lg font-bold text-[#f4f1ea] font-display flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-[#7e8f47] text-[#0e1312] flex items-center justify-center text-xs font-bold">3</span>
              Step 2: Serve the Frontend Locally
            </h3>
            <p className="text-[#9c9789] text-xs mb-3">
              In a second terminal window, serve the static frontend files using any local HTTP server (such as Python, Live Server in VS Code, or npx serve):
            </p>

            <div className="relative group">
              <pre className="bg-[#0a0d0c] border border-[#283730] rounded-lg p-3 font-mono-code text-xs text-[#e2c070] overflow-x-auto">
{`# Option A: Using Node npx serve (recommended)
cd frontend
npx serve -l 3000 .

# Option B: Using Python 3 built-in server
cd frontend
python -m http.server 3000

# Option C: VS Code Live Server extension (Right click index.html -> 'Open with Live Server')`}
              </pre>
              <button
                onClick={() => copyCommand('cmd-frontend', 'cd frontend && npx serve -l 3000 .')}
                className="absolute right-3 top-3 px-2 py-1 bg-[#17201c] border border-[#283730] rounded text-xs text-[#ded8ca] hover:text-[#f4f1ea] flex items-center gap-1"
              >
                {copiedCmd === 'cmd-frontend' ? <Check className="w-3 h-3 text-[#9db259]" /> : <Copy className="w-3 h-3" />}
                <span>Copy</span>
              </button>
            </div>
          </div>

          <hr className="border-[#283730]" />

          <div>
            <h3 className="text-lg font-bold text-[#f4f1ea] font-display flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-[#7e8f47] text-[#0e1312] flex items-center justify-center text-xs font-bold">4</span>
              Step 3: Play-Test with Two Browser Windows
            </h3>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-[#ded8ca]">
              <li>Open <strong className="text-[#f4f1ea]">Window 1</strong> (e.g. Chrome) to <code className="text-[#b7ce67]">http://localhost:3000</code>.</li>
              <li>Enter name <strong className="text-[#e2c070]">"Player 1"</strong> and click <strong className="text-[#f4f1ea]">"Create Match Room"</strong>.</li>
              <li>Notice the 6-character room code generated (e.g., <code className="text-[#b7ce67]">ARENA1</code>). Click <strong className="text-[#f4f1ea]">Copy</strong>.</li>
              <li>Open <strong className="text-[#f4f1ea]">Window 2</strong> (e.g. Incognito window or Edge) to <code className="text-[#b7ce67]">http://localhost:3000</code>.</li>
              <li>Enter name <strong className="text-[#9db259]">"Player 2"</strong>, paste the room code, and click <strong className="text-[#f4f1ea]">"Join Game"</strong>.</li>
              <li>Both windows will immediately transition into the live arena in real time!</li>
            </ol>
          </div>
        </div>
      )}

      {/* Tab 2: CLOUD DEPLOYMENT */}
      {activeTab === 'DEPLOY' && (
        <div className="p-6 space-y-6 text-sm text-[#ded8ca]">
          <div className="p-4 bg-[#1a231f] border border-[#3d5248] rounded-xl flex items-start gap-3">
            <Server className="w-5 h-5 text-[#9db259] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-[#f4f1ea] text-sm">Deployment Architecture</h4>
              <p className="text-xs text-[#9c9789] mt-1">
                <strong>Backend:</strong> Render Web Service (Java 17 runtime or Docker) running continuously with persistent STOMP WebSocket support.<br />
                <strong>Frontend:</strong> Vercel Edge CDN for high-speed HTTPS delivery of HTML5/CSS3/Vanilla JS.
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-[#f4f1ea] font-display mb-2">
              Phase 1: Deploy Spring Boot Backend to Render
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-xs text-[#ded8ca]">
              <li>Push your code to a GitHub repository.</li>
              <li>Log in to <strong className="text-[#f4f1ea]">Render.com</strong> and click <strong className="text-[#b7ce67]">New + &gt; Web Service</strong>.</li>
              <li>Select your GitHub repository.</li>
              <li>
                Configure the settings:
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1 text-[#9c9789]">
                  <li><strong>Environment:</strong> Docker (Render will automatically detect <code className="text-[#b7ce67]">backend/Dockerfile</code>) OR Java</li>
                  <li><strong>Root Directory:</strong> <code className="text-[#b7ce67]">backend</code></li>
                  <li><strong>Build Command:</strong> <code className="text-[#b7ce67]">mvn clean package -DskipTests</code></li>
                  <li><strong>Start Command:</strong> <code className="text-[#b7ce67]">java -Dserver.port=$PORT -jar target/*.jar</code></li>
                </ul>
              </li>
              <li>
                In <strong>Environment Variables</strong> on Render, set:
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1 text-[#9c9789]">
                  <li><code className="text-[#b7ce67]">ALLOWED_ORIGINS</code> = <code className="text-[#e2c070]">https://*.vercel.app,http://localhost:3000</code></li>
                </ul>
              </li>
              <li>Click <strong>Deploy Web Service</strong>. Once healthy, copy your Render URL (e.g., <code className="text-[#b7ce67]">https://tictactoe-arena.onrender.com</code>).</li>
            </ol>
          </div>

          <hr className="border-[#283730]" />

          <div>
            <h3 className="text-base font-bold text-[#f4f1ea] font-display mb-2">
              Phase 2: Deploy Frontend to Vercel
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-xs text-[#ded8ca]">
              <li>Log in to <strong className="text-[#f4f1ea]">Vercel.com</strong> and click <strong className="text-[#b7ce67]">Add New Project</strong>.</li>
              <li>Import your GitHub repository.</li>
              <li>
                In the project settings:
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1 text-[#9c9789]">
                  <li><strong>Root Directory:</strong> Click "Edit" and choose <code className="text-[#b7ce67]">frontend</code></li>
                  <li><strong>Framework Preset:</strong> Other / Static</li>
                </ul>
              </li>
              <li>Click <strong>Deploy</strong>. Vercel will build and deploy your app in seconds!</li>
              <li>
                Once deployed, open your Vercel URL. Click the <strong>⚙️ Settings</strong> button in the top-right header, enter your Render backend URL, and click <strong>Save & Reconnect</strong>.
              </li>
              <li>
                Now players on any mobile phone or computer across the world can play real-time multiplayer over WSS!
              </li>
            </ol>
          </div>
        </div>
      )}

      {/* Tab 3: TROUBLESHOOTING */}
      {activeTab === 'TROUBLESHOOT' && (
        <div className="p-6 space-y-4 text-xs text-[#ded8ca]">
          <div className="p-3.5 bg-[#171f1b] border border-[#283730] rounded-lg">
            <h4 className="font-bold text-[#e2c070] mb-1">Issue: Port 8080 already in use</h4>
            <p className="text-[#9c9789]">
              Another process (like Jenkins, Tomcat, or another instance) is using 8080.
              Run <code className="text-[#b7ce67]">netstat -ano | findstr :8080</code> on Windows to find the PID, or pass a different port:
              <br />
              <code className="text-[#ded8ca] bg-[#0e1312] px-1 py-0.5 rounded mt-1 inline-block">
                mvn spring-boot:run -Dspring-boot.run.arguments=--server.port=8081
              </code>
            </p>
          </div>

          <div className="p-3.5 bg-[#171f1b] border border-[#283730] rounded-lg">
            <h4 className="font-bold text-[#e2c070] mb-1">Issue: CORS policy error in browser console</h4>
            <p className="text-[#9c9789]">
              Ensure your <code className="text-[#b7ce67]">CorsConfig.java</code> has <code className="text-[#ded8ca]">allowedOriginPatterns("*")</code> and SockJS registration has <code className="text-[#ded8ca]">.setAllowedOriginPatterns("*")</code>.
              In production, verify the <code className="text-[#b7ce67]">ALLOWED_ORIGINS</code> environment variable includes your Vercel domain.
            </p>
          </div>

          <div className="p-3.5 bg-[#171f1b] border border-[#283730] rounded-lg">
            <h4 className="font-bold text-[#e2c070] mb-1">Issue: WebSocket handshake failed (404 on /ws/info)</h4>
            <p className="text-[#9c9789]">
              SockJS sends an initial HTTP request to <code className="text-[#b7ce67]">/ws/info</code>.
              Ensure you have registered both <code className="text-[#ded8ca]">registry.addEndpoint("/ws").withSockJS()</code> and that the client URL matches the exact backend protocol (https:// vs http://).
            </p>
          </div>

          <div className="p-3.5 bg-[#171f1b] border border-[#283730] rounded-lg">
            <h4 className="font-bold text-[#e2c070] mb-1">Issue: Render free-tier sleep / slow initial connection</h4>
            <p className="text-[#9c9789]">
              Render's free tier spins down after 15 minutes of inactivity. The first request may take ~30-45 seconds while the JVM container wakes up. Once awake, WebSockets maintain persistent bidirectional connectivity without sleeping.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
