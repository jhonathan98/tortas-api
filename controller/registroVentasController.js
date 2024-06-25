const {registroVentas}  = require("../resolvers")

const ObtenerRegistrosVentas = async (req,res) => {
    try {
        const registros = await registroVentas.getAll();
        
        if(registros){
            console.log(registros);
            res.status(200).json({
                mensaje:"Datos encontrados",
                data:registros
            })
        }else{
            res.status(404).json({mensaje:"Sin datos"})
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            mensaje:"Error al obtener todos los registros",
            data:[]
        })        
    }
}

module.exports = {
    ObtenerRegistrosVentas
}