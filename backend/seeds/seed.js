var { conectarMongoDB } = require('../db');
var UsersModel = require('../models/User.js');

const doc = [
  {
    username: "John Doe",
    password: "1234", //cifrar a hash
    role: "admin",
    maxscore: 9999,
    loops: 0
  },
  {
    username: "Janice Doe",
    password: "contraseña",
    maxscore: 11111,
    loops: 1
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