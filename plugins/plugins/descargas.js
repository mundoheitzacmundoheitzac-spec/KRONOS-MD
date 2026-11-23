const yts = require('yt-search');
const axios = require('axios');
const config = require('../../config');

const HEADERS = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' };

// Cobalt - es la API más estable ahorita para YouTube
async function cobalt(url, isAudio) {
    try {
        const { data } = await axios.post('https://api.cobalt.tools/api/json', {
            url, downloadMode: isAudio ? 'audio' : 'auto',
            youtubeVideoCodec: 'h264', filenameStyle: 'basic'
        }, { headers: { ...HEADERS, Accept: 'application/json', 'Content-Type': 'application/json' }, timeout: 40000 });
        if (data?.url) return data.url;
        if (data?.status === 'redirect' && data.url) return data.url;
    } catch {}
    return null;
}

async function getYtmp3(url) {
    let u = await cobalt(url, true);
    if (u) return u;
    try {
        const r1 = await axios.get(`https://api.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(url)}`, { headers: HEADERS, timeout: 30000 });
        u = r1.data?.result?.downloadUrl || r1.data?.result?.download?.url || r1.data?.result?.url;
        if (u) return u;
    } catch {}
    try {
        const r2 = await 【entity-axios¦canonical_name=axios】.get(`https://vreden.my.id/api/ytmp3?url=${encodeURIComponent(url)}`, { headers: HEADERS, timeout: 30000 });
        u = r2.data?.result?.download?.url || r2.data?.result?.url;
        if (u) return u;
    } catch {}
    return null;
}

async function getYtmp4(url) {
    let u = await cobalt(url, false);
    if (u) return u;
    try {
        const r1 = await axios.get(`https://api.davidcyriltech.my.id/download/ytmp4?url=${encodeURIComponent(url)}`, { headers: HEADERS, timeout: 40000 });
        u = r1.data?.result?.downloadUrl || r1.data?.result?.download?.url || r1.data?.result?.url;
        if (u) return u;
    } catch {}
    try {
        const r2 = await axios.get(`https://vreden.my.id/api/ytmp4?url=${encodeURIComponent(url)}`, { headers: HEADERS, timeout: 40000 });
        u = r2.data?.result?.download?.url || r2.data?.result?.url;
        if (u) return u;
    } catch {}
    return null;
}

module.exports = {
    commands: ['play', 'musica', 'ytmp3', 'ytmp4', 'video', 'tiktok', 'tt', 'imagen', 'img'],
    exec: async ({ sock, m, from, text, command }) => {
        if (!text) return sock.sendMessage(from, { text: `⚠️ Escribe qué quieres buscar. Ejemplo: *.${command} 【entity-Peso Pluma¦canonical_name=Peso Pluma】*` }, { quoted: m });
        await sock.sendMessage(from, { text: config.mess.wait }, { quoted: m });

        try {
            if (['play', 'musica', 'ytmp3'].includes(command)) {
                const search = await yts(text);
                const video = search.videos[0];
                if (!video) return sock.sendMessage(from, { text: '❌ No encontré resultados.' }, { quoted: m });

                await sock.sendMessage(from, {
                    image: { url: video.thumbnail },
                    caption: `🎵 *KRONOS-MD MUSIC*\n• *Título:* ${video.title}\n• *Duración:* ${video.timestamp}\n• *Canal:* ${video.author.name}\n\n_Descargando audio..._`
                }, { quoted: m });

                const audioUrl = await getYtmp3(video.url);
                if (!audioUrl) return sock.sendMessage(from, { text: '❌ El servidor de audio está saturado, intenta de nuevo en unos segundos.' }, { quoted: m });

                await sock.sendMessage(from, { audio: { url: audioUrl }, mimetype: 'audio/mp4', ptt: false }, { quoted: m });
            }

            else if (['ytmp4', 'video'].includes(command)) {
                const search = await yts(text);
                const video = search.videos[0];
                if (!video) return sock.sendMessage(from, { text: '❌ No encontré el video.' }, { quoted: m });

                const vidUrl = await getYtmp4(video.url);
                if (!vidUrl) return sock.sendMessage(from, { text: '❌ No se pudo descargar el video.' }, { quoted: m });

                await sock.sendMessage(from, { video: { url: vidUrl }, caption: `🎬 *${video.title}*` }, { quoted: m });
            }

            else if (['tiktok', 'tt'].includes(command)) {
                if (!text.includes('tiktok.com') && !text.includes('vm.tiktok')) {
                    return sock.sendMessage(from, { text: '⚠️ Pega el link de TikTok, no el nombre. Ejemplo: *.tiktok https://vm.tiktok.com/...*' }, { quoted: m });
                }
                let videoUrl = null;
                try {
                    const res = await 【entity-axios¦canonical_name=axios】.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(text)}&hd=1`, { headers: HEADERS, timeout: 30000 });
                    videoUrl = res.data?.data?.play || res.data?.data?.wmplay;
                } catch {}
                if (!videoUrl) {
                    try {
                        const res2 = await axios.get(`https://api.davidcyriltech.my.id/download/tiktok?url=${encodeURIComponent(text)}`, { headers: HEADERS, timeout: 30000 });
                        videoUrl = res2.data?.result?.video || res2.data?.result?.downloadUrl;
                    } catch {}
                }
                if (!videoUrl) return sock.sendMessage(from, { text: '❌ Enlace inválido o privado.' }, { quoted: m });

                await sock.sendMessage(from, { video: { url: videoUrl }, caption: `📱 *TikTok - KRONOS-MD*` }, { quoted: m });
            }

            else if (['imagen', 'img'].includes(command)) {
                let imgUrl = null;
                try {
                    const res = await axios.get(`https://api.davidcyriltech.my.id/search/image?query=${encodeURIComponent(text)}`, { headers: HEADERS, timeout: 20000 });
                    imgUrl = res.data?.result?.[0]?.image || res.data?.result?.[0]?.url || (typeof res.data?.result?.[0] === 'string' ? res.data.result[0] : null);
                } catch {}
                // Fallback que sí existe, source.unsplash ya está muerto
                if (!imgUrl) imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(text)}?width=800&height=600&nologo=true`;
                await sock.sendMessage(from, { image: { url: imgUrl }, caption: `🖼️ *${text}*` }, { quoted: m });
            }
        } catch (e) {
            console.error(e);
            await sock.sendMessage(from, { text: '⚠️ Error al procesar la descarga.' }, { quoted: m });
        }
    }
};