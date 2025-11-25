const io = require('socket.io-client');

const URL = 'http://localhost:3001';

const user1 = { userId: 'user1' };
const user2 = { userId: 'user2' };

const client1 = io(URL);
let client2 = io(URL);

let roomId;

console.log('Connecting clients...');

client1.on('connect', () => {
    console.log('Client 1 connected');
    client1.emit('join_game', user1);
});

client2.on('connect', () => {
    console.log('Client 2 connected');
    setTimeout(() => {
        client2.emit('join_game', user2);
    }, 500);
});

client1.on('game_start', (data) => {
    console.log('Client 1: Game Started!', data);
    roomId = data.roomId;
});

client2.on('game_start', (data) => {
    console.log('Client 2: Game Started!', data);

    if (!client2.hasDisconnected) {
        client2.hasDisconnected = true;
        setTimeout(() => {
            console.log('Client 2 disconnecting...');
            client2.disconnect();

            setTimeout(() => {
                console.log('Client 2 reconnecting...');
                client2.connect();
                client2.emit('join_game', user2);
            }, 1000);
        }, 2000);
    }
});

client1.on('request_state_sync', () => {
    console.log('Client 1 received request_state_sync. Sending state...');
    client1.emit('game_event', { roomId, type: 'sync_state', payload: { towers: [], monsters: [], oppHealth: 20 } });
});

client2.on('game_event', (data) => {
    if (data.type === 'sync_state') {
        console.log('Client 2 received sync_state via game_event!');
        console.log('SUCCESS: Reconnection and State Sync verified.');
        process.exit(0);
    }
});

setTimeout(() => {
    console.log('Test timed out.');
    process.exit(1);
}, 8000);
