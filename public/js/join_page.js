const socket = io();

socket.on('roomList', rooms => {
    const $roomInput = document.querySelector('#room');
    const roomListTemplate = document.querySelector('#rooms-list-template').innerHTML;
    const html = Mustache.render(roomListTemplate, { rooms });
    $roomInput.insertAdjacentHTML('afterend', html);
})