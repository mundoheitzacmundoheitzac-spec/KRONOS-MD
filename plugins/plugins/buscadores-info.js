const axios = require('axios');
const config = require('../config');

module.exports = {
    commands: [
        'wiki', 'wikipedia', 'letra', 'lyrics', 'ping', 'velocidad', 'estado',
        'owner', 'creador', 'hora', 'fecha', 'dato', 'curiosidad', 'frase',
        'getpp', 'fotoperfil', 'id', 'jid', 'uptime', 'runtime'
    ],
    exec: async ({ sock, m, from, sender, text, command }) => {
        const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.;

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
                return sock.sendMessage(from, { text: `👑 *CREADOR DE ${config.botName}*\n• *Número:* +52 639 136 6054\n• *Estado:* Activo` }, { quoted: m });
            }

            if (command === 'hora' || command === 'fecha') {
                const now = new Date().toLocaleString('es-MX', { timeZone: 'America/Chihuahua' });
                return sock.sendMessage(from, { text: `🕒 *Fecha y hora actual:* ${now}` }, { quoted: m });
            }

            if (command === 'dato' || command === 'curiosidad') {
                const datos = [
                    'Los pulpos tienen tres corazones y sangre de color azul.',
                    'La miel nunca se echa a perder; se ha encontrado miel comestible de hace 3,000 años.',
                    'En Saturno y Júpiter llueven diamantes debido a la presión atmosférica.',
                    'El corazón de una ballena azul es tan grande como un automóvil pequeño.'
                ];
                return sock.sendMessage(from, { text: `💡 *Dato curioso:* ${datos[Math.floor(Math.random() * datos.length)]}` }, { quoted: m });
            }

            if (command === 'frase') {
                const frases = [
                    'El éxito es la suma de pequeños esfuerzos repetidos día tras día.',
                    'No cuentes los días, haz que los días cuenten.',
                    'La disciplina tarde o temprano vencerá a la inteligencia.'
                ];
                return sock.sendMessage(from, { text: `✨ *Frase del día:* "${frases[Math.floor(Math.random() * frases.length)]}"` }, { quoted: m });
            }

            if (command === 'getpp' || command === 'fotoperfil') {
                const target = mentioned || sender;
                try {
                    const ppUrl = await sock.profilePictureUrl(target, 'image');
                    return sock.sendMessage(from, { image: { url: ppUrl }, caption: `🖼️ Foto de perfil de @${target.split('@')}`, mentions: [target] }, { quoted: m });
                } catch {
                    return sock.sendMessage(from, { text: '❌ El usuario tiene su foto de perfil en privado.' }, { quoted: m });
                }
            }

            if (command === 'id' || command === 'jid') {
                return sock.sendMessage(from, { text: `🆔 *ID de este chat:* \`${from}\`` }, { quoted: m });
            }

            if (command === 'uptime' || command === 'runtime') {
                const sec = Math.floor(process.uptime());
                const hrs = Math.floor(sec / 3600);
                const min = Math.floor((sec % 3600) / 60);
                return sock.sendMessage(from, { text: `⏱️ *Tiempo encendido:* ${hrs}h ${min}m ${sec % 60}s` }, { quoted: m });
            }
        } catch (e) {
            return sock.sendMessage(from, { text: '⚠️ No se pudo obtener la información.' }, { quoted: m });
        }
    }
};
