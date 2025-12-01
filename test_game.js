const io = require('socket.io-client');

const URL = 'http://localhost:3001';

const client1 = io(URL);
const client2 = io(URL);

let client1Id, client2Id;
let roomId;
let client1Side, client2Side;

console.log('Connecting clients...');

client1.on('connect', () => {
    console.log('Client 1 connected');
    client1.emit('join_game');
});

client2.on('connect', () => {
    console.log('Client 2 connected');
    setTimeout(() => {
        client2.emit('join_game');
    }, 500);
});

client1.on('waiting_for_opponent', (data) => {
    console.log('Client 1 waiting in room:', data.roomId);
    roomId = data.roomId;
});

client1.on('game_start', (data) => {
    console.log('Client 1: Game Started!', data);
    client1Side = data.side;

    // Client 1 builds an Inferno Tower
    setTimeout(() => {
        console.log(`Client 1 (${client1Side}) building Inferno Tower...`);
        client1.emit('game_event', {
            roomId,
            type: 'build_tower',
            payload: { type: 'tower_inferno', x: 100, y: 300, side: client1Side }
        });
    }, 500);
});

client2.on('game_start', (data) => {
    console.log('Client 2: Game Started!', data);
    client2Side = data.side;
});

client2.on('game_event', (data) => {
    if (data.type === 'build_tower') {
        if (data.payload.type === 'tower_inferno') {
            console.log('SUCCESS: Inferno Tower build received.');
            process.exit(0);
        }
    }
});

setTimeout(() => {
    console.log('Test timed out.');
    process.exit(1);
}, 5000);
