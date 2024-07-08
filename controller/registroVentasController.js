const {registroVentas}  = require("../resolvers")

const ObtenerRegistrosVentas = async (req,res) => {
    try {
        const numeroPagina =  req.body.numeroPagina //pagina en donde se está ubicado
        const cantidadItems = req.body.cantidadItems //cantidad de items por pagina
        const registros = await registroVentas.getAll(numeroPagina,cantidadItems);
        
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
    } catch (error) {
        res.status(500).json({
            mensaje:"Error al obtener todos los registros",
            error:error
        })        
    }
}

const crearRegistroVentas = async (req, res) => {
    try {
        const registroVenta = {
            Nombreproducto : req.body.Nombreproducto,
            cantidadProducto : req.body.cantidadProducto,
            precioProducto : req.body.precioProducto,
            metodoPago : req.body.metodoPago
        }

        const registro = await registroVentas.createRegister(registroVenta);

        res.status(200).json({
            mensaje:"Registro de venta creado",
            data:registro
        })
    } catch (error) {
        res.status(500).json({
            mensaje:"Error al crear el registro de venta",
            error:error
        })
    }
}

module.exports = {
    ObtenerRegistrosVentas,
    crearRegistroVentas
}