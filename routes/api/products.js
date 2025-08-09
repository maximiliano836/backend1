const express = require('express');
const ProductManager = require('../../managers/ProductManager');
const { validateProductData, validateId, validateQuery, handleAsync } = require('../../middleware/validation');
const router = express.Router();
const pm = new ProductManager();

router.get('/', validateQuery, handleAsync(async (req, res) => {
  const { limit } = req.query;
  const products = await pm.getProducts();
  
  if (limit) {
    const limitNum = parseInt(limit);
    return res.json(products.slice(0, limitNum));
  }
  
  res.json(products);
}));

router.get('/:pid', validateId('pid'), handleAsync(async (req, res) => {
  const prod = await pm.getProductById(req.params.pid);
  if (!prod) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(prod);
}));

router.post('/', validateProductData, handleAsync(async (req, res) => {
  const { title, description, price, status, stock, category, thumbnails } = req.body;

  const productData = {
    title,
    description,
    price,
    status: status !== undefined ? status : true,
    stock,
    category,
    thumbnails: Array.isArray(thumbnails) ? thumbnails : []
  };

  const prod = await pm.addProduct(productData);
  res.status(201).json(prod);
}));

router.put('/:pid', validateId('pid'), handleAsync(async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: 'No se proporcionaron datos para actualizar' });
  }

  const prod = await pm.updateProduct(req.params.pid, req.body);
  if (!prod) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(prod);
}));

router.delete('/:pid', validateId('pid'), handleAsync(async (req, res) => {
  const prod = await pm.deleteProduct(req.params.pid);
  if (!prod) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json({ status: 'ok', deleted: prod });
}));

module.exports = router;
