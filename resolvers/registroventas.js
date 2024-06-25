const RegistroVentas = require("../models/RegistroVentas")

const getAll = () => {    
    return RegistroVentas.findAll();
    //return RegistroVentas.RegistroVentas.findAll()    
}

const createRegister = (registro) => {
    RegistroVentas.create(registro);
}

module.exports = {
    getAll,
    createRegister
}