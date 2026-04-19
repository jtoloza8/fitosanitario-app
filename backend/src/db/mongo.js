const mongoose = require('mongoose');
require('dotenv').config();

const conectarMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB Atlas');
  } catch (err) {
    console.error('❌ Error conectando a MongoDB:', err.message);
  }
};

module.exports = conectarMongo;