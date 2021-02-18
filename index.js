const express = require('express');
const cors = require('cors');
const { dbConnection } = require('./db/config');
require('dotenv').config();

//Crear el servidor/aplición de express
const app = express();

//Base de datos
dbConnection();

// Directorio Público
app.use(express.static('public'))

//CORS  
app.use( cors());

// Lectura y parseo del body
app.use( express.json());

//Rutas
app.use('/api/auth', require('./routes/auth'));

//levantar app de express
app.listen( process.env.PORT, () => {
    console.log(`Servidor corriendo en puerto ${ process.env.PORT }`);
})