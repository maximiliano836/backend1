const fs = require('fs').promises;
const path = require('path');

function CartManager(filename) {
  this.file = path.join(__dirname, '..', filename || 'carts.json');
}

CartManager.prototype._readFile = function() {
  return fs.readFile(this.file, 'utf-8').then(function(data) {
    return JSON.parse(data);
  }).catch(function() {
    return [];
  });
};

CartManager.prototype._writeFile = function(data) {
  return fs.writeFile(this.file, JSON.stringify(data, null, 2));
};

CartManager.prototype.createCart = function() {
  var self = this;
  return self._readFile().then(function(carts) {
    var newId = carts.length > 0 ? (parseInt(carts[carts.length-1].id) + 1) : 1;
    var cart = { id: newId, products: [] };
    carts.push(cart);
    return self._writeFile(carts).then(function() {
      return cart;
    });
  });
};

CartManager.prototype.getCartById = function(id) {
  return this._readFile().then(function(carts) {
    return carts.find(function(c) { return String(c.id) === String(id); });
  });
};

CartManager.prototype.addProductToCart = function(cid, pid, description) {
  var self = this;
  return self._readFile().then(function(carts) {
    var idx = carts.findIndex(function(c) { return String(c.id) === String(cid); });
    if (idx === -1) return null;
    var cart = carts[idx];
    var prodIdx = cart.products.findIndex(function(p) { return String(p.product) === String(pid); });
    if (prodIdx === -1) {
      cart.products.push({ product: pid, description: description || '', quantity: 1 });
    } else {
      cart.products[prodIdx].quantity++;
    }
    carts[idx] = cart;
    return self._writeFile(carts).then(function() {
      return cart;
    });
  });
};

module.exports = CartManager;
