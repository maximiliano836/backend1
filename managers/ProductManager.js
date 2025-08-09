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
    if (!id || (isNaN(id) && typeof id !== 'string')) {
      throw new Error('ID de producto inválido');
    }
    const products = await this.#readFile();
    return products.find(p => String(p.id) === String(id));
  }

  async addProduct(product) {
    if (!product || typeof product !== 'object') {
      throw new Error('El producto debe ser un objeto válido');
    }

    const { title, description, price, stock, category } = product;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      throw new Error('El título es obligatorio y debe ser una cadena no vacía');
    }
    if (!description || typeof description !== 'string') {
      throw new Error('La descripción es obligatoria y debe ser una cadena');
    }
    if (price == null || isNaN(price) || price < 0) {
      throw new Error('El precio es obligatorio y debe ser un número mayor o igual a 0');
    }
    if (stock == null || isNaN(stock) || stock < 0 || !Number.isInteger(Number(stock))) {
      throw new Error('El stock es obligatorio y debe ser un número entero mayor o igual a 0');
    }
    if (!category || typeof category !== 'string' || category.trim() === '') {
      throw new Error('La categoría es obligatoria y debe ser una cadena no vacía');
    }

    const products = await this.#readFile();

    const newId = products.length > 0 ? (parseInt(products[products.length-1].id) + 1) : 1;
    const prod = { 
      ...product, 
      id: newId, 
      status: true,
      price: Number(price),
      stock: Number(stock),
      title: title.trim(),
      description: description.trim(),
      category: category.trim()
    };
    products.push(prod);
    await this.#writeFile(products);
    return prod;
  }

  async updateProduct(id, updates) {
    if (!id || (isNaN(id) && typeof id !== 'string')) {
      throw new Error('ID de producto inválido');
    }
    if (!updates || typeof updates !== 'object') {
      throw new Error('Los datos de actualización deben ser un objeto válido');
    }

    const products = await this.#readFile();
    const idx = products.findIndex(p => String(p.id) === String(id));
    if (idx === -1) return null;

    const { title, description, price, stock, category } = updates;
    
    if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
      throw new Error('El título debe ser una cadena no vacía');
    }
    if (description !== undefined && typeof description !== 'string') {
      throw new Error('La descripción debe ser una cadena');
    }
    if (price !== undefined && (isNaN(price) || price < 0)) {
      throw new Error('El precio debe ser un número mayor o igual a 0');
    }
    if (stock !== undefined && (isNaN(stock) || stock < 0 || !Number.isInteger(Number(stock)))) {
      throw new Error('El stock debe ser un número entero mayor o igual a 0');
    }
    if (category !== undefined && (typeof category !== 'string' || category.trim() === '')) {
      throw new Error('La categoría debe ser una cadena no vacía');
    }

    const { id: _, ...rest } = updates;
    const cleanedUpdates = { ...rest };
    
    if (title) cleanedUpdates.title = title.trim();
    if (description) cleanedUpdates.description = description.trim();
    if (category) cleanedUpdates.category = category.trim();
    if (price !== undefined) cleanedUpdates.price = Number(price);
    if (stock !== undefined) cleanedUpdates.stock = Number(stock);

    products[idx] = { ...products[idx], ...cleanedUpdates };
    await this.#writeFile(products);
    return products[idx];
  }

  async deleteProduct(id) {
    if (!id || (isNaN(id) && typeof id !== 'string')) {
      throw new Error('ID de producto inválido');
    }
    let products = await this.#readFile();
    const prod = products.find(p => String(p.id) === String(id));
    products = products.filter(p => String(p.id) !== String(id));
    await this.#writeFile(products);
    return prod;
  }
}

module.exports = ProductManager;
