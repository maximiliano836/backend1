const { Router } = require('express');
const pm = require('../../managers/ProductManagerMongo');
const router = Router();

router.get('/', async (req, res, next) => {
  try {
    // validate pagination params (small but important)
    let limit = parseInt(req.query.limit, 10);
    if (!Number.isFinite(limit) || limit <= 0) limit = 10;
    let page = parseInt(req.query.page, 10);
    if (!Number.isFinite(page) || page <= 0) page = 1;
    const sort = req.query.sort === 'asc' || req.query.sort === 'desc' ? req.query.sort : undefined;
    const query = req.query.query || undefined;

    const base = req.baseUrl;
    const { docs, total } = await pm.getProductsPaginated({ limit, page, sort, query });

    const totalPages = Math.max(1, Math.ceil(total / limit));
    const currentPage = Math.min(Math.max(1, page), totalPages);
    const hasPrevPage = currentPage > 1;
    const hasNextPage = currentPage < totalPages;
    const prevPage = hasPrevPage ? currentPage - 1 : null;
    const nextPage = hasNextPage ? currentPage + 1 : null;

    const makeLink = (p) => {
      if (!p) return null;
      const params = new URLSearchParams();
      params.set('limit', String(limit));
      if (sort) params.set('sort', sort);
      if (query) params.set('query', query);
      params.set('page', String(p));
      return `${base}?${params.toString()}`;
    };

    res.json({
      status: 'success',
      payload: docs,
      totalPages,
      prevPage,
      nextPage,
      page: currentPage,
      hasPrevPage,
      hasNextPage,
      prevLink: makeLink(prevPage),
      nextLink: makeLink(nextPage)
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:pid', async (req, res, next) => {
  try {
    const prod = await pm.getProductById(req.params.pid);
    if (!prod) return res.status(404).json({ status: 'error', error: 'Producto no encontrado' });
    res.json(prod);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { title, description, code, price, status, stock, category, thumbnails } = req.body;
    if (!title || !code || price == null || isNaN(price)) {
      return res.status(400).json({ status: 'error', error: 'Faltan campos requeridos' });
    }
    const productData = {
      title: String(title).trim(),
      description: description ? String(description).trim() : '',
      code: String(code).trim(),
      price: Number(price),
      status: status !== undefined ? !!status : true,
      stock: stock != null ? Number(stock) : 0,
      category: category ? String(category).trim() : 'General',
      thumbnails: Array.isArray(thumbnails) ? thumbnails : []
    };
    const prod = await pm.addProduct(productData);
    res.status(201).json(prod);
  } catch (err) {
    next(err);
  }
});

router.put('/:pid', async (req, res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ status: 'error', error: 'No se enviaron campos' });
    }
    const prod = await pm.updateProduct(req.params.pid, req.body);
    if (!prod) return res.status(404).json({ status: 'error', error: 'Producto no encontrado' });
    res.json(prod);
  } catch (err) {
    next(err);
  }
});

router.delete('/:pid', async (req, res, next) => {
  try {
    const prod = await pm.deleteProduct(req.params.pid);
    if (!prod) return res.status(404).json({ status: 'error', error: 'Producto no encontrado' });
    res.json({ status: 'success', deleted: prod });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
