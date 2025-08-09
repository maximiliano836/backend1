const express = require('express');
const CartManager = require('../../managers/CartManager');
const { validateId, handleAsync } = require('../../middleware/validation');
const router = express.Router();
const cm = new CartManager();

router.post('/', handleAsync(async (req, res) => {
  const cart = await cm.createCart();
  res.status(201).json(cart);
}));

router.get('/:cid', validateId('cid'), handleAsync(async (req, res) => {
  const cart = await cm.getCartById(req.params.cid);
  if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
  res.json(cart.products);
}));

router.post('/:cid/product/:pid', validateId('cid'), validateId('pid'), handleAsync(async (req, res) => {
  const cart = await cm.addProductToCart(req.params.cid, req.params.pid);
  if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
  res.json(cart);
}));

module.exports = router;
