var { conectarMongoDB } = require('../db');
var { UsersModel, LeaderboardModel, LobbyModel } = require('../models/User.js');

const doc = [
  {
    username: 'JohnDoe',
    password: '$2a$10$EObQhVPIBm1iZgBLTIF8l.ZbDvk3TG1wZhnnsROaLYReWImSSoqaC',
    role: 'admin'
  },
  {
    username: 'JaniceDoe',
    password: '$2a$10$gUE/SqiTDCCk7Dkx6.uvg.39p0xMQgyYw2BT7rLoZjSGdcAWimne.'
  },
  {
    username: 'Cj',
    password: '$2a$10$ZnQSkhIDsI4M6xKluou6Y.KqQHqXhJ2m6TCL9oCvp2zOzehJPEG5.'
  },
  {
    username: 'Winston',
    password: '$2a$10$sAPpfqtA0iiEnlhF.OaYeOPSMna/HLw45cVdbJ/WrOByd.sJ4aNw6'
  }
];

const doc2 = [
  { username: 'JohnDoe', score: 120000, loops: 1 },
  { username: 'JohnDoe', score: 110500, loops: 0 },
  { username: 'JohnDoe', score: 50000, loops: 0 },
  { username: 'JohnDoe', score: 245000, loops: 2 },

  { username: 'JaniceDoe', score: 310000, loops: 3 },
  { username: 'JaniceDoe', score: 95000, loops: 0 },
  { username: 'JaniceDoe', score: 175000, loops: 1 },

  { username: 'Cj', score: 45000, loops: 0 },
  { username: 'Cj', score: 89000, loops: 0 },

  { username: 'Winston', score: 190000, loops: 1 },
  { username: 'Winston', score: 105000, loops: 0 }
];


const seed = async () => {
  try {
    await conectarMongoDB();
    await UsersModel.deleteMany({});
    await LeaderboardModel.deleteMany({});
    await LobbyModel.deleteMany({});
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