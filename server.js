const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// MongoDB Connection
const MONGO_URI = "mongodb+srv://suradola_admin:QQBjg09tQDdz9rkH@cluster0.abc.mongodb.net/adolaBingo?retryWrites=true&w=majority";
mongoose.connect(MONGO_URI).then(() => console.log("Business DB Connected"));

const User = mongoose.model('User', {
    tgId: String,
    name: String,
    balance: { type: Number, default: 50 }, // Registration Bonus
    history: Array
});

// Game State
let gameState = {
    status: "WAITING", // WAITING, PLAYING
    timer: 60,
    currentNumber: null,
    calledNumbers: [],
    players: []
};

// Auto-Game Loop (Runs every 1 second)
setInterval(() => {
    if (gameState.status === "WAITING") {
        gameState.timer--;
        if (gameState.timer <= 0) {
            gameState.status = "PLAYING";
            gameState.calledNumbers = [];
        }
    } else if (gameState.status === "PLAYING") {
        if (gameState.calledNumbers.length < 75) {
            let num;
            do { num = Math.floor(Math.random() * 75) + 1; } 
            while (gameState.calledNumbers.includes(num));
            
            gameState.currentNumber = num;
            gameState.calledNumbers.push(num);
            io.emit('numberCalled', num);
        } else {
            gameState.status = "WAITING";
            gameState.timer = 60; // Reset for next game
        }
    }
    io.emit('gameUpdate', gameState);
}, 2000); // Calls number every 2 seconds

io.on('connection', (socket) => {
    socket.on('join', async (tgData) => {
        let user = await User.findOne({ tgId: tgData.id });
        if (!user) user = await User.create({ tgId: tgData.id, name: tgData.first_name });
        socket.emit('updateBalance', user.balance);
    });

    // Mesfin's Approval Logic
    socket.on('adminApprove', async (data) => {
        const user = await User.findOne({ tgId: data.userId });
        if (user) {
            user.balance += parseFloat(data.amount);
            await user.save();
            io.emit(`balance_${data.userId}`, user.balance);
        }
    });
});

server.listen(process.env.PORT || 3000);
