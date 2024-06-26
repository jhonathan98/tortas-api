const jwt  = require("jsonwebtoken")

const generateToken = (InfoUser) => {
    const token = jwt.sign({        
        data: InfoUser
      }, 
      InfoUser.claveIngreso,
      { expiresIn: '12h' }
    )
    return token;
}

const validateToken = (token) => {
    try {      
        const infoUser = jwt.decode(token);
        const tokenVerify = jwt.verify(token, infoUser.data.claveIngreso);
        
        return tokenVerify;        
    } catch (error) {        
        return error
    }
}

module.exports = {
    generateToken,
    validateToken
}