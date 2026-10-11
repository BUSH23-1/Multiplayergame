/**
 * TIC-TAC-TOE ARENA — AUTHORITATIVE REAL-TIME WEBSOCKET CLIENT
 * Vanilla JavaScript implementation communicating with Java Spring Boot backend.
 */

// ==========================================
// STATE & CONFIGURATION
// ==========================================
const CONFIG = {
  // Default to localhost:8080 for local dev or window.location.origin in production
  backendUrl: localStorage.getItem('ttt_backend_url') || (
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:8080'
      : window.location.origin
  ),
  reconnectIntervalMs: 3000
};

const state = {
  roomCode: null,
  playerId: null,
  playerSymbol: null, // 'X' or 'O'
  username: localStorage.getItem('ttt_gladiator_name') || '',
  isMyTurn: false,
  gameStatus: 'WAITING',
  stompClient: null,
  stompSubscription: null,
  board: Array(9).fill(null),
  soundEnabled: true
};

// ==========================================
// DOM ELEMENT REFERENCES
// ==========================================
const elements = {
  // Views
  welcomeView: document.getElementById('welcomeView'),
  waitingView: document.getElementById('waitingView'),
  gameView: document.getElementById('gameView'),

  // Connection
  connectionStatus: document.getElementById('connectionStatus'),
  connectionStatusText: document.getElementById('connectionStatusText'),
  configModal: document.getElementById('configModal'),
  configToggleBtn: document.getElementById('configToggleBtn'),
  closeConfigBtn: document.getElementById('closeConfigBtn'),
  saveConfigBtn: document.getElementById('saveConfigBtn'),
  backendUrlInput: document.getElementById('backendUrlInput'),

  // Inputs & Buttons
  usernameInput: document.getElementById('usernameInput'),
  roomCodeInput: document.getElementById('roomCodeInput'),
  createRoomBtn: document.getElementById('createRoomBtn'),
  joinRoomBtn: document.getElementById('joinRoomBtn'),

  // Waiting View
  displayRoomCode: document.getElementById('displayRoomCode'),
  waitingHostName: document.getElementById('waitingHostName'),
  copyCodeBtn: document.getElementById('copyCodeBtn'),
  cancelRoomBtn: document.getElementById('cancelRoomBtn'),

  // Game View
  gameRoomCode: document.getElementById('gameRoomCode'),
  gameCopyBtn: document.getElementById('gameCopyBtn'),
  leaveGameBtn: document.getElementById('leaveGameBtn'),
  turnBanner: document.getElementById('turnBanner'),
  turnIndicatorIcon: document.getElementById('turnIndicatorIcon'),
  turnBannerText: document.getElementById('turnBannerText'),
  statusNotice: document.getElementById('statusNotice'),

  // Duelists
  cardPlayerX: document.getElementById('cardPlayerX'),
  namePlayerX: document.getElementById('namePlayerX'),
  rolePlayerX: document.getElementById('rolePlayerX'),
  indicatorPlayerX: document.getElementById('indicatorPlayerX'),
  rematchStatusX: document.getElementById('rematchStatusX'),

  cardPlayerO: document.getElementById('cardPlayerO'),
  namePlayerO: document.getElementById('namePlayerO'),
  rolePlayerO: document.getElementById('rolePlayerO'),
  indicatorPlayerO: document.getElementById('indicatorPlayerO'),
  rematchStatusO: document.getElementById('rematchStatusO'),

  // Board
  boardGrid: document.getElementById('boardGrid'),
  cells: document.querySelectorAll('.cell'),

  // Result Card
  gameResultCard: document.getElementById('gameResultCard'),
  resultIcon: document.getElementById('resultIcon'),
  resultTitle: document.getElementById('resultTitle'),
  resultSubtitle: document.getElementById('resultSubtitle'),
  rematchBtn: document.getElementById('rematchBtn'),
  returnHomeBtn: document.getElementById('returnHomeBtn'),

  // Toast
  toast: document.getElementById('toast')
};

// ==========================================
// AUDIO SYNTHESIZER (Web Audio API)
// ==========================================
const AudioFX = {
  ctx: null,
  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  },
  playMove(symbol) {
    if (!state.soundEnabled) return;
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      if (symbol === 'X') {
        osc.frequency.setValueAtTime(440, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(320, this.ctx.currentTime + 0.1);
      } else {
        osc.frequency.setValueAtTime(560, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(680, this.ctx.currentTime + 0.1);
      }

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch (e) {}
  },
  playWin() {
    if (!state.soundEnabled) return;
    try {
      this.init();
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.frequency.value = freq;
        const time = this.ctx.currentTime + idx * 0.1;
        gain.gain.setValueAtTime(0.18, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.25);
        osc.start(time);
        osc.stop(time + 0.25);
      });
    } catch (e) {}
  },
  playError() {
    if (!state.soundEnabled) return;
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.frequency.setValueAtTime(160, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    } catch (e) {}
  }
};

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================
function showToast(message, isError = false) {
  elements.toast.textContent = message;
  elements.toast.className = `toast ${isError ? 'toast-error' : ''}`;
  elements.toast.classList.remove('hidden');

  clearTimeout(elements.toast._timeout);
  elements.toast._timeout = setTimeout(() => {
    elements.toast.classList.add('hidden');
  }, 3500);
}

// ==========================================
// WEBSOCKET & STOMP INITIALIZATION
// ==========================================
function updateConnectionUI(status) {
  elements.connectionStatus.className = `connection-badge status-${status}`;
  if (status === 'connected') {
    elements.connectionStatusText.textContent = 'Live Socket';
  } else if (status === 'connecting') {
    elements.connectionStatusText.textContent = 'Connecting...';
  } else {
    elements.connectionStatusText.textContent = 'Offline';
  }
}

function initWebSocket(onConnectedCallback) {
  updateConnectionUI('connecting');

  // Strip trailing slashes
  const baseUrl = CONFIG.backendUrl.replace(/\/+$/, '');
  const wsEndpoint = `${baseUrl}/ws`;

  // Check if SockJS & Stomp exist
  if (typeof SockJS === 'undefined' || typeof Stomp === 'undefined') {
    console.warn('SockJS or Stomp library not loaded. Running in standalone mock mode.');
    updateConnectionUI('connected');
    if (onConnectedCallback) onConnectedCallback();
    return;
  }

  try {
    const socket = new SockJS(wsEndpoint);
    state.stompClient = Stomp.over(socket);

    // Disable excessive debug logs in console
    state.stompClient.debug = () => {};

    state.stompClient.connect(
      {},
      function onConnected(frame) {
        updateConnectionUI('connected');
        console.log('STOMP WebSocket Connected:', frame);

        if (state.roomCode) {
          subscribeToRoom(state.roomCode);
        }

        if (onConnectedCallback) onConnectedCallback();
      },
      function onError(error) {
        console.error('STOMP Connection Error:', error);
        updateConnectionUI('disconnected');
        showToast('WebSocket connection dropped. Retrying...', true);
        setTimeout(() => initWebSocket(), CONFIG.reconnectIntervalMs);
      }
    );
  } catch (err) {
    console.error('Failed to instantiate SockJS:', err);
    updateConnectionUI('disconnected');
  }
}

function subscribeToRoom(roomCode) {
  if (!state.stompClient || !state.stompClient.connected) return;

  if (state.stompSubscription) {
    state.stompSubscription.unsubscribe();
  }

  const topicDestination = `/topic/room/${roomCode.toUpperCase()}`;
  state.stompSubscription = state.stompClient.subscribe(topicDestination, function (message) {
    try {
      const payload = JSON.parse(message.body);
      handleServerUpdate(payload);
    } catch (e) {
      console.error('Failed to parse STOMP message payload:', e);
    }
  });

  // Announce presence
  state.stompClient.send(
    '/app/join-announce',
    {},
    JSON.stringify({ roomCode: roomCode, playerId: state.playerId })
  );
}

// ==========================================
// REST API INTEGRATIONS
// ==========================================
async function apiCreateRoom(username) {
  const baseUrl = CONFIG.backendUrl.replace(/\/+$/, '');
  const response = await fetch(`${baseUrl}/api/game/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: username || 'Player 1' })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create room.');
  }

  return response.json();
}

async function apiJoinRoom(roomCode, username) {
  const baseUrl = CONFIG.backendUrl.replace(/\/+$/, '');
  const response = await fetch(`${baseUrl}/api/game/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      roomCode: roomCode.trim().toUpperCase(),
      username: username || 'Player 2'
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to join room.');
  }

  return response.json();
}

// ==========================================
// GAMEPLAY ACTIONS
// ==========================================
function switchView(viewName) {
  elements.welcomeView.classList.remove('active');
  elements.waitingView.classList.remove('active');
  elements.gameView.classList.remove('active');

  elements.welcomeView.classList.add('hidden');
  elements.waitingView.classList.add('hidden');
  elements.gameView.classList.add('hidden');

  if (viewName === 'welcome') {
    elements.welcomeView.classList.remove('hidden');
    elements.welcomeView.classList.add('active');
  } else if (viewName === 'waiting') {
    elements.waitingView.classList.remove('hidden');
    elements.waitingView.classList.add('active');
  } else if (viewName === 'game') {
    elements.gameView.classList.remove('hidden');
    elements.gameView.classList.add('active');
  }
}

async function handleCreateRoom() {
  const username = elements.usernameInput.value.trim() || 'Player 1';
  localStorage.setItem('ttt_gladiator_name', username);
  state.username = username;

  elements.createRoomBtn.disabled = true;
  elements.createRoomBtn.innerHTML = '<span>Creating Arena...</span>';

  try {
    const data = await apiCreateRoom(username);
    state.roomCode = data.roomCode;
    state.playerId = data.assignedPlayerId;
    state.playerSymbol = data.assignedSymbol || 'X';

    elements.displayRoomCode.textContent = state.roomCode;
    elements.waitingHostName.textContent = username;

    subscribeToRoom(state.roomCode);
    switchView('waiting');
    showToast(`Room ${state.roomCode} created! Share the code.`);
  } catch (err) {
    AudioFX.playError();
    showToast(err.message, true);
  } finally {
    elements.createRoomBtn.disabled = false;
    elements.createRoomBtn.innerHTML = '<span>Create Match Room</span><span class="btn-arrow">&rarr;</span>';
  }
}

async function handleJoinRoom() {
  const code = elements.roomCodeInput.value.trim().toUpperCase();
  const username = elements.usernameInput.value.trim() || 'Player 2';

  if (!code || code.length !== 6) {
    AudioFX.playError();
    showToast('Please enter a valid 6-character room code.', true);
    return;
  }

  localStorage.setItem('ttt_gladiator_name', username);
  state.username = username;

  elements.joinRoomBtn.disabled = true;
  elements.joinRoomBtn.textContent = 'Joining...';

  try {
    const data = await apiJoinRoom(code, username);
    state.roomCode = data.roomCode;
    state.playerId = data.assignedPlayerId;
    state.playerSymbol = data.assignedSymbol || 'O';

    subscribeToRoom(state.roomCode);
    handleServerUpdate(data);
    switchView('game');
    showToast(`Entered arena ${code}!`);
  } catch (err) {
    AudioFX.playError();
    showToast(err.message, true);
  } finally {
    elements.joinRoomBtn.disabled = false;
    elements.joinRoomBtn.textContent = 'Join Game';
  }
}

function handleCellClick(index) {
  // Check if cell occupied
  if (state.board[index] !== null) {
    AudioFX.playError();
    showToast('This cell is already occupied!', true);
    return;
  }

  // Check if active game
  if (state.gameStatus !== 'IN_PROGRESS') {
    return;
  }

  // Check turn authority
  if (!state.isMyTurn) {
    AudioFX.playError();
    showToast('Wait for your turn!', true);
    return;
  }

  // Send move via STOMP WebSocket
  if (state.stompClient && state.stompClient.connected) {
    state.stompClient.send(
      '/app/move',
      {},
      JSON.stringify({
        roomCode: state.roomCode,
        playerId: state.playerId,
        symbol: state.playerSymbol,
        cellIndex: index
      })
    );
  } else {
    // REST fallback if socket disconnected
    fetch(`${CONFIG.backendUrl}/api/game/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomCode: state.roomCode,
        playerId: state.playerId,
        symbol: state.playerSymbol,
        cellIndex: index
      })
    }).catch(err => {
      showToast('Connection error sending move.', true);
    });
  }
}

function handleRequestRematch() {
  if (state.stompClient && state.stompClient.connected) {
    state.stompClient.send(
      '/app/rematch',
      {},
      JSON.stringify({
        roomCode: state.roomCode,
        playerId: state.playerId
      })
    );
    showToast('Rematch requested!');
    elements.rematchBtn.disabled = true;
    elements.rematchBtn.innerHTML = '<span>Awaiting Opponent...</span>';
  }
}

// ==========================================
// SERVER STATE SYNCHRONIZATION
// ==========================================
function handleServerUpdate(data) {
  // Check for error payload
  if (data.type === 'ERROR') {
    if (data.playerId === state.playerId) {
      AudioFX.playError();
      showToast(data.message, true);
    }
    return;
  }

  // Transition from waiting to game if opponent joined
  if (data.status === 'IN_PROGRESS' && elements.waitingView.classList.contains('active')) {
    switchView('game');
  }

  state.gameStatus = data.status;
  state.board = data.board || Array(9).fill(null);

  // Sync Room Code & Player Details
  elements.gameRoomCode.textContent = data.roomCode;
  if (data.playerX) {
    elements.namePlayerX.textContent = data.playerX.username;
    elements.rolePlayerX.textContent = state.playerSymbol === 'X' ? 'You (X)' : 'Opponent (X)';
    if (data.playerX.wantsRematch) elements.rematchStatusX.classList.remove('hidden');
    else elements.rematchStatusX.classList.add('hidden');
  }
  if (data.playerO) {
    elements.namePlayerO.textContent = data.playerO.username;
    elements.rolePlayerO.textContent = state.playerSymbol === 'O' ? 'You (O)' : 'Opponent (O)';
    if (data.playerO.wantsRematch) elements.rematchStatusO.classList.remove('hidden');
    else elements.rematchStatusO.classList.add('hidden');
  }

  // Turn management
  state.isMyTurn = (data.currentTurn === state.playerSymbol) && (data.status === 'IN_PROGRESS');

  elements.turnBanner.className = `turn-banner turn-${data.currentTurn ? data.currentTurn.toLowerCase() : 'x'}`;
  elements.turnIndicatorIcon.textContent = data.currentTurn || 'X';

  const currentTurnPlayerName = (data.currentTurn === 'X' ? data.playerX?.username : data.playerO?.username) || data.currentTurn;
  elements.turnBannerText.textContent = state.isMyTurn
    ? `Your Turn (${state.playerSymbol})`
    : `Turn: ${currentTurnPlayerName} (${data.currentTurn})`;

  // Highlight active player card
  elements.cardPlayerX.classList.toggle('active-turn', data.currentTurn === 'X' && data.status === 'IN_PROGRESS');
  elements.cardPlayerO.classList.toggle('active-turn', data.currentTurn === 'O' && data.status === 'IN_PROGRESS');

  // Render 3x3 Board
  elements.cells.forEach((cell, idx) => {
    const val = state.board[idx];
    cell.textContent = val || '';
    cell.className = 'cell';
    if (val) {
      cell.classList.add('occupied', `cell-${val.toLowerCase()}`);
    }

    // Highlight winning cells if won
    if (data.winningLine && data.winningLine.includes(idx)) {
      cell.classList.add('winning-cell');
    }
  });

  // Notice bar
  if (data.message) {
    elements.statusNotice.textContent = data.message;
  }

  // Handle Win, Draw, Disconnection states
  if (data.status === 'FINISHED_X_WON' || data.status === 'FINISHED_O_WON') {
    const winnerSymbol = data.winner;
    const isWinner = winnerSymbol === state.playerSymbol;
    const winnerName = winnerSymbol === 'X' ? data.playerX?.username : data.playerO?.username;

    elements.gameResultCard.classList.remove('hidden');
    elements.resultIcon.textContent = isWinner ? '🏆' : '⚔️';
    elements.resultTitle.textContent = isWinner ? 'Victory is Yours!' : 'Defeat in the Arena!';
    elements.resultSubtitle.textContent = `${winnerName} (${winnerSymbol}) achieved 3 in a row!`;

    elements.rematchBtn.disabled = false;
    elements.rematchBtn.innerHTML = '<span>Request Rematch</span>';

    if (isWinner) {
      AudioFX.playWin();
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#7e8f47', '#e2c070', '#9db259', '#f4f1ea']
        });
      }
    } else {
      AudioFX.playError();
    }
  } else if (data.status === 'FINISHED_DRAW') {
    elements.gameResultCard.classList.remove('hidden');
    elements.resultIcon.textContent = '🤝';
    elements.resultTitle.textContent = 'Honorable Stalemate!';
    elements.resultSubtitle.textContent = 'All 9 cells filled with no victor.';
    elements.rematchBtn.disabled = false;
    elements.rematchBtn.innerHTML = '<span>Request Rematch</span>';
  } else if (data.status === 'PLAYER_DISCONNECTED') {
    elements.statusNotice.textContent = 'Opponent disconnected from the match.';
    showToast('Opponent lost connection.', true);
  } else if (data.status === 'IN_PROGRESS') {
    elements.gameResultCard.classList.add('hidden');
  }
}

// ==========================================
// EVENT LISTENERS & CLIPBOARD
// ==========================================
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(`Copied ${text} to clipboard!`);
  }).catch(() => {
    showToast(`Room code: ${text}`);
  });
}

// Bind clicks
elements.createRoomBtn.addEventListener('click', handleCreateRoom);
elements.joinRoomBtn.addEventListener('click', handleJoinRoom);

elements.roomCodeInput.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') handleJoinRoom();
});

elements.copyCodeBtn.addEventListener('click', () => {
  if (state.roomCode) copyToClipboard(state.roomCode);
});
elements.gameCopyBtn.addEventListener('click', () => {
  if (state.roomCode) copyToClipboard(state.roomCode);
});

elements.cancelRoomBtn.addEventListener('click', () => {
  switchView('welcome');
});

elements.leaveGameBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to surrender and leave the arena?')) {
    switchView('welcome');
  }
});

elements.returnHomeBtn.addEventListener('click', () => {
  switchView('welcome');
});

elements.rematchBtn.addEventListener('click', handleRequestRematch);

// Board Cell Clicks
elements.cells.forEach(cell => {
  cell.addEventListener('click', () => {
    const index = parseInt(cell.getAttribute('data-index'), 10);
    handleCellClick(index);
  });
});

// Config Settings Modal
elements.configToggleBtn.addEventListener('click', () => {
  elements.backendUrlInput.value = CONFIG.backendUrl;
  elements.configModal.classList.remove('hidden');
});
elements.closeConfigBtn.addEventListener('click', () => {
  elements.configModal.classList.add('hidden');
});
elements.saveConfigBtn.addEventListener('click', () => {
  const newUrl = elements.backendUrlInput.value.trim();
  if (newUrl) {
    CONFIG.backendUrl = newUrl;
    localStorage.setItem('ttt_backend_url', newUrl);
    showToast('Saved! Reconnecting to ' + newUrl);
    initWebSocket();
  }
  elements.configModal.classList.add('hidden');
});

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
  if (state.username) {
    elements.usernameInput.value = state.username;
  }
  initWebSocket();
});
