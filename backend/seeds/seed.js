var { UsersModel } = require('../app.js');

const doc = [
    {
        username: "John Doe",
        password: "1234",
        role: "admin"
    },
    {
        username: "Janice Doe",
        password: "contraseña"
    }]

UsersModel.insertMany(doc)