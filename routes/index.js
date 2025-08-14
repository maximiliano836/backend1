const { Router } = require('express');
const products = require('../managers/ProductManagerMongo');
const Cart = require('../models/Cart');
const router = Router();

router.get('/', (req, res) => {
  res.render('home', { layout: 'main' });
});

router.get('/realtimeproducts', (req, res) => {
  res.render('realTimeProducts', { layout: 'main' });
});

router.get('/products', async (req, res) => {
  try {
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
      sort: sort || ''
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