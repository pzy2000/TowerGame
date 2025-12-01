const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, '../public')));

const rooms = new Map(); // roomId -> { players: [socketId, ...], state: ... }

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join_game', () => {
        let roomId = null;
        // Find a room with 1 player
        for (const [id, room] of rooms) {
            if (room.players.length === 1) {
                roomId = id;
                break;
            }
        }

        if (!roomId) {
            roomId = Math.random().toString(36).substring(7);
            rooms.set(roomId, { players: [socket.id], gameStarted: false });
            socket.join(roomId);
            socket.emit('waiting_for_opponent', { roomId });
        } else {
            const room = rooms.get(roomId);
            room.players.push(socket.id);
            socket.join(roomId);
            room.gameStarted = true;

            // Assign roles/sides
            const player1 = room.players[0];
            const player2 = room.players[1];

            // Player 1 is Left, Player 2 is Right
            io.to(player1).emit('game_start', { roomId, opponentId: player2, side: 'left' });
            io.to(player2).emit('game_start', { roomId, opponentId: player1, side: 'right' });

            console.log(`Game started in room ${roomId}`);
        }
    });

    // Relay game events
    socket.on('game_event', (data) => {
        const { roomId, type, payload } = data;
        if (roomId && rooms.has(roomId)) {
            if (type === 'sync_check') {
                const room = rooms.get(roomId);
                // Store checksum for this tick
                if (!room.syncState) room.syncState = {};

                const tick = payload.tick;
                if (!room.syncState[tick]) {
                    room.syncState[tick] = { [socket.id]: payload.checksum };
                } else {
                    room.syncState[tick][socket.id] = payload.checksum;

                    // Check for mismatch
                    const checksums = Object.values(room.syncState[tick]);
                    if (checksums.length === 2) {
                        if (checksums[0] !== checksums[1]) {
                            console.warn(`Sync Mismatch in room ${roomId} at tick ${tick}: ${checksums[0]} vs ${checksums[1]}`);
                            io.to(roomId).emit('game_event', {
                                type: 'sync_mismatch',
                                payload: { tick, serverMsg: `Mismatch detected! ${checksums[0]} vs ${checksums[1]}` }
                            });
                        }
                        // Cleanup old ticks
                        delete room.syncState[tick];
                    }
                }
            } else {
                // Validate side constraints (Basic validation)
                // Ideally we should store side in room.players object but for now we trust client side ID check or just relay
                // To be more secure, we should map socketId to side in the room object.

                socket.to(roomId).emit('game_event', { type, payload, sender: socket.id });
            }
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // Handle cleanup
        for (const [id, room] of rooms) {
            if (room.players.includes(socket.id)) {
                socket.to(id).emit('opponent_disconnected');
                rooms.delete(id);
                break;
            }
        }
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
