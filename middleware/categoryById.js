const mongoose = require('mongoose')
const Category = require('../models/Category')


module.exports = async function (req, res, next){
    const {categoryId} = req.params

    if(!mongoose.Types.ObjectId.isValid(categoryId)){
        return res.status(403).json({
            error: 'Categoria não encontrada'
        })
    }

    try {
        let category = await Category.findById(categoryId)
        if(!category){
            return res.status(403).json({
                error: 'Categoria não encontrada'
            })
        }

        req.category = category
        next()
    } catch (err) {
        console.log(err)
        res.status(500).send('Server error')
    }
}