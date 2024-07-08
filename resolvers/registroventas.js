const RegistroVentas = require("../models/RegistroVentas");
const { getPaginatedAndOrderedDynamic } = require("../utils/paginate");

const getAll = (numeroPagina=1,cantidadItems=2) => {
    const ResultadoRegistroVentas = getPaginatedAndOrderedDynamic(
        RegistroVentas,
        {numPage:numeroPagina,sizePage:cantidadItems},
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