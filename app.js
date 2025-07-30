document.addEventListener('DOMContentLoaded', () => {
    console.log('App.js loaded. Welcome!');

    // You can add more interactive elements here that the service worker might eventually cache.
    const messageElement = document.createElement('p');
    messageElement.textContent = 'This content is from app.js.';
    document.body.appendChild(messageElement);
});
