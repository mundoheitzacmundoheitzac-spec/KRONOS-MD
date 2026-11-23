const yts = require('yt-search');
const axios = require('axios');
const config = require('../config');

module.exports = {
    commands: ['play', 'musica', 'ytmp3', 'ytmp4', 'video', 'tiktok', 'tt', 'imagen', 'img'],
    exec: async ({ sock, m, from, text, command }) => {
        if (!text) return sock.sendMessage(from, { text: `⚠️ Escribe qué quieres buscar. Ejemplo: *.${command} 【entity-Peso Pluma¦canonical_name=Peso Pluma】*` }, { quoted: m });
        await sock.sendMessage(from, { text: config.mess.wait }, { quoted: m });

        try {
            if (['play', 'musica', 'ytmp3'].includes(command)) {
                const search = await yts(text);
                const video = search.videos.shift();
                if (!video) return sock.sendMessage(from, { text: '❌ No encontré resultados.' }, { quoted: m });

                await sock.sendMessage(from, {
                    image: { url: video.thumbnail },
                    caption: `🎵 *KRONOS-MD MUSIC*\n• *Título:* ${video.title}\n• *Duración:* ${video.timestamp}\n• *Canal:* ${video.author.name}\n\n_Descargando audio..._`
                }, { quoted: m });

                let audioUrl = null;
                try {
                    const r1 = await axios.get(`https://api.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(video.url)}`, { timeout: 30000 });
                    audioUrl = r1.data?.result?.downloadUrl || r1.data?.result?.download?.url;
                } catch {}

                if (!audioUrl) {
                    try {
                        const r2 = await axios.get(`https://vreden.my.id/api/ytmp3?url=${encodeURIComponent(video.url)}`, { timeout: 30000 });
                        audioUrl = r2.data?.result?.download?.url || r2.data?.result?.url;
                    } catch {}
                }

                if (!audioUrl) return sock.sendMessage(from, { text: '❌ El servidor de audio está saturado, intenta de nuevo en unos segundos.' }, { quoted: m });

                await sock.sendMessage(from, { audio: { url: audioUrl }, mimetype: 'audio/mp4', ptt: false }, { quoted: m });
            }

            else if (['ytmp4', 'video'].includes(command)) {
                const search = await yts(text);
                const video = search.videos.shift();
                if (!video) return sock.sendMessage(from, { text: '❌ No encontré el video.' }, { quoted: m });

                let vidUrl = null;
                try {
                    const r1 = await axios.get(`https://api.davidcyriltech.my.id/download/ytmp4?url=${encodeURIComponent(video.url)}`, { timeout: 40000 });
                    vidUrl = r1.data?.result?.downloadUrl || r1.data?.result?.download?.url;
                } catch {}

                if (!vidUrl) {
                    try {
                        const r2 = await axios.get(`https://vreden.my.id/api/ytmp4?url=${encodeURIComponent(video.url)}`, { timeout: 40000 });
                        vidUrl = r2.data?.result?.download?.url || r2.data?.result?.url;
                    } catch {}
                }

                if (!vidUrl) return sock.sendMessage(from, { text: '❌ No se pudo descargar el video.' }, { quoted: m });

                await sock.sendMessage(from, { video: { url: vidUrl }, caption: `🎬 *${video.title}*` }, { quoted: m });
            }

            else if (['tiktok', 'tt'].includes(command)) {
                let videoUrl = null;
                try {
                    const res = await axios.get(`https://api.davidcyriltech.my.id/download/tiktok?url=${encodeURIComponent(text)}`, { timeout: 30000 });
                    videoUrl = res.data?.result?.video || res.data?.result?.downloadUrl;
                } catch {}
                if (!videoUrl) {
                    try {
                        const res2 = await axios.get(`https://tikwm.com/api/?url=${encodeURIComponent(text)}`, { timeout: 30000 });
                        videoUrl = res2.data?.data?.play;
                    } catch {}
                }
                if (!videoUrl) return sock.sendMessage(from, { text: '❌ Enlace inválido o privado.' }, { quoted: m });

                await sock.sendMessage(from, { video: { url: videoUrl }, caption: `📱 *TikTok - KRONOS-MD*` }, { quoted: m });
            }

            else if (['imagen', 'img'].includes(command)) {
                try {
                    const res = await axios.get(`https://api.davidcyriltech.my.id/search/image?query=${encodeURIComponent(text)}`, { timeout: 20000 });
                    const imgUrl = res.data?.result?.[0]?.image || res.data?.result?.[0];
                    if (!imgUrl) throw new Error('no img');
                    await sock.sendMessage(from, { image: { url: imgUrl }, caption: `🖼️ *${text}*` }, { quoted: m });
                } catch {
                    const fallback = `https://source.unsplash.com/800x600/?${encodeURIComponent(text)}`;
                    await sock.sendMessage(from, { image: { url: fallback }, caption: `🖼️ *${text}*` }, { quoted: m });
                }
            }
        } catch (e) {
            console.error(e);
            await sock.sendMessage(from, { text: '⚠️ Error al procesar la descarga.' }, { quoted: m });
        }
    }
};