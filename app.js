const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const mongoose = require('mongoose');
require('dotenv').config();
const pm = require('./managers/ProductManagerMongo');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const initPassport = require('./config/passport');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 })
.then(() => console.log('Conectado a MongoDB'))
.catch(err => console.error('Error conectando a MongoDB:', err));

const exphbs = require('express-handlebars');
app.engine('hbs', exphbs.engine({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true
  },
  helpers: {
    eq: function(a, b) { return a === b; },
    gt: function(a, b) { return Number(a) > Number(b); },
    and: function(a, b) { return a && b; },
    or: function(a, b) { return a || b; },
    toString: function(value) {
      try {
        if (value == null) return '';
        if (typeof value === 'object' && value._id && typeof value._id.toString === 'function') {
          return value._id.toString();
        }
        if (typeof value === 'object' && typeof value.toString === 'function' && value.toString !== Object.prototype.toString) {
          return value.toString();
        }
        if (typeof value === 'object' && '$oid' in value) {
          return String(value.$oid);
        }
        return String(value);
      } catch (_) {
        return '';
      }
    },
    multiply: function(a, b) { return (Number(a) || 0) * (Number(b) || 0); },
    calculateTotal: function(products) {
      if (!Array.isArray(products)) return 0;
      return products.reduce((total, item) => {
        if (!item || !item.product) return total;
        const quantity = Number(item.quantity) || 0;
        const price = Number(item.product.price) || 0;
        return total + (quantity * price);
      }, 0);
    },
    json: function(context) { return JSON.stringify(context); }
  }
}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
initPassport();
app.use(passport.initialize());

// Middleware simple para exponer el usuario autenticado en todas las vistas
app.use((req, res, next) => {
  const token = req.cookies && req.cookies.token;
  if (!token) {
    res.locals.user = null;
    return next();
  }
  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';
    const payload = jwt.verify(token, JWT_SECRET);
    // Guardamos datos mínimos del usuario (uid, email, role)
    res.locals.user = { id: payload.uid, email: payload.email, role: payload.role };
  } catch {
    res.locals.user = null;
  }
  next();
});

app.use('/api/products', require('./routes/api/products'));
app.use('/api/carts', require('./routes/api/carts'));
app.use('/api/sessions', require('./routes/api/sessions'));
app.use('/api/users', require('./routes/api/users'));
app.use('/', require('./routes/index'));

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.use((req, res) => {
  res.status(404).render('404', { title: '404 - Página no encontrada' });
});

io.on('connection', function(socket) {
  console.log('Cliente conectado:', socket.id);
  
  pm.getProducts({ limit: 1000 }).then(function(products) {
    socket.emit('products', products);
  }).catch(function() {
    socket.emit('error', { message: 'Error al cargar productos' });
  });

  socket.on('addProduct', function(prod) {
    if (!prod || typeof prod !== 'object') {
      socket.emit('error', { message: 'Datos de producto inválidos' });
      return;
    }
    if (!prod.title || !prod.title.trim()) {
      socket.emit('error', { message: 'El título es obligatorio' });
      return;
    }
    if (!prod.code || !prod.code.trim()) {
      socket.emit('error', { message: 'El código es obligatorio' });
      return;
    }
    if (prod.price == null || isNaN(prod.price) || Number(prod.price) < 0) {
      socket.emit('error', { message: 'Precio inválido' });
      return;
    }

    const productData = {
      title: prod.title.trim(),
      description: prod.description ? prod.description.trim() : '',
      code: prod.code.trim(),
      price: Number(prod.price),
      status: prod.status !== undefined ? !!prod.status : true,
      stock: prod.stock != null ? Number(prod.stock) : 0,
      category: prod.category ? prod.category.trim() : 'General',
      thumbnails: Array.isArray(prod.thumbnails) ? prod.thumbnails : []
    };

    pm.addProduct(productData)
      .then(() => pm.getProducts({ limit: 1000 }))
      .then((updated) => {
        io.emit('products', updated);
        socket.emit('productAdded', { message: 'Producto agregado' });
      })
      .catch((error) => {
        socket.emit('error', { message: error.message || 'Error al agregar producto' });
      });
  });

  socket.on('deleteProduct', function(productId) {
    if (!productId || !mongoose.isValidObjectId(productId)) {
      socket.emit('error', { message: 'ID inválido' });
      return;
    }
    pm.deleteProduct(productId)
      .then(() => pm.getProducts({ limit: 1000 }))
      .then((updated) => {
        io.emit('products', updated);
        socket.emit('productDeleted', { message: 'Producto eliminado' });
      })
      .catch((error) => {
        socket.emit('error', { message: error.message || 'Error al eliminar producto' });
      });
  });

  socket.on('disconnect', function() {
    console.log('Cliente desconectado:', socket.id);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, function() {
  console.log('Servidor ejecutándose en http://localhost:' + PORT);
});