const jwt  = require("jsonwebtoken")

const generateToken = (codigoUsuario) => {
    const token = jwt.sign({
        //exp: '10s',//Math.floor(Date.now() / 1000) + (60 * 60),
        data: codigoUsuario
      }, 
      'secret',
      { expiresIn: '1m' }
    )
    return token;
}

const validateToken = (token) => {
    try {
        return jwt.verify(token, 'secret')        
    } catch (error) {
        return error
    }
}

module.exports = {
    generateToken,
    validateToken
}