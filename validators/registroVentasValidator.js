const joi = require("joi");

const crearRegistroVentasValidator = (req,res,next) => {
    const schema = joi.object({
        Nombreproducto: joi.string().required(),
        cantidadProducto:joi.number().min(0).required(),
        precioProducto:joi.number().min(0).required(),
        metodoPago:joi.string().required(),
    })

    const { error, value } = schema.validate(req.body);

    if(error){
        res.status(400).json({error: error.details})
    }else{
        next();
    }
}

const ObtenerRegistroVentasValidator = (req,res,next) => {
    const schema = joi.object({
        numeroPagina: joi.number().min(0).required(),
        cantidadItems:joi.number().min(0).required(),
        
    })

    const { error, value } = schema.validate(req.body);

    if(error){
        res.status(400).json({error: error.details})
    }else{
        next();
    }
}

module.exports = {
    crearRegistroVentasValidator,
    ObtenerRegistroVentasValidator
}