const express = require("express");
const { registroVentasController } = require("../controller");
const BearerToken = require("../middlewares/validateToken");
const router = express.Router();

router.get(
    '/',
    [BearerToken],
    registroVentasController.ObtenerRegistrosVentas
)

module.exports = router;