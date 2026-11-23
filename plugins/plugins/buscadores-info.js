const axios = require('axios');
const config = require('../config');

module.exports = {
    commands: [
        'wiki', 'wikipedia', 'letra', 'lyrics', 'ping', 'velocidad', 'estado',
        'owner', 'creador', 'hora', 'fecha', 'dato', 'curiosidad', 'frase',
        'getpp', 'fotoperfil', 'id', 'jid', 'uptime', 'runtime'
    ],
    exec: async ({ sock, m, from, sender, text, command }) => {
        const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || m.message?.extendedTextMessage?.contextInfo?.participant;

        try {
            if (command === 'wiki' || command === 'wikipedia') {
                if (!text) return sock.sendMessage(from, { text: '📚 Escribe lo que quieres buscar. Ej: *.wiki Sistema Solar*' }, { quoted: m });
                const res = await axios.get(`https://wikipedia.org{encodeURIComponent(text)}`);
                if (!res.data?.extract) return sock.sendMessage(from, { text: '❌ No encontré información en Wikipedia.' }, { quoted: m });
                return sock.sendMessage(from, { text: `📖 *WIKIPEDIA: ${res.data.title}*\n\n${res.data.extract}` }, { quoted: m });
            }

            if (command === 'letra' || command === 'lyrics') {
                if (!text) return sock.sendMessage(from, { text: '🎤 Escribe el artista y canción. Ej: *.letra Peso Pluma Ella Baila Sola*' }, { quoted: m });
                const res = await axios.get(`https://some-random-api.com{encodeURIComponent(text)}`);
                if (!res.data?.lyrics) return sock.sendMessage(from, { text: '❌ No encontré la letra de esa canción.' }, { quoted: m });
                return sock.sendMessage(from, { text: `🎶 *${res.data.title} - ${res.data.author}*\n\n${res.data.lyrics.slice(0, 3500)}` }, { quoted: m });
            }

            if (['ping', 'velocidad', 'estado'].includes(command)) {
                const start = Date.now();
                const sent = await sock.sendMessage(from, { text: '⚡ Midiendo velocidad...' }, { quoted: m });
                const speed = Date.now() - start;
                return sock.sendMessage(from, { text: `🚀 *KRONOS-MD ONLINE*\n• *Velocidad:* ${speed} ms\n• *Plugins activos:* ${global.plugins.size}`, edit: sent.key });
            }

            if (command === 'owner' || command === 'creador') {
                return sock.sendMessage(from, { text: `