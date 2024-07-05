const { Usuarios } = require("../models")


const CreateUser = (user) => {    
    Usuarios.create(user);
}

const getAllUser = () => {
    return Usuarios.findAll();
}

const getUserById = (id) => {
    return Usuarios.findByPk(id);
}

const getUserByUser = (user) => {    
    return Usuarios.findOne({where: {usuario:user} });
}

const getUserXuser = (user) => {
    return Usuarios.findOne({where: {usuario:user} });
}

module.exports = {
    CreateUser,
    getAllUser,
    getUserById,
    getUserByUser,
    getUserXuser
}