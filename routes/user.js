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

router.post(
    "/login",
    userController.login
)

router.post(
    "/validate",
    userController.pruebaToken
)


module.exports = router