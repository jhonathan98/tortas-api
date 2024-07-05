const RegistroVentas = require("../models/RegistroVentas");
const { getPaginatedAndOrderedDynamic } = require("../utils/paginate");

const getAll = () => {
    const ResultadoRegistroVentas = getPaginatedAndOrderedDynamic(
        RegistroVentas,
        {numPage:1,sizePage:2},
        {filtersTable:[],filtersColumn:[]}
    )    
    //return RegistroVentas.findAll();
    return ResultadoRegistroVentas
}

const createRegister = (registro) => {
    RegistroVentas.create(registro);
}

module.exports = {
    getAll,
    createRegister
}