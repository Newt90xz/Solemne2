var { conectarMongoDB } = require('../db');
var { UsersModel, LeaderboardModel } = require('../models/User.js');

const doc = [
  {
    username: 'John Doe',
    password: '1234', // cifrar con bcrypt
    role: 'admin'
  },
  {
    username: 'Janice Doe',
    password: 'contraseña'
  }
];

const doc2 = [
  {
    username: 'John Doe',
    score: 120000,
    loops: 1
  },
  {
    username: 'John Doe',
    score: 110500,
    loops: 0
  },
  {
    username: 'John Doe',
    score: 50000,
    loops: 0
  },
  {
    username: 'Janice Doe',
    score: 260000,
    loops: 2
  },
  {
    username: 'Janice Doe',
    score: 120500,
    loops: 0
  }
];

const seed = async () => {
  try {
    await conectarMongoDB();
    await UsersModel.deleteMany({});
    await LeaderboardModel.deleteMany({});
    await UsersModel.insertMany(doc);
    await LeaderboardModel.insertMany(doc2);
    console.log('Seed insertado correctamente');
  } catch (error) {
    console.error('Error en seed:', error);
  } finally {
    process.exit(0);
  }
};

seed();