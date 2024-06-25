const {registroVentas}  = require("../resolvers")

const ObtenerRegistrosVentas = async (req,res) => {
    try {
        const registros = await registroVentas.getAll();
        
        if(registros){            
            res.status(200).json({
                mensaje:"Datos encontrados",
                data:registros
            })
        }else{
            res.status(201).json({
                mensaje:"Sin datos",
                data:[]
            })
        }
    } catch (error) {   console.log(error)     
        res.status(500).json({
            mensaje:"Error al obtener todos los registros",
            error
        })        
    }
}

module.exports = {
    ObtenerRegistrosVentas
}