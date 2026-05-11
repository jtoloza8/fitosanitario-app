const mongoose = require('mongoose');
require('dotenv').config();

const conectarMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      directConnection: false,
    });
    console.log('✅ Conectado a MongoDB Atlas');
  } catch (err) {
    console.error('❌ Error conectando a MongoDB:', err.message);
    console.log('⚠️ Sistema corriendo sin MongoDB - evidencias deshabilitadas');
  }
};

module.exports = conectarMongo;