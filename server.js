const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

let currentNumber = null;
let gameHistory = [];

io.on('connection', (socket) => {
    console.log('A player joined');
    
    // Send the current game state to the new player
    socket.emit('gameState', { currentNumber, gameHistory });

    socket.on('drawNumber', () => {
        let newNumber = Math.floor(Math.random() * 75) + 1;
        currentNumber = newNumber;
        gameHistory.push(newNumber);
        
        // Broadcast the number to EVERYONE
        io.emit('numberCalled', newNumber);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
