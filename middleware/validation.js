const mongoose = require('mongoose');

const validateProductData = (req, res, next) => {
  const { title, description, price, stock, category } = req.body;
  const errors = [];

  if (!title || typeof title !== 'string' || title.trim() === '') {
    errors.push('El título es obligatorio y debe ser una cadena no vacía');
  }

  if (!description || typeof description !== 'string') {
    errors.push('La descripción es obligatoria y debe ser una cadena');
  }

  if (price == null || isNaN(price) || price < 0) {
    errors.push('El precio es obligatorio y debe ser un número mayor o igual a 0');
  }

  if (stock == null || isNaN(stock) || stock < 0 || !Number.isInteger(Number(stock))) {
    errors.push('El stock es obligatorio y debe ser un número entero mayor o igual a 0');
  }

  if (!category || typeof category !== 'string' || category.trim() === '') {
    errors.push('La categoría es obligatoria y debe ser una cadena no vacía');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Errores de validación',
      details: errors
    });
  }

  next();
};

const validateId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: `El parámetro ${paramName} no es un ID válido`
      });
    }
    next();
  };
};

const validateQuery = (req, res, next) => {
  const { limit } = req.query;
  
  if (limit !== undefined) {
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum <= 0) {
      return res.status(400).json({
        error: 'El parámetro limit debe ser un número positivo'
      });
    }
  }
  
  next();
};

const handleAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  validateProductData,
  validateId,
  validateQuery,
  handleAsync
};
