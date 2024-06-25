const express = require("express")
const { userController } = require("../controller")
const router = express.Router()

router.post(
    "/",
    userController.CrearUsuario
)

router.get(
    "/",
    userController.ObtenerUsuarioXUser
)


module.exports = router