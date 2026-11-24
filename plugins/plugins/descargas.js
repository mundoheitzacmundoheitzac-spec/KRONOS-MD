const yts = require('yt-search');
const axios = require('axios');
const config = require('../../config');

const HEADERS = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' };

// Baja la URL a buffer para que 【entity-WhatsApp¦canonical_name=WhatsApp】 sí lo acepte
async function urlToBuffer(url) {
    const res = await axios.get(url, { headers: HEADERS, responseType: 'arraybuffer', timeout: 60000, maxContentLength: 100 * 1024 * 1024 });
    return Buffer.from(res.data);
}

async function getYtmp3(url) {
    // 1. Intento David
    try {
        const r1 = await axios.get(`https://api.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(url)}`, { headers: HEADERS, timeout: 30000 });
        const u = r1.data?.result?.downloadUrl || r1.data?.result?.download?.url || r1.data?.result?.url || r1.data?.downloadUrl;
        if (u) return u;
    } catch (e) { console.log('ytmp3 david falló:', e.message) }
    // 2. Intento Vreden
    try {
        const r2 = await axios.get(`https://vreden.my.id/api/ytmp3?url=${encodeURIComponent(url)}`, { headers: HEADERS, timeout: 30000 });
        const u = r2.data?.result?.download?.url || r2.data?.result?.url || r2.data?.download;
        if (u) return u;
    } catch (e) { console.log('ytmp3 vreden falló:', e.message) }
    // 3. Intento SaveTube / Cobalt nueva
    try {
        const r3 = await axios.post('https://api.cobalt.tools/api/json', { url, downloadMode: 'audio', filenameStyle: 'basic' }, { headers: { ...HEADERS, Accept: 'application/json', 'Content-Type': 'application/json' }, timeout: 40000 });
        if (r3.data?.url) return r3.data.url;
    } catch {}
    return null;
}

async function getYtmp4(url) {
    try {
        const r1 = await axios.get(`https://api.davidcyriltech.my.id/download/ytmp4?url=${encodeURIComponent(url)}`, { headers: HEADERS, timeout: 40000 });
        const u = r1.data?.result?.downloadUrl || r1.data?.result?.download?.url || r1.data?.result?.url;
        if (u) return u;
    } catch {}
    try {
        const r2 = await axios.get(`https://vreden.my.id/api/ytmp4?url=${encodeURIComponent(url)}`, { headers: HEADERS, timeout: 40000 });
        const u = r2.data?.result?.download?.url || r2.data?.result?.url;
        if (u) return u;
    } catch {}
    return null;
}

module.exports = {
    commands: ['play', 'musica', 'ytmp3', 'ytmp4', 'video', 'tiktok', 'tt', 'imagen', 'img'],
    exec: async ({ sock, m, from, text, command }) => {
        if (!text) return sock.sendMessage(from, { text: `⚠️ Escribe qué quieres buscar. Ejemplo: *.${command} Peso Pluma*` }, { quoted: m });
        await sock.sendMessage(from, { text: config.mess.wait }, { quoted: m });

        try {
            if (['play', 'musica', 'ytmp3'].includes(command)) {
                let videoUrl = text;
                let video = null;
                // Si es link directo, no buscar
                if (!text.includes('youtube.com') && !text.includes('youtu.be')) {
                    const search = await yts(text);
                    video = search.videos[0];
                    if (!video) return sock.sendMessage(from, { text: '❌ No encontré resultados.' }, { quoted: m });
                    videoUrl = video.url;
                } else {
                    video = { title: 'Audio YouTube', timestamp: '...', author: { name: 'YouTube' }, thumbnail: 'https://i.ytimg.com/vi/' + text.split('v=')[1]?.split('&')[0] + '/hqdefault.jpg' };
                }

                await sock.sendMessage(from, {
                    image: { url: video.thumbnail },
                    caption: `🎵 *KRONOS-MD MUSIC*\n• *Título:* ${video.title}\n• *Duración:* ${video.timestamp}\n• *Canal:* ${video.author.name}\n\n_Descargando audio..._`
                }, { quoted: m });

                const audioUrl = await getYtmp3(videoUrl);
                if (!audioUrl) return sock.sendMessage(from, { text: '❌ El servidor de audio está saturado, intenta de nuevo en unos segundos.' }, { quoted: m });

                // AQUÍ ESTÁ EL ARREGLO: mandamos buffer, no URL
                const buffer = await urlToBuffer(audioUrl);
                await sock.sendMessage(from, { audio: buffer, mimetype: 'audio/mpeg', fileName: `${video.title}.mp3`, ptt: false }, { quoted: m });
            }

            else if (['ytmp4', 'video'].includes(command)) {
                const search = await yts(text);
                const video = search.videos[0];
                if (!video) return sock.sendMessage(from, { text: '❌ No encontré el video.' }, { quoted: m });
                const vidUrl = await getYtmp4(video.url);
                if (!vidUrl) return sock.sendMessage(from, { text: '❌ No se pudo descargar el video.' }, { quoted: m });
                const buffer = await urlToBuffer(vidUrl);
                await sock.sendMessage(from, { video: buffer, caption: `🎬 *${video.title}*`, fileName: `${video.title}.mp4` }, { quoted: m });
            }

            else if (['tiktok', 'tt'].includes(command)) {
                if (!text.includes('tiktok.com') && !text.includes('vm.tiktok')) {
                    return sock.sendMessage(from, { text: '⚠️ Pega el link de TikTok, no el nombre.' }, { quoted: m });
                }
                let videoUrl = null;
                try {
                    const res = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(text)}&hd=1`, { headers: HEADERS, timeout: 30000 });
                    videoUrl = res.data?.data?.play || res.data?.data?.wmplay;
                } catch {}
                if (!videoUrl) {
                    try {
                        const res2 = await axios.get(`https://api.davidcyriltech.my.id/download/tiktok?url=${encodeURIComponent(text)}`, { headers: HEADERS, timeout: 30000 });
                        videoUrl = res2.data?.result?.video || res2.data?.result?.downloadUrl;
                    } catch {}
                }
                if (!videoUrl) return sock.sendMessage(from, { text: '❌ Enlace inválido o privado.' }, { quoted: m });
                const buffer = await urlToBuffer(videoUrl);
                await sock.sendMessage(from, { video: buffer, caption: `📱 *TikTok - KRONOS-MD*` }, { quoted: m });
            }

            else if (['imagen', 'img'].includes(command)) {
                let imgUrl = null;
                try {
                    const res = await axios.get(`https://api.davidcyriltech.my.id/search/image?query=${encodeURIComponent(text)}`, { headers: HEADERS, timeout: 20000 });
                    imgUrl = res.data?.result?.[0]?.image || res.data?.result?.[0]?.url || (typeof res.data?.result?.[0] === 'string' ? res.data.result[0] : null);
                } catch {}
                if (!imgUrl) imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(text)}?width=800&height=600&nologo=true`;
                await sock.sendMessage(from, { image: { url: imgUrl }, caption: `🖼️ *${text}*` }, { quoted: m });
            }
        } catch (e) {
            console.error(e);
            await sock.sendMessage(from, { text: '⚠️ Error al procesar la descarga: ' + e.message }, { quoted: m });
        }
    }
};