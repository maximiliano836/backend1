document.addEventListener('DOMContentLoaded', async () => {
  const socket = io();
  let username = null;

  const form = document.getElementById('chatForm');
  const input = document.getElementById('messageInput');
  const messages = document.getElementById('messages');
  const disconnectBtn = document.getElementById('disconnectBtn');

  if (!form || !input || !messages) {
    console.warn("⚠️ No se encontraron elementos del chat en esta vista.");
    return;
  }

  // Pedir nombre con SweetAlert
  const { value: name } = await Swal.fire({
    title: '¡Bienvenido!',
    text: 'Ingresa tu UserName para comenzar a Chatear',
    input: 'text',
    inputPlaceholder: 'Ingrese acá su nombre...',
    allowOutsideClick: false,
    inputValidator: (value) => {
      if (!value) {
        return 'Debes ingresar tu UserName';
      }
    }
  });

  username = name;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (input.value.trim() !== '') {
      socket.emit('chat message', `${username}: ${input.value}`);
      input.value = '';
    }
  });

  socket.on('chat message', function (msg) {
    const item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
  });

  disconnectBtn.addEventListener('click', () => {
    socket.disconnect();
    Swal.fire({
      title: 'Desconectado',
      text: 'Has sido desconectado del chat.',
      icon: 'info',
      confirmButtonText: 'Aceptar'
    });
  });
});