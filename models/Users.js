const {DataTypes} = require("sequelize");
const {connection} = require("../database");

const Usuarios = connection.define("Usuarios",{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull:false
    },
    usuario:{
        type: DataTypes.STRING,
        allowNull:false
    },
    password:{
        type: DataTypes.STRING,
        allowNull:false
    },
    correo:{
        type: DataTypes.STRING,
        allowNull:true
    },
    claveIngreso:{
        type: DataTypes.STRING,
        allowNull:false
    }
})

module.exports = Usuarios;