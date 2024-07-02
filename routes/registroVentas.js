const express = require("express");
const { registroVentasController } = require("../controller");
const BearerToken = require("../middlewares/validateToken");
const router = express.Router();

/** POST Methods */
    /**
     * @openapi
     * '/api/registroventas/':
     *  post:
     *     tags:
     *     - RegistroVentas Controller
     *     summary: Obtener todos los registros de las ventas
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
    [BearerToken],
    registroVentasController.ObtenerRegistrosVentas
)

module.exports = router;