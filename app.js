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

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ 
    error: 'Error interno del servidor'
  });
});

app.use((req, res) => {
  res.status(404).render('404', { title: '404 - Página no encontrada' });
});

io.on('connection', function(socket) {
  console.log('Cliente conectado:', socket.id);
  
  pm.getProducts().then(function(products) {
    socket.emit('products', products);
  }).catch(function(error) {
    console.error('Error al obtener productos para socket:', error);
    socket.emit('error', { message: 'Error al cargar productos' });
  });

  socket.on('addProduct', function(prod) {
    try {
      if (!prod || typeof prod !== 'object') {
        socket.emit('error', { message: 'Datos de producto inválidos' });
        return;
      }

      if (!prod.title || !prod.title.trim()) {
        socket.emit('error', { message: 'El título es obligatorio' });
        return;
      }

      if (prod.price == null || isNaN(prod.price) || prod.price < 0) {
        socket.emit('error', { message: 'El precio debe ser un número válido mayor o igual a 0' });
        return;
      }

      const productData = {
        title: prod.title.trim(),
        description: prod.description ? prod.description.trim() : '',
        price: Number(prod.price),
        status: true,
        stock: prod.stock != null ? Number(prod.stock) : 1,
        category: prod.category ? prod.category.trim() : 'General',
        thumbnails: Array.isArray(prod.thumbnails) ? prod.thumbnails : []
      };

      pm.addProduct(productData).then(function() {
        return pm.getProducts();
      }).then(function(updated) {
        io.emit('products', updated);
        socket.emit('productAdded', { message: 'Producto agregado correctamente' });
      }).catch(function(error) {
        console.error('Error al agregar producto via socket:', error);
        socket.emit('error', { message: error.message || 'Error al agregar producto' });
      });
    } catch (error) {
      console.error('Error en addProduct socket:', error);
      socket.emit('error', { message: 'Error inesperado al procesar el producto' });
    }
  });

  socket.on('deleteProduct', function(title) {
    try {
      if (!title || typeof title !== 'string' || !title.trim()) {
        socket.emit('error', { message: 'Título de producto inválido' });
        return;
      }

      pm.getProducts().then(function(products) {
        var prod = products.find(function(p) { return p.title === title.trim(); });
        if (!prod) {
          socket.emit('error', { message: 'Producto no encontrado' });
          return;
        }
        
        return pm.deleteProduct(prod.id).then(function() {
          return pm.getProducts();
        }).then(function(updated) {
          io.emit('products', updated);
          socket.emit('productDeleted', { message: 'Producto eliminado correctamente' });
        });
      }).catch(function(error) {
        console.error('Error al eliminar producto via socket:', error);
        socket.emit('error', { message: error.message || 'Error al eliminar producto' });
      });
    } catch (error) {
      console.error('Error en deleteProduct socket:', error);
      socket.emit('error', { message: 'Error inesperado al eliminar el producto' });
    }
  });

  socket.on('disconnect', function() {
    console.log('Cliente desconectado:', socket.id);
  });
});

const PORT = 8080;
server.listen(PORT, function() {
  console.log('Servidor ejecutándose en http://localhost:' + PORT);
});