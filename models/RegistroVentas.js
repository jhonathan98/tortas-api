const { DataTypes } = require("sequelize");
const { connection } = require("../database");


const RegistroVentas = connection.define('RegistroVentas', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement:true,
        allowNull: false
    },
    nombreProducto: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cantidadProducto:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    metodoPago: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = RegistroVentas;