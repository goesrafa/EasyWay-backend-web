const User = require('../models/User')

module.exports = async function(req, res,next){
    try {
        //Informação do usuário pelo Id (GET)
        const user = await User.findOne({
            _id: req.user.id
        })

        if(user.role === 0){
            return res.status(403).json({
                error: 'Acesso de recursos do administrador negado!'
            })
        }
        
        next()
    } catch (err) {
        console.log(err)
        res.status(500).send('Server error')
    }
}