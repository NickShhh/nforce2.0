// roblox_api_server.js
// Contiene la lógica del servidor Express para la API de Roblox.

require('dotenv').config(); // Carga las variables de entorno
const express = require('express');
const axios = require('axios'); // Si necesitas hacer peticiones HTTP a la API de Roblox (Webhook, etc.)
const dbPool = require('./db_connection'); // Importa la conexión a la base de datos de Supabase

const app = express();
const port = process.env.PORT || 10000; // Usa el puerto de la variable de entorno (Render lo proveerá) o 10000 para local

// --- Middleware para parsear JSON ---
app.use(express.json());

// --- Ruta para recibir reportes de Roblox ---
app.post('/report', async (req, res) => {
    const { player_id, reason, reporter_id, server_id, place_id } = req.body;

    if (!player_id || !reason) {
        return res.status(400).json({ success: false, message: 'Faltan player_id o reason.' });
    }

    try {
        // Enviar notificación a Discord (opcional, si quieres que el backend lo haga)
        // O el bot local puede consultar la DB para ver nuevos reportes si esta es la única función del backend.
        // Aquí podríamos enviar un webhook a un canal de reportes en Discord, por ejemplo.
        if (process.env.REPORT_CHANNEL_ID && process.env.DISCORD_BOT_TOKEN) {
             const discordWebhookUrl = `https://discord.com/api/webhooks/${REPORT_CHANNEL_ID}/TU_WEBHOOK_TOKEN`; // Necesitarías configurar un webhook en Discord y poner su token aquí
             // Ejemplo de cómo usar un webhook
             // await axios.post(discordWebhookUrl, {
             //     content: `🚨 **NUEVO REPORTE:**\nPlayer ID: **${player_id}**\nMotivo: **${reason}**\nReporter ID: ${reporter_id || 'N/A'}\nServidor: ${server_id || 'N/A'} (Place: ${place_id || 'N/A'})`
             // });
        }


        // Aquí podrías guardar el reporte en una tabla 'reports' si quieres un historial detallado,
        // pero para el anti-cheat, el foco es el baneo.

        console.log(`Recibido reporte: Player ID: ${player_id}, Razon: ${reason}`);

        return res.status(200).json({ success: true, message: 'Reporte recibido correctamente.' });

    } catch (error) {
        console.error('❌ Error al procesar el reporte:', error);
        return res.status(500).json({ success: false, message: 'Error interno del servidor al procesar el reporte.' });
    }
});

// --- Ruta para verificar el estado de baneo de un jugador ---
app.post('/checkBanStatus', async (req, res) => {
    const { player_id } = req.body;

    if (!player_id) {
        return res.status(400).json({ success: false, message: 'Falta player_id.' });
    }

    try {
        const { rows } = await dbPool.query(
            'SELECT player_id, reason, expiration_date, active FROM banned_players WHERE player_id = $1 ORDER BY date_banned DESC LIMIT 1',
            [player_id]
        );

        if (rows.length > 0 && rows[0].active) {
            const banInfo = rows[0];
            const now = new Date();

            // Verificar si el baneo ha expirado
            if (banInfo.expiration_date && now > banInfo.expiration_date) {
                // Si ha expirado, puedes marcarlo como inactivo en la DB (opcional, para limpieza)
                await dbPool.query('UPDATE banned_players SET active = FALSE WHERE player_id = $1', [player_id]);
                return res.status(200).json({
                    success: true,
                    isBanned: false,
                    message: 'El jugador no está baneado (el baneo ha expirado).'
                });
            } else {
                return res.status(200).json({
                    success: true,
                    isBanned: true,
                    reason: banInfo.reason,
                    expirationDate: banInfo.expiration_date ? banInfo.expiration_date.toISOString() : null,
                    message: 'El jugador está baneado.'
                });
            }
        } else {
            return res.status(200).json({ success: true, isBanned: false, message: 'El jugador no está baneado.' });
        }

    } catch (error) {
        console.error('❌ Error al verificar el estado de baneo:', error);
        return res.status(500).json({ success: false, message: 'Error interno del servidor al verificar el baneo.' });
    }
});

// --- Iniciar el servidor Express ---
app.listen(port, () => {
    console.log(`⚡ Backend de Roblox corriendo en el puerto ${port}`);
    // En Render, este puerto será el que Render asigne. Localmente, será 10000.
});
