const mongoose = require('mongoose');

// Toma el url de Env en docker o el local.
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:3095/digitalvoiddb';

const conectarMongoDB = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('Conexión a MongoDB exitosa');
  } catch (error) {
    console.log('Error al conectar a MongoDB:', error);
    process.exit(1);
  }
};

module.exports = {
  mongoose,
  conectarMongoDB,
};