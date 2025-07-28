const express = require('express');
const ProductManager = require('../../managers/ProductManager');
const router = express.Router();
const pm = new ProductManager();

router.get('/', async (req, res) => {
  const products = await pm.getProducts();
  res.json(products);
});

router.get('/:pid', async (req, res) => {
  const prod = await pm.getProductById(req.params.pid);
  if (!prod) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(prod);
});

router.post('/', async (req, res) => {
  const { title, description, code, price, status, stock, category, thumbnails } = req.body;
  if (!title || !description || !code || price == null || stock == null || !category) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  const prod = await pm.addProduct({ title, description, code, price, status, stock, category, thumbnails: thumbnails || [] });
  res.status(201).json(prod);
});

router.put('/:pid', async (req, res) => {
  const prod = await pm.updateProduct(req.params.pid, req.body);
  if (!prod) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(prod);
});

router.delete('/:pid', async (req, res) => {
  const prod = await pm.deleteProduct(req.params.pid);
  if (!prod) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json({ status: 'ok', deleted: prod });
});

module.exports = router;
