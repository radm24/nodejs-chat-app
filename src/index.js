const path = require('path');
const http = require('http');
const express = require('express');
const socket = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socket(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

io.on('connection', socket => {
    socket.on('join', (userData, cb) => {
        const { error, user } = addUser({ id: socket.id, ...userData });
        if (error) {
            cb(error);
        } else {
            socket.join(user.room);
            socket.emit('message', generateMessage('Admin', 'Welcome!'));
            socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined the chat.`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            });
            cb();
        }
    })

    socket.on('sendMessage', (msg, cb) => {
        const filter = new Filter();
        if (filter.isProfane(msg)) {
            cb('Profanity is now allowed!');
        } else {
            const user = getUser(socket.id);
            io.to(user.room).emit('message', generateMessage(user.username, msg));
            cb();
        }
    })

    socket.on('sendLocation', ({ latitude, longitude }, cb) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${latitude}%2C${longitude}`));
        cb();
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left the chat.`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log('Server is up on port ' + port);
})