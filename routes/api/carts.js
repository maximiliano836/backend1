const express = require('express');
const CartManager = require('../../managers/CartManagerMongo');
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
  const { quantity } = req.body;
  const cart = await cm.addProductToCart(req.params.cid, req.params.pid, quantity || 1);
  if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
  res.json(cart);
}));

router.delete('/:cid/products/:pid', validateId('cid'), validateId('pid'), handleAsync(async (req, res) => {
  const cart = await cm.removeProductFromCart(req.params.cid, req.params.pid);
  if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
  res.json(cart);
}));

router.put('/:cid', validateId('cid'), handleAsync(async (req, res) => {
  const { products } = req.body;
  if (!Array.isArray(products)) {
    return res.status(400).json({ error: 'Se requiere un array de productos' });
  }
  const cart = await cm.updateCart(req.params.cid, products);
  if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
  res.json(cart);
}));

router.put('/:cid/products/:pid', validateId('cid'), validateId('pid'), handleAsync(async (req, res) => {
  const { quantity } = req.body;
  if (!quantity || quantity < 1) {
    return res.status(400).json({ error: 'La cantidad debe ser mayor a 0' });
  }
  const cart = await cm.updateProductQuantity(req.params.cid, req.params.pid, quantity);
  if (!cart) return res.status(404).json({ error: 'Carrito o producto no encontrado' });
  res.json(cart);
}));

router.delete('/:cid', validateId('cid'), handleAsync(async (req, res) => {
  const cart = await cm.clearCart(req.params.cid);
  if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
  res.json(cart);
}));

module.exports = router;
