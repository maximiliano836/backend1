const express = require('express');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { engine } = require('express-handlebars');

const indexRouter = require('./routes/index');

const app = express();
const server = createServer(app);
const io = new Server(server);

// Configuración de motores de vistas
app.engine('hbs', engine({ extname: '.hbs', defaultLayout: 'main', layoutsDir: path.join(__dirname, 'views/layouts') }));
app.set('views', path.join(__dirname, 'views'));

// Seleccioná el motor predeterminado según el archivo que vas a usar
const USE_HBS = true;

if (USE_HBS) {
  app.set('view engine', 'hbs');
} else {
  app.set('view engine', 'ejs');
}

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rutas
app.use('/', indexRouter);

// Ruta 404
app.use((req, res) => {
  const view = USE_HBS ? '404' : '404'; // Podés poner condiciones por tipo si querés 404_hbs vs 404_ejs
  res.status(404).render(view, { title: '404 - Página no encontrada' });
});

// WebSockets
io.on('connection', (socket) => {
  console.log('🟢 Usuario conectado');

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('🔴 Usuario desconectado');
  });
});

// Iniciar servidor
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`✅ Servidor en http://localhost:${PORT}`);
});