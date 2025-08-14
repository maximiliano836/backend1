const mongoose = require('mongoose');
const Product = require('../models/Product');

function buildFilter(query) {
  if (!query) return {};
  const q = String(query).toLowerCase().trim();
  if (q === 'true' || q === 'available' || q === 'disponible') return { status: true };
  if (q === 'false' || q === 'unavailable' || q === 'nodisponible') return { status: false };
  return { category: { $regex: query, $options: 'i' } };
}

function buildSort(sort) {
  if (sort === 'asc') return { price: 1 };
  if (sort === 'desc') return { price: -1 };
  return undefined;
}

class ProductManagerMongo {
  async getProducts({ limit = 10, page = 1, sort, query } = {}) {
    const skip = (page - 1) * limit;
    const filter = buildFilter(query);
    const sortOpt = buildSort(sort);
    const q = Product.find(filter).skip(skip).limit(limit);
    if (sortOpt) q.sort(sortOpt);
    return q.lean();
  }

  async getProductsPaginated({ limit = 10, page = 1, sort, query } = {}) {
    const skip = (page - 1) * limit;
    const filter = buildFilter(query);
    const sortOpt = buildSort(sort);
    const queryCursor = Product.find(filter).skip(skip).limit(limit);
    if (sortOpt) queryCursor.sort(sortOpt);
    const [docs, total] = await Promise.all([
      queryCursor.lean(),
      Product.countDocuments(filter)
    ]);
    return { docs, total, page, limit };
  }

  async getProductById(id) {
    if (!mongoose.isValidObjectId(id)) return null;
    return Product.findById(id).lean();
  }

  async addProduct(data) {
    return Product.create(data);
  }

  async updateProduct(id, updates) {
    if (!mongoose.isValidObjectId(id)) return null;
    if (updates._id) delete updates._id;
    if (updates.id) delete updates.id;
    return Product.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  }

  async deleteProduct(id) {
    if (!mongoose.isValidObjectId(id)) return null;
    return Product.findByIdAndDelete(id);
  }
}

module.exports = new ProductManagerMongo();
