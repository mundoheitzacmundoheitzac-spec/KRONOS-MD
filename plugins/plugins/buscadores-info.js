const axios = require('axios');
let config;
try { config = require('../../config'); } catch { config = { ownerNumber: [], ownerName: 'Owner', mess: { wait: '⏳...' } }; }

module.exports = {
    commands: [
        'wiki', 'wikipedia', 'letra', 'lyrics', 'ping', 'velocidad', 'estado',
        'owner', 'creador', 'hora', 'fecha', 'dato', 'curiosidad', 'frase',
        'getpp', 'fotoperfil', 'id', 'jid', 'uptime', 'runtime'
    ],
    exec: async ({ sock, m, from, sender, text, command }) => {
        const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || m.message?.extendedTextMessage?.contextInfo?.participant || null;
        try {
            if (command === 'wiki' || command === 'wikipedia') {
                if (!text) return sock.sendMessage(from, { text: '📚 Escribe lo que quieres buscar. Ej: *.wiki Sistema Solar*' }, { quoted: m });
                try {
                    const res = await axios.get(`https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(text)}`, { timeout: 15000 });
                    if (!res.data?.extract) return sock.sendMessage(from, { text: '❌ No encontré información en Wikipedia.' }, { quoted: m });
                    return sock.sendMessage(from, { text: `📖 *WIKIPEDIA: ${res.data.title}*\n\n${res.data.extract.slice(0, 3000)}` }, { quoted: m });
                } catch {
                    return sock.sendMessage(from, { text: '❌ No encontré información en Wikipedia.' }, { quoted: m });
                }
            }
            if (command === 'letra' || command === 'lyrics') {
                if (!text) return sock.sendMessage(from, { text: '🎤 Escribe el artista y canción. Ej: *.letra Peso Pluma Ella Baila Sola*' }, { quoted: m });
                try {
                    const res = await 【entity-axios¦canonical_name=axios】.get(`https://lrclib.net/api/search?track_name=${encodeURIComponent(text)}`, { timeout: 15000 });
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
                return sock.sendMessage(from, { text: `👑 *Creador de KRONOS-MD*\n\n• *Nombre:* ${ownerName}\n• *Número:* wa.me/${ownerNum}` }, { quoted: m });
            }
            if (command === 'hora' || command === 'fecha') {
                const now = new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
                return sock.sendMessage(from, { text: `🕐 *Hora México:*\n${now}` }, { quoted: m });
            }
            if (command === 'dato' || command === 'curiosidad') {
                try {
                    const res = await axios.get('https://uselessfacts.jsph.pl/api/v2/facts/random?language=es', { timeout: 10000 });
                    return sock.sendMessage(from, { text: `🤯 *Dato curioso:*\n\n${res.data.text}` }, { quoted: m });
                } catch {
                    return sock.sendMessage(from, { text: '🤯 *Dato curioso:*\n\nLos pulpos tienen 3 corazones.' }, { quoted: m });
                }
            }
            if (command === 'frase') {
                try {
                    const res = await axios.get('https://api.quotable.io/random', { timeout: 10000 });
                    return sock.sendMessage(from, { text: `💭 *"${res.data.content}"*\n— ${res.data.author}` }, { quoted: m });
                } catch {
                    return sock.sendMessage(from, { text: '💭 “No cuentes los días, haz que los días cuenten.”' }, { quoted: m });
                }
            }
            if (command === 'getpp' || command === 'fotoperfil') {
                const target = mentioned || (m.key.participant || sender);
                try {
                    const pp = await sock.profilePictureUrl(target, 'image');
                    return sock.sendMessage(from, { image: { url: pp }, caption: `🖼️ *Foto de perfil de @${String(target).split('@')[0]}*`, mentions: [target] }, { quoted: m });
                } catch {
                    return sock.sendMessage(from, { text: '❌ Esa persona no tiene foto o la tiene privada.' }, { quoted: m });
                }
            }
            if (command === 'id' || command === 'jid') {
                const target = mentioned || (m.key.participant || sender);
                return sock.sendMessage(from, { text: `🆔 *Tu JID / ID:*\n${target}\n\n📦 *Grupo:*\n${from}` }, { quoted: m });
            }
            if (command === 'uptime' || command === 'runtime') {
                const s = Math.floor(process.uptime());
                const h = Math.floor(s / 3600);
                const min = Math.floor((s % 3600) / 60);
                const seg = s % 60;
                return sock.sendMessage(from, { text: `⏱️ *Tiempo activo:*\n${h}h ${min}m ${seg}s` }, { quoted: m });
            }
        } catch (e) {
            console.log('Error buscador:', e?.message);
            await sock.sendMessage(from, { text: '⚠️ Error al procesar el comando.' }, { quoted: m });
        }
    }
};