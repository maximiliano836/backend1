const { Router } = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const User = require('../../models/User');

const router = Router();

function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ status: 'error', error: 'Permisos insuficientes' });
}

router.get('/', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) { next(err); }
});

router.get('/:id', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
  try {
    const u = await User.findById(req.params.id).select('-password');
    if (!u) return res.status(404).json({ status: 'error', error: 'No encontrado' });
    res.json(u);
  } catch (err) { next(err); }
});

router.post('/', passport.authenticate('jwt', { session: false }), requireAdmin, async (req, res, next) => {
  try {
    const { first_name, last_name, email, age, password, role } = req.body;
    if (!first_name || !last_name || !email || !password || age == null) return res.status(400).json({ status: 'error', error: 'Faltan campos' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ status: 'error', error: 'Email ya registrado' });
    const hash = bcrypt.hashSync(String(password), 10);
    const user = await User.create({ first_name, last_name, email, age: Number(age), password: hash, role: role || 'user' });
    res.status(201).json({ id: user._id, email: user.email });
  } catch (err) { next(err); }
});

router.put('/:id', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (body.password) {
      body.password = bcrypt.hashSync(String(body.password), 10);
    }
    if (req.user.role !== 'admin') {
      delete body.role;
    }
    const u = await User.findByIdAndUpdate(req.params.id, body, { new: true }).select('-password');
    if (!u) return res.status(404).json({ status: 'error', error: 'No encontrado' });
    res.json(u);
  } catch (err) { next(err); }
});

router.delete('/:id', passport.authenticate('jwt', { session: false }), requireAdmin, async (req, res, next) => {
  try {
    const u = await User.findByIdAndDelete(req.params.id);
    if (!u) return res.status(404).json({ status: 'error', error: 'No encontrado' });
    res.json({ status: 'success' });
  } catch (err) { next(err); }
});

module.exports = router;
