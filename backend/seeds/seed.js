var { conectarMongoDB } = require('../db');
var { UsersModel } = require('../models/User.js');

const doc = [
  {
    username: "John Doe",
    password: "1234", //cifrar con bcrypt
    role: "admin"
  },
  {
    username: "Janice Doe",
    password: "contraseña"
  }
];

const seed = async () => {
  try {
    await conectarMongoDB();
    await UsersModel.insertMany(doc);
    console.log('Seed insertado correctamente');
  } catch (error) {
    console.error('Error en seed:', error);
  } finally {
    process.exit(0);
  }
};

seed();