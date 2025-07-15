// discord_bot.js
require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const dbPool = require('./db_connection'); // Importa la conexión a la DB

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers, // Si usas GuildMembers intent
    ],
});

// ... toda tu lógica del bot (client.on('ready'), client.on('interactionCreate'), etc.)
// Las funciones del bot usarán dbPool.query() para interactuar con la DB
// Asegúrate de que las variables DISCORD_BOT_TOKEN, CLIENT_ID, GUILD_ID, etc. estén en tu .env local

client.login(process.env.DISCORD_BOT_TOKEN)
    .then(() => console.log('Bot de Discord iniciado y conectado.'))
    .catch(error => console.error('Error al iniciar sesión del bot de Discord:', error));
