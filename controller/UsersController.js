const { Usuarios } = require("../resolvers");
const { comparePassword } = require("../utils/generateCode");
const { encryptPassword } = require("../utils/generateCode");
const { generateUUID } = require("../utils/generateCode");
const { generateToken, validateToken } = require("../utils/tokenjwt");

const CrearUsuario = async (req, res) => {
    try {
        const { user, email, password } = req.body;
        const userExist = await Usuarios.getUserByUser(user);
        const codigo = generateUUID()
        
        if(userExist){
            return res.status(400).json({ message: "El usuario ya existe" });
        }else{
            const dataUser = {
                usuario:user,
                correo:email,
                password: encryptPassword(password),
                claveIngreso:codigo
            }
            const newUser = await Usuarios.CreateUser(dataUser);
            return res.status(200).json({ message: "Usuario creado",user:newUser });
        }
    } catch (error) {
        return res.status(500).json({ message: "Error al crear el usuario" });
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
    try {
        const { user, password } = req.body;
        const userExist = await Usuarios.getUserXuserpass(user,password);
        const token = generateToken(userExist);
        if(userExist){
            const comparePass = await comparePassword(password,userExist.password);
            if(!comparePass){
                return res.status(402).json({ message: "Contraseña incorrecta" });
            }
            return res.status(200).json({ message: "Usuario encontrado",token,user:userExist });
        }else{
            return res.status(404).json({ message: "El usuario no existe" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Error en el servidor",error });        
    }
    

}


module.exports = {
    CrearUsuario,
    ObtenerUsuarioXUser,
    login    
}