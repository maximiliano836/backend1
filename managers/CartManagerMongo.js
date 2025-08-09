const Cart = require('../models/Cart');

class CartManager {
  async createCart() {
    const cart = new Cart({ products: [] });
    await cart.save();
    return cart;
  }

  async getCartById(id) {
    const cart = await Cart.findById(id).populate('products.product');
    return cart;
  }

  async addProductToCart(cartId, productId, quantity = 1) {
    const cart = await Cart.findById(cartId);
    if (!cart) return null;

    const existingProductIndex = cart.products.findIndex(p => p.product.toString() === productId);
    
    if (existingProductIndex !== -1) {
      cart.products[existingProductIndex].quantity += quantity;
    } else {
      cart.products.push({ product: productId, quantity });
    }

    await cart.save();
    return await this.getCartById(cartId);
  }

  async removeProductFromCart(cartId, productId) {
    const cart = await Cart.findById(cartId);
    if (!cart) return null;

    cart.products = cart.products.filter(p => p.product.toString() !== productId);
    await cart.save();
    return await this.getCartById(cartId);
  }

  async updateCart(cartId, products) {
    const cart = await Cart.findByIdAndUpdate(
      cartId, 
      { products }, 
      { new: true }
    ).populate('products.product');
    return cart;
  }

  async updateProductQuantity(cartId, productId, quantity) {
    const cart = await Cart.findById(cartId);
    if (!cart) return null;

    const productIndex = cart.products.findIndex(p => p.product.toString() === productId);
    if (productIndex === -1) return null;

    cart.products[productIndex].quantity = quantity;
    await cart.save();
    return await this.getCartById(cartId);
  }

  async clearCart(cartId) {
    const cart = await Cart.findByIdAndUpdate(
      cartId, 
      { products: [] }, 
      { new: true }
    );
    return cart;
  }
}

module.exports = CartManager;
