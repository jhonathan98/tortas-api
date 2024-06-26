const { validateToken } = require("../utils/tokenjwt");

const BearerToken = (req,res,next) => {
    if (!req.headers.authorization || req.headers.authorization.indexOf('Bearer ') === -1) {
        return res.status(401).json({ message: 'Missing Authorization Header' });
    }
    const token =  req.headers.authorization.split(' ')[1];
    
    const validToken = validateToken(token);
    if(validToken.name === "TokenExpiredError"){
        return res.status(401).json({ message: 'Token Expired' });
    }
    if(Object.keys(validToken).length === 0){
        return res.status(401).json({ message: 'Token invalid',token:validToken });    
    }
    //return res.status(401).json({ message: 'successful token',token:validToken });
    next();
}

module.exports = BearerToken;