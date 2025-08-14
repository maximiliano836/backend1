const { Router } = require('express');
const mongoose = require('mongoose');
const Cart = require('../../models/Cart');
const Product = require('../../models/Product');
const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const cart = await Cart.create({ products: [] });
    res.status(201).json(cart);
  } catch (err) {
    next(err);
  }
});

router.get('/:cid', async (req, res, next) => {
  try {
    const { cid } = req.params;
    if (!mongoose.isValidObjectId(cid)) return res.status(400).json({ status: 'error', error: 'ID inv\u00e1lido' });

    const cart = await Cart.findById(cid).populate('products.product');
    if (!cart) return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });

    const validProducts = cart.products.filter(item => item.product !== null);
    if (validProducts.length !== cart.products.length) {
      cart.products = validProducts;
      await cart.save();
    }
    res.json(cart);
  } catch (error) {
    next(error);
  }
});

router.post('/:cid/product/:pid', async (req, res, next) => {
  try {
    const { cid, pid } = req.params;
    const qty = req.body?.quantity != null ? Number(req.body.quantity) : 1;

    if (!mongoose.isValidObjectId(cid) || !mongoose.isValidObjectId(pid)) {
      return res.status(400).json({ status: 'error', error: 'ID inv\u00e1lido' });
    }
    if (!Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({ status: 'error', error: 'Cantidad inv\u00e1lida' });
    }

    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });

    const stockUpdate = await Product.updateOne(
      { _id: pid, stock: { $gte: qty } },
      { $inc: { stock: -qty } }
    );
    if (!stockUpdate.modifiedCount) {
      const prod = await Product.findById(pid).lean();
      const available = prod ? prod.stock : 0;
      return res.status(400).json({ status: 'error', error: `Stock insuficiente. Disponible: ${available}` });
    }

    const idx = cart.products.findIndex(p => p.product.toString() === pid);
    if (idx >= 0) {
      cart.products[idx].quantity += qty;
    } else {
      cart.products.push({ product: pid, quantity: qty });
    }

    try {
      await cart.save();
    } catch (err) {
      await Product.updateOne({ _id: pid }, { $inc: { stock: qty } });
      throw err;
    }

    const populatedCart = await Cart.findById(cid).populate('products.product');
    res.json(populatedCart);
  } catch (error) {
    next(error);
  }
});

router.delete('/:cid/products/:pid', async (req, res, next) => {
  try {
    const { cid, pid } = req.params;
    if (!mongoose.isValidObjectId(cid) || !mongoose.isValidObjectId(pid)) return res.status(400).json({ status: 'error', error: 'ID inv\u00e1lido' });

    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });
    const idx = cart.products.findIndex(p => p.product.toString() === pid);
    if (idx < 0) return res.status(404).json({ status: 'error', error: 'Producto no est\u00e1 en el carrito' });

    const qty = Number(cart.products[idx].quantity) || 0;
    cart.products.splice(idx, 1);
    await cart.save();
    if (qty > 0) {
      await Product.updateOne({ _id: pid }, { $inc: { stock: qty } });
    }
    res.json({ status: 'success', cart });
  } catch (error) {
    next(error);
  }
});

router.put('/:cid', async (req, res, next) => {
  try {
    const { cid } = req.params;
    if (!mongoose.isValidObjectId(cid)) return res.status(400).json({ status: 'error', error: 'ID inv\u00e1lido' });
    const items = Array.isArray(req.body) ? req.body : req.body?.products;
    if (!Array.isArray(items)) return res.status(400).json({ status: 'error', error: 'Se necesita un arreglo de productos' });

    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });

    cart.products = items
      .filter(i => i && i.product && mongoose.isValidObjectId(i.product))
      .map(i => ({ product: i.product, quantity: Number(i.quantity) || 1 }));
    await cart.save();
    res.json({ status: 'success', cart });
  } catch (error) {
    next(error);
  }
});

router.put('/:cid/products/:pid', async (req, res, next) => {
  try {
    const { cid, pid } = req.params;
    const qty = Number(req.body?.quantity);
    if (!mongoose.isValidObjectId(cid) || !mongoose.isValidObjectId(pid)) return res.status(400).json({ status: 'error', error: 'ID inv\u00e1lido' });
    if (isNaN(qty) || qty < 0) return res.status(400).json({ status: 'error', error: 'Cantidad inv\u00e1lida' });

    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });
    const idx = cart.products.findIndex(p => p.product.toString() === pid);
    if (idx < 0) return res.status(404).json({ status: 'error', error: 'Producto no est\u00e1 en el carrito' });

    const currentQty = Number(cart.products[idx].quantity) || 0;
    const delta = qty - currentQty;

    if (qty === 0) {
      cart.products.splice(idx, 1);
      await cart.save();
      if (currentQty > 0) await Product.updateOne({ _id: pid }, { $inc: { stock: currentQty } });
      return res.json({ status: 'success', cart });
    }

    if (delta > 0) {
      const stockUpdate = await Product.updateOne(
        { _id: pid, stock: { $gte: delta } },
        { $inc: { stock: -delta } }
      );
      if (!stockUpdate.modifiedCount) {
        const prod = await Product.findById(pid).lean();
        const available = prod ? prod.stock : 0;
        return res.status(400).json({ status: 'error', error: `Stock insuficiente. Disponible: ${available}` });
      }
      cart.products[idx].quantity = qty;
      try {
        await cart.save();
      } catch (err) {
        await Product.updateOne({ _id: pid }, { $inc: { stock: delta } });
        throw err;
      }
      return res.json({ status: 'success', cart });
    } else if (delta < 0) {
      cart.products[idx].quantity = qty;
      await cart.save();
      await Product.updateOne({ _id: pid }, { $inc: { stock: -delta } });
      return res.json({ status: 'success', cart });
    } else {
      return res.json({ status: 'success', cart });
    }
  } catch (error) {
    next(error);
  }
});

router.delete('/:cid', async (req, res, next) => {
  try {
    const { cid } = req.params;
    if (!mongoose.isValidObjectId(cid)) return res.status(400).json({ status: 'error', error: 'ID inv\u00e1lido' });

    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });
    const items = [...cart.products];
    cart.products = [];
    await cart.save();
    if (items.length) {
      const ops = items.map(i => ({ updateOne: { filter: { _id: i.product }, update: { $inc: { stock: Number(i.quantity) || 0 } } } }));
      try { await Product.bulkWrite(ops); } catch (e) { }
    }
    res.json({ status: 'success', cart });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
