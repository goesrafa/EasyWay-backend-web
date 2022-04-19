const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken') //gerar o token 
const bcrypt = require('bcryptjs')//criptografia da senha

//Validação 
const { checkSchema, validationResult, check } = require('express-validator')
const gravatar = require('gravatar') //utiliza o avatar do email
const auth = require('../middleware/auth')
//Models
const User = require("../models/User")

//@route POST api/user
//@desc User Information
//@access Private
router.get('/', auth, async (req, res) =>{
    try {
        const user = await  User.findById(req.user.id).select('-password');
        res.json(user)
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server error')
    }
})

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
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    //get do email, senha e nome atraves do REQUEST 
    const { name, email, password } = req.body;

    try {
        //validando se o usuário realmente existe
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({
                errors: [
                    {
                        msg: 'Usuário realmente existe'
                    }
                ]
            })
        }
        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        })

        user = new User({
            name, email, avatar, password
        })
        //criptografando a senha
        const salt = await bcrypt.genSalt(10)
        //salvando a senha
        user.password = await bcrypt.hash(password, salt)
        //salvando no db
        await user.save();
        //Gerando o token
        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            {
                expiresIn: 360000
            }, (err, token) => {
                if (err) throw err
                res.json({ token })
            }
        )
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server error')
    }
})
//@route POST api/user/login
//@desc Login user
//@access Public
router.post('/login', [
    //validação de email e senha
    check('email', 'Porfavor insira um email válido').isEmail(),
    check('password', 'Senha é obrigatória').exists()
], async (req, res)=>{
    //if caso de erro
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({
            errors: errors.array()
        })
    }

    //if se estiver tudo certo
    //get email e senha na reuisição do body
    const {email, password} = req.body;

    try {
        let user = await User.findOne({
            email
        })
        if(!user){
            return res.status(400).json({
                errors: [{
                    msg: 'Credencial inválida'
                }]
            })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
            return res.status(400).json({
                errors: [{
                    msg: 'Credencial inválida'
                }]
            })
        }

        //payload for jwt
        const payload = {
            user:{
                id: user.id
            }
        }
        jwt.sign(
            payload,
            process.env.JWT_SECRET, {
                expiresIn: 36000
            }, (err, token) => {
                if(err) throw err;
                res.json({
                    token
                })
            }
        )
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server error')
    }
})

module.exports = router