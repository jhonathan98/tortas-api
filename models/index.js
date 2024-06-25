const database = require("../database");

const modules = {
    connection: database.connection,
    RegistroVentas: require("./RegistroVentas")
}

module.exports = modules;