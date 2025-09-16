
const { Router } = require('express');
const products = require('../managers/ProductManagerMongo');
const Cart = require('../models/Cart');
const router = Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

function getUserFromToken(req) {
  const token = req.cookies && req.cookies.token;
  if (!token) return null;
  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// Logout
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});

// Perfil
router.get('/profile', async (req, res) => {
  const tokenUser = getUserFromToken(req);
  if (!tokenUser) return res.redirect('/login');
  const User = require('../models/User');
  const user = await User.findById(tokenUser.uid).lean();
  if (!user) return res.redirect('/login');
  res.render('profile', { layout: 'main', user });
});

router.get('/register', (req, res) => {
  const user = getUserFromToken(req);
  if (user) return res.redirect('/');
  res.render('register', { layout: 'main', error: req.query.error });
});

router.post('/register', async (req, res) => {
  try {
    const { first_name, last_name, email, age, password } = req.body;
    if (!first_name || !last_name || !email || !password || age == null) {
      return res.render('register', { layout: 'main', error: 'Faltan campos obligatorios' });
    }
    const User = require('../models/User');
    const exists = await User.findOne({ email });
    if (exists) {
      return res.render('register', { layout: 'main', error: 'El email ya está registrado' });
    }
    const hash = bcrypt.hashSync(String(password), 10);
    const user = await User.create({ first_name, last_name, email, age: Number(age), password: hash });
    const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';
    const JWT_EXPIRES = process.env.JWT_EXPIRES || '1d';
    const token = jwt.sign({ uid: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
    return res.redirect('/');
  } catch (err) {
    return res.render('register', { layout: 'main', error: 'Error al registrar usuario' });
  }
});

router.get('/login', (req, res) => {
  const user = getUserFromToken(req);
  if (user) return res.redirect('/');
  let msg = req.query.error;
  let success = req.query.success ? 'Usuario creado correctamente. Ahora inicia sesión.' : null;
  res.render('login', { layout: 'main', error: msg, success });
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.render('login', { layout: 'main', error: 'Faltan credenciales' });
    }
    const User = require('../models/User');
    const user = await User.findOne({ email });
    if (!user) {
      return res.render('login', { layout: 'main', error: 'Usuario no existe' });
    }
    const ok = bcrypt.compareSync(String(password), user.password);
    if (!ok) {
      return res.render('login', { layout: 'main', error: 'Contraseña incorrecta' });
    }
    // Generar JWT y setear cookie
    const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';
    const JWT_EXPIRES = process.env.JWT_EXPIRES || '1d';
    const token = jwt.sign({ uid: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
    return res.redirect('/');
  } catch (err) {
    return res.render('login', { layout: 'main', error: 'Error al iniciar sesión' });
  }
});

router.get('/', (req, res) => {
  const user = getUserFromToken(req);
  res.render('home', { layout: 'main', user });
});

router.get('/realtimeproducts', (req, res) => {
  const user = getUserFromToken(req);
  res.render('realTimeProducts', { layout: 'main', user });
});

router.get('/products', async (req, res) => {
  try {
    const user = getUserFromToken(req);
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const sort = req.query.sort === 'asc' || req.query.sort === 'desc' ? req.query.sort : undefined;
    const query = req.query.query || undefined;

    const { docs, total } = await products.getProductsPaginated({ limit, page, sort, query });
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const currentPage = Math.min(Math.max(1, page), totalPages);

    res.render('products', {
      layout: 'main',
      products: docs,
      currentPage,
      totalPages,
      hasPrevPage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
      prevPage: currentPage > 1 ? currentPage - 1 : null,
      nextPage: currentPage < totalPages ? currentPage + 1 : null,
      query: query || '',
      sort: sort || '',
      user
    });
  } catch (err) {
    res.status(500).render('404', { layout: 'main', message: 'Error al cargar productos' });
  }
});

router.get('/products/:id', async (req, res) => {
  try {
    const item = await products.getProductById(req.params.id);
    if (!item) return res.status(404).render('404', { layout: 'main', message: 'Producto no encontrado' });
    res.render('productDetail', { layout: 'main', product: item });
  } catch (err) {
    res.status(500).render('404', { layout: 'main', message: 'Error al cargar producto' });
  }
});

router.get('/carts/:cid', async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid).populate('products.product');
    
    if (!cart) return res.status(404).render('404', { layout: 'main', message: 'Carrito no encontrado' });
  const validProducts = cart.products.filter(item => item.product !== null);
    
    if (validProducts.length !== cart.products.length) {
      cart.products = validProducts;
      await cart.save();
    }
    
    res.render('cart', { layout: 'main', cart });
  } catch (err) {
    res.status(500).render('404', { layout: 'main', message: 'Error al cargar carrito' });
  }
});

module.exports = router;