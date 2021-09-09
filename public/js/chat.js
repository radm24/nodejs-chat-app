const socket = io();

// DOM Elements
const $messages = document.querySelector('#messages');
const $sendLocationButton = document.querySelector('#send-location');

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild;

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // Visible height
    const visibleHeight = $messages.offsetHeight;

    // Height of messages container
    const containerHeight = $messages.scrollHeight;

    // How far have I scrolled?
    const scrollOffset = Math.ceil($messages.scrollTop + visibleHeight);  // using Math.ceil due to buggy scrollTop in Opera

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }
}

document.querySelector('#message-form').addEventListener('submit', e => {
    e.preventDefault();
    const $messageInput = document.querySelector('#message-input');

    if ($messageInput.value) {
        const $sendMessageButton = document.querySelector('#send-message');
        $sendMessageButton.setAttribute('disabled', true);
        
        socket.emit('sendMessage', $messageInput.value, (error) => {
            console.log(error ? error : 'The message was delivered!');
            $sendMessageButton.removeAttribute('disabled');
            $messageInput.value = '';
            $messageInput.focus();
        });
    }
})

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.');
    }
    $sendLocationButton.setAttribute('disabled', true);

    navigator.geolocation.getCurrentPosition(position => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            console.log('Location shared!');
            $sendLocationButton.removeAttribute('disabled');
        });
    });
})

document.querySelector('.leave-room').addEventListener('click', () => {
    document.querySelector('#dialog-box-wrapper').classList.remove('hidden');
    document.querySelector('body').style.pointerEvents = 'none';
})

document.querySelector('.dialog-box__yes').addEventListener('click', () => {
    location.href = '/';
})

document.querySelector('.dialog-box__no').addEventListener('click', () => {
    document.querySelector('#dialog-box-wrapper').classList.add('hidden');
    document.querySelector('body').style.pointerEvents = 'auto';
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = '/';
    }
});

socket.on('message', message => {
    const messageTemplate = document.querySelector('#message-template').innerHTML;
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('HH:mm')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
})

socket.on('locationMessage', message => {
    const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('HH:mm')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
})

socket.on('roomData', ({ room, users }) => {
    const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html;
})