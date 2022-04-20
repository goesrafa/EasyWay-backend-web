express = require('express')
const router = express.Router()
const Category = require('../models/Category')
const auth = require('../middleware/auth')
const adminAuth = require('../middleware/adminAuth')
const categoryById = require('../middleware/categoryById')

const { check, validationResult } = require('express-validator')
const { route } = require('./auth.route')

//@route POST api/category
//@desc Create Category
//@access Private Admin
router.post('/', [
    check('name', 'Nome é obrigatório').notEmpty()
], auth, adminAuth, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: errors.array()[0].msg
        })
    }
    const { name } = req.body
    try {
        let category = await Category.findOne({ name })

        if (category) {
            return res.status(403).json({
                error: 'A categoria já existe'
            })
        }
        const newCatogory = new Category({ name })
        category = await newCatogory.save()
        res.json(category)
    } catch (err) {
        console.log(err)
        res.status(500).send('Server error')
    }
})

//@route GET api/categories
//@desc GET todas categories
//@access Public
router.get('/all', async (req, res) => {
    try {
        let data = await Category.find({})
        res.json(data)
    } catch (err) {
        console.log(err)
        res.status(500).send('Server Error')
    }
})
//@route GET api/category/:categoryId
//@desc GET  uma categoria
//@access Public
router.get('/:categoryId', categoryById, async (req, res) => {
    res.json(req.category)
})

//@route PUT api/category/:categoryId
//@desc Update  uma categoria
//@access Private Admin
router.put('/:categoryId', auth, adminAuth, categoryById, async (req, res) => {
    let category = req.category
    const { name } = req.body
    if (name) category.name = name.trim()

    try {
        category = await category.save()
        res.json(category)
    } catch (err) {
        console.log(err)
        res.status(500).send('Server Error')
    }
})

//@route DELETE api/category/:categoryId
//@desc Delete  uma categoria
//@access Private Admin
router.delete('/:categoryId', auth, adminAuth, categoryById, async (req, res) =>{
    let category = req.category
    try {
        let deletedCategory = await category.remove()
        res.json({
            msg: `${deletedCategory.name} deletada com sucesso`
        })

    } catch (erro) {
        console.log(err)
        res.status(500).send('Server Error')
    }
})
module.exports = router 