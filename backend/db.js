const mongoose = require('mongoose');

const server = '127.0.0.1:3095';
const database = 'digitalvoiddb';

const conectarMongoDB = async () => {
  try {
    await mongoose.connect(`mongodb://${server}/${database}`);
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
