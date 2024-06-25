const { Usuarios } = require("../models")


const CreateUser = (user) => {
    console.log(user)
    Usuarios.create(user);
}

const getAllUser = () => {
    return Usuarios.findAll();
}

const getUserById = (id) => {
    return Usuarios.findByPk(id);
}

const getUserByUser = (user) => {   
    console.log("datosUsusario:",user) 
    return Usuarios.findOne({where: {usuario:user} });
}

module.exports = {
    CreateUser,
    getAllUser,
    getUserById,
    getUserByUser
}