// roblox_api_server.js
require('dotenv').config();
const express = require('express');
const dbPool = require('./db_connection'); // Importa la conexión a la DB
const app = express();
const port = process.env.PORT || 10000; // Usa el puerto de la variable de entorno o 10000

app.use(express.json());

// ... tus rutas Express para Roblox (/report, /checkBanStatus)
// Las rutas usarán dbPool.query() para interactuar con la DB

app.listen(port, () => {
    console.log(`Backend server corriendo en el puerto ${port}`);
});
