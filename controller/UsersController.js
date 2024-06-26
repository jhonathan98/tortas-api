const { Usuarios } = require("../resolvers");
const { generateUUID } = require("../utils/generateCode");
const { generateToken, validateToken } = require("../utils/tokenjwt");

const CrearUsuario = async (req, res) => {
    const { user, email, password } = req.body;
    const userExist = await Usuarios.getUserByUser(user);
    const codigo = generateUUID()
    
    if(userExist){
        return res.status(400).json({ message: "El usuario ya existe" });
    }else{
        const dataUser = {
            usuario:user,
            correo:email,
            password:password,
            claveIngreso:codigo
        }
        const newUser = await Usuarios.CreateUser(dataUser);
        return res.status(201).json({ message: "Usuario creado",user:newUser });
    }
}

const ObtenerUsuarioXUser = async (req, res) =>{
    const { user } = req.body;
    const userExist = await Usuarios.getUserByUser(user);
    if(userExist){
        return res.status(200).json({ message: "Usuario encontrado",user:userExist });
    }else{
        return res.status(400).json({ message: "El usuario no existe" });
    }
}

const login = async (req,res) => {
    const { user, password } = req.body;
    const userExist = await Usuarios.getUserXuserpass(user,password);
    const token = generateToken(userExist.claveIngreso);
    if(userExist){
        return res.status(200).json({ message: "Usuario encontrado",token,user:userExist });
    }else{
        return res.status(400).json({ message: "El usuario no existe" });
    }

}

const pruebaToken = async (req,res) => {
    const { token } = req.body;
    const tokenValidado = validateToken(token);
    return res.status(200).json({tokenValidado})
}

module.exports = {
    CrearUsuario,
    ObtenerUsuarioXUser,
    login,
    pruebaToken
}