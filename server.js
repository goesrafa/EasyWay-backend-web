const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.json())
 
require('dotenv').config({
    path: './config/.env'
});

//MongoDB
const connectDB = require('./config/db');
connectDB()

app.use(morgan('dev'))
app.use(cors())

//routes
app.use('/api/user/', require('./routes/auth.route'));
app.use('/api/category/', require('./routes/category.route'));
app.get('/', (req, res) =>{
    res.send('Teste de rota = > home page')
})

//Pagina nao encontrada
app.use((req, res) =>{
    res.status(404).json({
        message: 'Página não encontrada'
    })
})

const PORT = process.env.PORT

app.listen(PORT, () =>{
    console.log(`Conexão na porta ${PORT}`)
})