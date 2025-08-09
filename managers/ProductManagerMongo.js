const Product = require('../models/Product');

class ProductManager {
  async getProducts(options = {}) {
    const { limit = 10, page = 1, sort, query } = options;
    
    let filter = {};
    if (query) {
      if (query === 'available') {
        filter = { stock: { $gt: 0 } };
      } else {
        filter = { category: { $regex: query, $options: 'i' } };
      }
    }

    let sortOptions = {};
    if (sort) {
      sortOptions.price = sort === 'asc' ? 1 : -1;
    }

    const skip = (page - 1) * limit;
    
    const products = await Product.find(filter)
      .sort(sortOptions)
      .limit(limit)
      .skip(skip)
      .lean();

    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    return {
      status: 'success',
      payload: products,
      totalPages,
      prevPage: hasPrevPage ? page - 1 : null,
      nextPage: hasNextPage ? page + 1 : null,
      page,
      hasPrevPage,
      hasNextPage,
      prevLink: hasPrevPage ? `/api/products?page=${page - 1}&limit=${limit}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}` : null,
      nextLink: hasNextPage ? `/api/products?page=${page + 1}&limit=${limit}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}` : null
    };
  }

  async getProductById(id) {
    const product = await Product.findById(id);
    return product;
  }

  async addProduct(productData) {
    const product = new Product(productData);
    await product.save();
    return product;
  }

  async updateProduct(id, updates) {
    const product = await Product.findByIdAndUpdate(id, updates, { new: true });
    return product;
  }

  async deleteProduct(id) {
    const product = await Product.findByIdAndDelete(id);
    return product;
  }
}

module.exports = ProductManager;
