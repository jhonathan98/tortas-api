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

const getUserXuserpass = (user,pass) => {
    return Usuarios.findOne({where: {usuario:user, password:pass} });
}

module.exports = {
    CreateUser,
    getAllUser,
    getUserById,
    getUserByUser,
    getUserXuserpass
}