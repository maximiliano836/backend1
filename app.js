const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const ProductManager = require('./managers/ProductManager');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const pm = new ProductManager();

const exphbs = require('express-handlebars');
app.engine('hbs', exphbs.engine({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts')
}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/products', require('./routes/api/products'));
app.use('/api/carts', require('./routes/api/carts'));
app.use('/', require('./routes/index'));

app.use((req, res) => {
  res.status(404).render('404', { title: '404 - Página no encontrada' });
});

io.on('connection', function(socket) {
  pm.getProducts().then(function(products) {
    socket.emit('products', products);
  });

  socket.on('addProduct', function(prod) {
    if (prod && prod.title && !isNaN(prod.price)) {
      pm.addProduct({
        title: prod.title,
        description: prod.description || '',
        code: prod.code || '',
        price: prod.price,
        status: true,
        stock: prod.stock || 1,
        category: prod.category || '',
        thumbnails: prod.thumbnails || []
      }).then(function() {
        pm.getProducts().then(function(updated) {
          io.emit('products', updated);
        });
      });
    }
  });

  socket.on('deleteProduct', function(title) {
    pm.getProducts().then(function(products) {
      var prod = products.find(function(p) { return p.title === title; });
      if (prod) {
        pm.deleteProduct(prod.id).then(function() {
          pm.getProducts().then(function(updated) {
            io.emit('products', updated);
          });
        });
      }
    });
  });
});

const PORT = 8080;
server.listen(PORT, function() {
  console.log('Servidor ejecutándose en http://localhost:' + PORT);
});