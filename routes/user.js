const express = require("express")
const { userController } = require("../controller")
const { userValidator } = require("../validators")
const router = express.Router()

/** POST Methods */
    /**
     * @openapi
     * '/api/user/register':
     *  post:
     *     tags:
     *     - User Controller
     *     summary: Register a user
     *     requestBody:
     *      required: true
     *      content:
     *        application/json:
     *           schema:
     *            type: object
     *            required:
     *              - usuario
     *              - password
     *              - correo
     *            properties:
     *              usuario:
     *                type: string
     *                default: johndoe
     *              password:
     *                type: string
     *                min-caracter: 8
     *                default: johnDoe20!@
     *              correo:
     *                type: string     *                
     *                default: john@test.com
     *     responses:
     *      200:
     *        description: User created
     *      400:
     *        description: User exist!
     *      500:
     *        description: Server Error
     */
router.post(
    "/register",
    [userValidator.createUserValidator],
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
     *     summary: Login a user
     *     requestBody:
     *      required: true
     *      content:
     *        application/json:
     *           schema:
     *            type: object
     *            required:
     *              - usuario
     *              - password
     *            properties:
     *              usuario:
     *                type: string
     *                default: johndoe
     *              password:
     *                type: string
     *                min-caracter: 8
     *                default: johnDoe20!@
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
router.post(
    "/login",
    [userValidator.loginValidator],
    userController.login
)



module.exports = router