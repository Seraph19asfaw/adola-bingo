const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// This part connects your Frontend and Backend
const io = new Server(server, {
    cors: { 
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

let currentNumber = null;
let gameHistory = [];

io.on('connection', (socket) => {
    console.log('A player joined Adola Bingo');
    
    // Send the current game state to the new player so they aren't behind
    socket.emit('gameState', { currentNumber, gameHistory });

    socket.on('drawNumber', () => {
        // Logic to pick a number between 1-75 that hasn't been picked yet
        if (gameHistory.length >= 75) {
            io.emit('statusUpdate', 'Game Over - All numbers called!');
            return;
        }

        let newNumber;
        do {
            newNumber = Math.floor(Math.random() * 75) + 1;
        } while (gameHistory.includes(newNumber));

        currentNumber = newNumber;
        gameHistory.push(newNumber);
        
        // Broadcast the number to EVERYONE connected
        io.emit('numberCalled', newNumber);
    });

    // Reset game logic
    socket.on('resetGame', () => {
        currentNumber = null;
        gameHistory = [];
        io.emit('gameState', { currentNumber, gameHistory });
        io.emit('statusUpdate', 'Game Reset by Admin');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Adola Bingo Server is running on port ${PORT}`);
});
