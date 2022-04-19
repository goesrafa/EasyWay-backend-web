const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken') //gerar o token 
const bcrypt = require('bcryptjs')//criptografia da senha

//Validação 
const { checkSchema, validationResult, check } = require('express-validator')
const gravatar = require('gravatar') //utiliza o avatar do email

//Models
const User = require("../models/User")

//@route POST api/user/register
//@desc Register user
//@access Public
router.post('/register', [
    //Validação
    check('name', 'Nome é obrigatório').notEmpty(),
    check('email', 'Porfavor coloque um email válido').isEmail(),
    check('password', 'Digite uma senha de no mínimo 6 caracteres').isLength({
        min: 6
    })
], async (req, res) => {
    const errors = validationResult(req);
        if(!errors.isEmpty()){
        return res.status(400).json({
            errors: errors.array()
        });
    }
    //get do email, senha e nome atraves do REQUEST 
    const { name, email, password} = req.body;

    try {
        //validando se o usuário realmente existe
        let user = await User.findOne({email});

        if(user){
            return res.status(400).json({
                errors: [
                   {
                    msg: 'Usuário realmente existe'
                   }
                ]
            })
        }
        const avatar = gravatar.url(email, {
            s:'200',
            r: 'pg',
            d: 'mm'
        })

        user = new User({
            name, email, avatar, password
        })
        //criptografando a senha
        const salt = await bcrypt.genSalt(10)
        //salvando a senha
        user.password = bcrypt.hash(password, salt)
        //salvando no db
        await user.save();

        //Gerando o token
        const payload ={
            user:{
                id: user.id
            }
        }

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            {
                expiresIn: 360000
            }, (err, token) => {
                if(err) throw err;
                res.json({token})
            }
        )
    } catch (error) {
        console.log(err.message);
        res.status(500).send('Server error')
    }
})

module.exports = router