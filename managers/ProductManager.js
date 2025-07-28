const fs = require('fs').promises;
const path = require('path');

class ProductManager {
  constructor(filename = 'products.json') {
    this.file = path.join(__dirname, '..', filename);
  }

  async #readFile() {
    try {
      const data = await fs.readFile(this.file, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  async #writeFile(data) {
    await fs.writeFile(this.file, JSON.stringify(data, null, 2));
  }

  async getProducts() {
    return await this.#readFile();
  }

  async getProductById(id) {
    const products = await this.#readFile();
    return products.find(p => String(p.id) === String(id));
  }

  async addProduct(product) {
    const products = await this.#readFile();
    const newId = products.length > 0 ? (parseInt(products[products.length-1].id) + 1) : 1;
    const prod = { ...product, id: newId, status: true };
    products.push(prod);
    await this.#writeFile(products);
    return prod;
  }

  async updateProduct(id, updates) {
    const products = await this.#readFile();
    const idx = products.findIndex(p => String(p.id) === String(id));
    if (idx === -1) return null;
    const { id: _, ...rest } = updates;
    products[idx] = { ...products[idx], ...rest };
    await this.#writeFile(products);
    return products[idx];
  }

  async deleteProduct(id) {
    let products = await this.#readFile();
    const prod = products.find(p => String(p.id) === String(id));
    products = products.filter(p => String(p.id) !== String(id));
    await this.#writeFile(products);
    return prod;
  }
}

module.exports = ProductManager;
