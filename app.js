const express = require('express');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { engine } = require('express-handlebars');

const indexRouter = require('./routes/index');

const app = express();
const server = createServer(app);
const io = new Server(server);

// Configuración de Handlebars
app.engine('hbs', engine({ 
  extname: '.hbs', 
  defaultLayout: 'main', 
  layoutsDir: path.join(__dirname, 'views/layouts') 
}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rutas
app.use('/', indexRouter);

// Ruta 404
app.use((req, res) => {
  res.status(404).render('404', { title: '404 - Página no encontrada' });
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
  console.log(`✅ Servidor ejecutándose en http://localhost:${PORT}`);
});