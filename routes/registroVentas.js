const express = require("express");
const { registroVentasController } = require("../controller");
const router = express.Router();

router.get(
    '/',
    registroVentasController.ObtenerRegistrosVentas
)

module.exports = router;