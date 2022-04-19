const mongoose = require('mongoose')

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
    }
}, {
    timestamps: true
})

module.exports = User = mongoose.model('Category', CategorySchema)