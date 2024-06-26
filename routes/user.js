const express = require("express")
const { userController } = require("../controller")
const { userValidator } = require("../validators")
const router = express.Router()

router.post(
    "/",
    userController.CrearUsuario
)

router.get(
    "/",
    userController.ObtenerUsuarioXUser
)

/** POST Methods */
    /**
     * @openapi
     * '/api/user/login':
     *  post:
     *     tags:
     *     - User Controller
     *     summary: Create a user
     *     requestBody:
     *      required: true
     *      content:
     *        application/json:
     *           schema:
     *            type: object
     *            required:
     *              - username
     *              - email
     *              - password
     *            properties:
     *              username:
     *                type: string
     *                default: johndoe 
     *              email:
     *                type: string
     *                default: johndoe@mail.com
     *              password:
     *                type: string
     *                default: johnDoe20!@
     *     responses:
     *      201:
     *        description: Created
     *      409:
     *        description: Conflict
     *      404:
     *        description: Not Found
     *      500:
     *        description: Server Error
     */
router.post(
    "/login",
    [userValidator.loginValidator],
    userController.login
)



module.exports = router