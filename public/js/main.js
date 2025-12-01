const socket = io();

const canvas = document.getElementById('game-canvas');
const myHealthEl = document.getElementById('my-health');
const myResourceEl = document.getElementById('my-resource');
const oppHealthEl = document.getElementById('opp-health');
const oppResourceEl = document.getElementById('opp-resource');
const msgEl = document.getElementById('game-message');

let myHealth = 20;
let myResource = 400;
let oppHealth = 20;
let roomId = null;
let isGameActive = false;
let mySide = null;

// User ID Persistence
let userId = localStorage.getItem('userId');
if (!userId) {
    userId = Math.random().toString(36).substring(7);
    localStorage.setItem('userId', userId);
}

const COSTS = {
    tower_basic: 50,
    tower_rapid: 120,
    tower_slow: 150,
    tower_inferno: 200,
    monster_fast: 30,
    monster_tank: 80,
    monster_titan: 200
};

const game = new Game(canvas, {
    onBuild: (type, x, y) => {
        if (myResource >= COSTS[type]) {
            myResource -= COSTS[type];
            updateUI();
            game.addTower(type, x, y, mySide);
            socket.emit('game_event', { roomId, type: 'build_tower', payload: { type, x, y, side: mySide } });
        }
    },
    onBaseHit: (damage) => {
        myHealth -= damage;
        updateUI();
        socket.emit('game_event', { roomId, type: 'health_update', payload: { health: myHealth } });
        if (myHealth <= 0) {
            endGame(false);
        }
    },
    onMonsterKilled: (reward) => {
        myResource += reward;
        updateUI();
    },
    onSyncCheck: (tick, checksum) => {
        if (isGameActive) {
            socket.emit('game_event', { roomId, type: 'sync_check', payload: { tick, checksum } });
        }
    }
});

function updateUI() {
    myHealthEl.innerText = myHealth;
    myResourceEl.innerText = Math.floor(myResource);
    oppHealthEl.innerText = oppHealth;
}

window.selectTower = (type) => {
    if (!isGameActive) return;
    if (myResource >= COSTS[type]) {
        game.buildMode = type;
        document.body.style.cursor = 'crosshair';
        document.querySelectorAll('.unit-btn').forEach(b => b.classList.remove('selected'));
        document.querySelector(`.unit-btn[data-type="${type}"]`).classList.add('selected');
    } else {
        showFloatingText("Not enough resources!", window.innerWidth / 2, window.innerHeight - 100);
    }
};

window.spawnMonster = (type) => {
    if (!isGameActive) return;
    if (myResource >= COSTS[type]) {
        myResource -= COSTS[type];
        updateUI();
        game.spawnMonster(type, mySide);
        socket.emit('game_event', { roomId, type: 'spawn_monster', payload: { type, side: mySide } });
        showFloatingText(`Sent ${type}!`, window.innerWidth / 2, window.innerHeight - 100);
    } else {
        showFloatingText("Not enough resources!", window.innerWidth / 2, window.innerHeight - 100);
    }
};

function showFloatingText(text, x, y) {
    const el = document.createElement('div');
    el.className = 'pop-text';
    el.innerText = text;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.color = '#ff4081';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
}

function endGame(win) {
    isGameActive = false;
    msgEl.innerText = win ? "VICTORY! 🏆" : "DEFEAT 💀";
    msgEl.style.color = win ? "#00e676" : "#ff1744";
    socket.emit('game_event', { roomId, type: 'game_over', payload: { winner: win ? socket.id : 'opponent' } });
}

// Socket Events
socket.on('connect', () => {
    msgEl.innerText = "Connected. Joining...";
    socket.emit('join_game', { userId });
});

socket.on('waiting_for_opponent', (data) => {
    roomId = data.roomId;
    msgEl.innerText = `Room: ${roomId}. Waiting for opponent...`;
});

socket.on('game_start', (data) => {
    roomId = data.roomId;
    mySide = data.side;
    game.setSide(mySide);

    msgEl.innerText = `BATTLE START! You are ${mySide.toUpperCase()}`;
    isGameActive = true;
    game.start();

    setInterval(() => {
        if (isGameActive) {
            myResource += 5;
            updateUI();
        }
    }, 1000);
});

// Reconnection: Request State
socket.on('request_state_sync', (data) => {
    // Opponent reconnected, send my state
    const snapshot = game.getSnapshot();
    // Add global state
    snapshot.oppHealth = myHealth; // My health is opponent's opponent health
    snapshot.oppResource = myResource; // Optional

    socket.emit('game_event', { roomId, type: 'sync_state', payload: snapshot });
});

// Reconnection: Receive State
socket.on('sync_state', (data) => {
    // I reconnected, load state
    game.loadSnapshot(data.payload);
    oppHealth = data.payload.oppHealth;
    updateUI();

    msgEl.innerText = `RECONNECTED! You are ${mySide.toUpperCase()}`;
    isGameActive = true;
    game.start();
});

socket.on('game_event', (data) => {
    if (data.type === 'spawn_monster') {
        game.spawnMonster(data.payload.type, data.payload.side);
        showFloatingText("Incoming!", window.innerWidth / 2, 100);
    } else if (data.type === 'build_tower') {
        game.addTower(data.payload.type, data.payload.x, data.payload.y, data.payload.side);
    } else if (data.type === 'health_update') {
        oppHealth = data.payload.health;
        updateUI();
        if (oppHealth <= 0) {
            endGame(true);
        }
    } else if (data.type === 'opponent_disconnected') {
        msgEl.innerText = "Opponent Disconnected. Waiting for reconnect...";
        // Don't end game immediately, allow reconnect
    } else if (data.type === 'sync_state') {
        // Handled above
    } else if (data.type === 'sync_mismatch') {
        console.warn(`Sync Mismatch at tick ${data.payload.tick}! Server says: ${data.payload.serverMsg}`);
        showFloatingText("Sync Error!", window.innerWidth / 2, 50);
    }
});
