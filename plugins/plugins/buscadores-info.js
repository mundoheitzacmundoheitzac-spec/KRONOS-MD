const axios = require('axios');
let config;
try { config = require('../../config'); } catch { config = { ownerNumber: [], ownerName: 'Owner', mess: { wait: '⏳...' } }; }

module.exports = {
    commands: [
        'wiki', '【entity-wikipedia¦canonical_name=Wikipedia】', 'letra', 'lyrics', 'ping', 'velocidad', 'estado',
        'owner', 'creador', 'hora', 'fecha', 'dato', 'curiosidad', 'frase',
        'getpp', 'fotoperfil', 'id', 'jid', 'uptime', 'runtime'
    ],
    exec: async ({ sock, m, from, sender, text, command }) => {
        const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || m.message?.extendedTextMessage?.contextInfo?.participant || null;

        try {
            if (command === 'wiki' || command === '【entity-wikipedia¦canonical_name=Wikipedia】') {
                if (!text) return sock.sendMessage(from, { text: '📚 Escribe lo que quieres buscar. Ej: *.wiki Sistema Solar*' }, { quoted: m });
                try {
                    const res = await axios.get(`https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(text)}`, { timeout: 15000 });
                    if (!res.data?.extract) return sock.sendMessage(from, { text: '❌ No encontré información en 【entity-Wikipedia¦canonical_name=Wikipedia】.' }, { quoted: m });
                    return sock.sendMessage(from, { text: `📖 *WIKIPEDIA: ${res.data.title}*\n\n${res.data.extract.slice(0, 3000)}${res.data.content_urls?.desktop?.page ? `\n\n🔗 ${res.data.content_urls.desktop.page}` : ''}` }, { quoted: m });
                } catch {
                    return sock.sendMessage(from, { text: '❌ No encontré información en 【entity-Wikipedia¦canonical_name=Wikipedia】.' }, { quoted: m });
                }
            }

            if (command === 'letra' || command === 'lyrics') {
                if (!text) return sock.sendMessage(from, { text: '🎤 Escribe el artista y canción. Ej: *.letra Peso Pluma Ella Baila Sola*' }, { quoted: m });
                try {
                    // lrclib sí jala sin key
                    const res = await axios.get(`https://lrclib.net/api/search?track_name=${encodeURIComponent(text)}`, { timeout: 15000 });
                    const song = res.data?.[0];
                    if (!song?.plainLyrics) return sock.sendMessage(from, { text: '❌ No encontré la letra de esa canción.' }, { quoted: m });
                    return sock.sendMessage(from, { text: `🎶 *${song.trackName} - ${song.artistName}*\n\n${song.plainLyrics.slice(0, 3500)}` }, { quoted: m });
                } catch {
                    return sock.sendMessage(from, { text: '❌ No encontré la letra de esa canción.' }, { quoted: m });
                }
            }

            if (['ping', 'velocidad', 'estado'].includes(command)) {
                const start = Date.now();
                const sent = await sock.sendMessage(from, { text: '⚡ Midiendo velocidad...' }, { quoted: m });
                const speed = Date.now() - start;
                try {
                    return await sock.sendMessage(from, { text: `🚀 *KRONOS-MD ONLINE*\n• *Velocidad:* ${speed} ms\n• *Plugins activos:* ${global.plugins.size}`, edit: sent.key });
                } catch {
                    return sock.sendMessage(from, { text: `🚀 *KRONOS-MD ONLINE*\n• *Velocidad:* ${speed} ms\n• *Plugins activos:* ${global.plugins.size}` }, { quoted: m });
                }
            }

            if (command === 'owner' || command === 'creador') {
                const owners = Array.isArray(config.ownerNumber) ? config.ownerNumber : [config.ownerNumber];
                const ownerNum = String(owners[0] || '').replace(/\D/g, '');
                const ownerName = config.ownerName || 'Owner KRONOS-MD';
                if (!ownerNum) return sock.sendMessage(from, { text: `👑 *Creador:* ${ownerName}` }, { quoted: m });
                return sock.sendMessage(from, { text: `👑 *Creador de KRONOS-MD*\