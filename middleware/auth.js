const jwt = require('jsonwebtoken')

module.exports = function(req, res, next){
    const token = req.header('x-auth-token')

    //Check do token
    if(!token){
        return res.status(401).json({
            msg: 'Sem token, autenticação falhou'
        })
    }

    //Verificando o token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded.user;
        next()
    } catch (err) {
        req.status(401).json({
            msg: 'O token não é válido'
        })
    }
}
