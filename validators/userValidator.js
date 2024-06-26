const joi = require("joi");

const createUserValidator = (res, req, next) => {
    const schema = joi.object().keys({
        usuario: joi.string().min(5).required(),
        password:joi.string().min(8).pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).required(),
        correo:joi.string().pattern(new RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")).required()
    })

    const { error, value } = schema.validate(req.body);

    if(error){
        res.status(400).json({error: error.details})
    }else{
        next();
    }
}


const loginValidator = (req,res,next) => {
    const schema = joi.object({
        usuario: joi.string().min(5).required(),
        password:joi.string().min(8).required()
    })

    const { error, value } = schema.validate(req.body);

    if(error){
        res.status(400).json({error: error.details})
    }else{
        next();
    }
}

module.exports = {
    createUserValidator,
    loginValidator
}