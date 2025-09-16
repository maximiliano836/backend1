const { Router } = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../../models/User');
const Cart = require('../../models/Cart');

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '1d';

function createToken(user) {
  return jwt.sign({ uid: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

router.post('/register', async (req, res, next) => {
  try {
    const { first_name, last_name, email, age, password } = req.body;
    if (!first_name || !last_name || !email || !password || age == null) {
      return res.status(400).json({ status: 'error', error: 'Faltan campos' });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ status: 'error', error: 'Email ya registrado' });

    const hash = bcrypt.hashSync(String(password), 10);
    const cart = await Cart.create({ products: [] });
    const user = await User.create({ first_name, last_name, email, age: Number(age), password: hash, cart: cart._id });
    res.status(201).json({ status: 'success', user: { id: user._id, email: user.email } });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ status: 'error', error: 'Faltan credenciales' });
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ status: 'error', error: 'Credenciales inválidas' });
    const ok = bcrypt.compareSync(String(password), user.password);
    if (!ok) return res.status(401).json({ status: 'error', error: 'Credenciales inválidas' });

    const token = createToken(user);
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
    res.json({ status: 'success', token });
  } catch (err) {
    next(err);
  }
});

router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
  const u = req.user;
  res.json({
    status: 'success',
    user: {
      id: u._id,
      first_name: u.first_name,
      last_name: u.last_name,
      email: u.email,
      age: u.age,
      role: u.role,
      cart: u.cart
    }
  });
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ status: 'success' });
});

module.exports = router;
