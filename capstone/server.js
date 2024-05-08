const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",  // 모든 도메인 허용
        methods: ["GET", "POST"], // 허용 메소드
        credentials: true
    }
});

const PORT = process.env.PORT || 3000;
const users = {};

app.use(cors({
    origin: '*',  // 모든 도메인 허용
    credentials: true
}));

io.on('connection', (socket) => {
    console.log('user connected');
    
    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });

    socket.on('nickname', (data) => {
        users[socket.id] = { nickname:data.nickname, matched:false };
        console.log(`${data.nickname} connected.`);
        
        const otherIds = Object.keys(users).filter(id => id !== socket.id && !users[id].matched);
        if (otherIds.length > 0) {
            const otherId = otherIds[0];
            users[socket.id].matched = otherId;
            users[otherId].matched = socket.id;

            socket.emit('match', { nickname: users[otherId].nickname });
            io.to(otherId).emit('match', { nickname: users[socket.id].nickname });
        }
    });

    socket.on('send message', (text) => {
        const message = { _id: Math.random().toString(36).substr(2, 9), text, createdAt: new Date(), user: {_id: 2} }; // Assuming all messages come from another user with ID 2
        socket.broadcast.emit('receive message', message);  // Broadcast message to all other clients
    });

    socket.on('disconnect', () => {
        console.log(`${users[socket.id] || 'A user'} disconnected`);
        if (users[socket.id]?.matched) {
            io.to(users[socket.id].matched).emit('user disconnected');
            delete users[users[socket.id].matched];
        }
        delete users[socket.id];
    });
});

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

