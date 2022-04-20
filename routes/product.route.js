const express = require('express')
const router = express.Router()
const Product = require('../models/Product')
const auth = require('../middleware/auth')
const adminAuth = require('../middleware/adminAuth')
const formidable = require('formidable')
const fs = require('fs')


//@route POST api/product/
//@desc Create product
//@access Private admin
router.post('/', auth, adminAuth, (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: 'Imagem não pode ser salva',
            });
        }

        if (!files.photo) {
            return res.status(400).json({
                error: 'Imagem é obrigatória',
            });
        }

        if (
            files.photo.type !== 'image/jpeg' &&
            files.photo.type !== 'image/jpg' &&
            files.photo.type !== 'image/png'
        ) {
            return res.status(400).json({
                error: 'Formato inválido',
            });
        }

        // Check for all fields
        const {
            name,
            description,
            price,
            category,
            quantity,
            shipping
        } = fields;
        if (
            !name ||
            !description ||
            !price ||
            !category ||
            !quantity ||
            !shipping
        ) {
            return res.status(400).json({
                error: 'Os campos são obrigatórios',
            });
        }

        let product = new Product(fields);
        // 1MB = 1000000
        if (files.photo.size > 1000000) {
            return res.status(400).json({
                error: 'A imagem deve ter 1MB de tamanho',
            });
        }

        product.photo.data = fs.readFileSync(files.photo.path);
        product.photo.contentType = files.photo.type;

        try {
            await product.save();
            res.json('Produto criado com sucesso');
        } catch (error) {
            console.log(error);
            res.status(500).send('Server error');
        }
    });
});

module.exports = router