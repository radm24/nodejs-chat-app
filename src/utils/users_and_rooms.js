const users = [];
const rooms = [];

const addUser = ({ id, username, room }) => {
    // Clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // Validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }

    // Check for existing user
    const existingUser = users.find(user => {
        return user.room === room && user.username === username;
    })

    // Validate username
    if (existingUser) {
        return {
            error: 'Username is in use!'
        }
    }

    // Store user
    checkAndAddRoom(room);
    const user = { id, username, room };
    users.push(user);
    return { user };
}

const removeUser = id => {
    const index = users.findIndex(user => user.id === id);

    if (index !== -1) {
        const user = users.splice(index, 1)[0];
        checkAndRemoveRoom(user.room);
        return user;
    }
}

const getUser = id => {
    return users.find(user => user.id === id);
}

const getUsersInRoom = room => {
    return users.filter(user => user.room === room);
}

const checkAndAddRoom = room => {
    const existingRoom = rooms.find(r => r === room);

    if (!existingRoom) {
        rooms.push(room);
    }
}

const checkAndRemoveRoom = room => {
    const isEmptyRoom = !users.find(user => user.room === room);

    if (isEmptyRoom) {
        const index = rooms.findIndex(r => r === room);
        rooms.splice(index, 1);
    }
}

const getRooms = () => rooms;

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
    getRooms
}