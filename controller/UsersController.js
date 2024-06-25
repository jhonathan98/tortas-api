const { Usuarios } = require("../resolvers");
const { generateUUID } = require("../utils/generateCode");

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

module.exports = {
    CrearUsuario,
    ObtenerUsuarioXUser
}