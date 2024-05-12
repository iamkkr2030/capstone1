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
    origin: '*',  // 모든 도메인 허용ㅎ
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

    socket.on('send image', (data) => {
        const message = {
            _id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date(),
            user: {_id: 2}, // Static user ID for demo purposes
            image: data.image,
        };
        socket.broadcast.emit('receive message', message);
    });

    socket.on('disconnect', () => {
        const nickname = users[socket.id]?.nickname; // 닉네임만 반환하도록 수정  
        if (nickname) {
            console.log(`${nickname} disconnected`); // 닉네임이 있는 경우에만 로그 출력
            const exitMessage = {
                _id: Math.random().toString(36).substr(2, 9),
                text: `${nickname} has left the chat`, // 사용자 닉네임 사용
                createdAt: new Date(),
                system: true
            };
            io.emit('receive message', exitMessage);

            // 나머지 연결 해제 처리 로직...
            if (users[socket.id]?.matched) {
                io.to(users[socket.id].matched).emit('user disconnected');
                delete users[users[socket.id].matched];
            }
        } else {
        // 닉네임이 없는 경우 로그를 출력하지 않음
        }
        delete users[socket.id];
       });
    });

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
