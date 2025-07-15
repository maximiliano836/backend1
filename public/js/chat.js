document.addEventListener('DOMContentLoaded', () => {
  const socket = io();

  const form = document.getElementById('chatForm');
  const input = document.getElementById('messageInput');
  const messages = document.getElementById('messages');

  if (!form || !input || !messages) {
    console.warn("⚠️ No se encontraron elementos del chat en esta vista.");
    return;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (input.value.trim() !== '') {
      socket.emit('chat message', input.value);
      input.value = '';
    }
  });

  socket.on('chat message', function (msg) {
    const item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
  });
});