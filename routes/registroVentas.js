const express = require("express");
const { registroVentasController } = require("../controller");
const BearerToken = require("../middlewares/validateToken");
const { registroVentasValidator } = require("../validators");
const router = express.Router();

/** GET Methods */
    /**
     * @openapi
     * '/api/registroventas/':
     *  post:
     *     tags:
     *     - RegistroVentas Controller
     *     summary: Obtener todos los registros de las ventas
     *     security:
     *      - bearerAuth: []
     *     requestBody:
     *      required: true
     *      content:
     *        application/json:
     *           schema:
     *            type: object
     *            required:
     *            properties:
     *     responses:
     *      200:
     *        description: User Found
     *      402:
     *        description: Password incorrect
     *      404:
     *        description: User Not Found
     *      500:
     *        description: Server Error
     */

router.get(
    '/',
    [registroVentasValidator.ObtenerRegistroVentasValidator,BearerToken],
    registroVentasController.ObtenerRegistrosVentas
)

/** POST Methods */
    /**
     * @openapi
     * '/api/registroventas/crear':
     *  post:
     *     tags:
     *     - RegistroVentas Controller
     *     summary: Crear un registro de ventas
     *     security:
     *      - bearerAuth: []
     *     requestBody:
     *      required: true
     *      content:
     *        application/json:
     *           schema:
     *            type: object
     *            required:
     *              -Nombreproducto
     *              -cantidadProducto
     *              -precioProducto
     *              -metodoPago
     *            properties:
     *              Nombreproducto:
     *                  type: string
     *                  default: Torta de chocolate
     *              cantidadProducto:
     *                  type: int
     *                  default: 2
     *              precioProducto:
     *                  type: int
     *                  default: 2.000
     *              metodoPago:
     *                  type: stiring
     *                  default: efectivo
     *     responses:
     *      200:
     *        description: Registro de venta creado      
     *      500:
     *        description: Error al crear un registro de venta
     */
router.post(
    '/crear',
    [registroVentasValidator.crearRegistroVentasValidator,BearerToken],
    registroVentasController.crearRegistroVentas
)

module.exports = router;