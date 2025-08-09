const express = require('express');
const ProductManager = require('../managers/ProductManagerMongo');
const CartManager = require('../managers/CartManagerMongo');
const router = express.Router();
const pm = new ProductManager();
const cm = new CartManager();

router.get('/', (req, res) => {
  res.render('home', { title: 'Inicio' });
});

router.get('/realtimeproducts', (req, res) => {
  res.render('realTimeProducts', { title: 'Productos en Tiempo Real' });
});

router.get('/products', async (req, res) => {
  try {
    const { limit, page, sort, query } = req.query;
    
    const options = {
      limit: limit ? parseInt(limit) : 10,
      page: page ? parseInt(page) : 1,
      sort: sort === 'asc' || sort === 'desc' ? sort : undefined,
      query: query || undefined
    };

    const result = await pm.getProducts(options);
    
    res.render('products', { 
      title: 'Productos',
      products: result.payload,
      totalPages: result.totalPages,
      currentPage: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      prevLink: result.prevLink,
      nextLink: result.nextLink
    });
  } catch (error) {
    res.status(500).render('404', { title: 'Error', error: 'Error al cargar productos' });
  }
});

router.get('/products/:pid', async (req, res) => {
  try {
    const product = await pm.getProductById(req.params.pid);
    if (!product) {
      return res.status(404).render('404', { title: 'Producto no encontrado' });
    }
    res.render('productDetail', { title: product.title, product });
  } catch (error) {
    res.status(500).render('404', { title: 'Error', error: 'Error al cargar producto' });
  }
});

router.get('/carts/:cid', async (req, res) => {
  try {
    const cart = await cm.getCartById(req.params.cid);
    if (!cart) {
      return res.status(404).render('404', { title: 'Carrito no encontrado' });
    }
    res.render('cart', { 
      title: 'Carrito',
      cart: cart,
      products: cart.products,
      cartId: req.params.cid
    });
  } catch (error) {
    res.status(500).render('404', { title: 'Error', error: 'Error al cargar carrito' });
  }
});

module.exports = router;