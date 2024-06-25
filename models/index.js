const database = require("../database");

const modules = {
    connection: database.connection,
    RegistroVentas: require("./RegistroVentas"),
    Usuarios: require("./Users")
}

module.exports = modules;