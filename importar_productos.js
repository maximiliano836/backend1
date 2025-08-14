require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';

async function run() {
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('Conectado a MongoDB para importar productos');

    const samples = [
      {
        title: 'Camiseta básica',
        description: 'Camiseta de algodón, cómoda y ligera',
        code: 'CAM-BAS-001',
        price: 19.99,
        stock: 50,
        category: 'Ropa',
        status: true,
        thumbnails: []
      },
      {
        title: 'Auriculares Bluetooth',
        description: 'Auriculares inalámbricos con cancelación de ruido',
        code: 'AUR-BT-100',
        price: 59.9,
        stock: 30,
        category: 'Electrónica',
        status: true,
        thumbnails: []
      },
      {
        title: 'Taza cerámica',
        description: 'Taza para café con diseño moderno',
        code: 'TAZ-CR-20',
        price: 9.5,
        stock: 100,
        category: 'Hogar',
        status: true,
        thumbnails: []
      }
    ];

    for (const item of samples) {
      const exists = await Product.findOne({ code: item.code }).lean();
      if (exists) {
        console.log(`Omitido (ya existe): ${item.code} - ${item.title}`);
        continue;
      }
      await Product.create(item);
      console.log(`Importado: ${item.code} - ${item.title}`);
    }

    console.log('Importación finalizada.');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error al importar productos:', err.message || err);
    process.exitCode = 1;
  }
}

run();
