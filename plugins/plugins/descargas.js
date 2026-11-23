const yts = require('yt-search');
const axios = require('axios');
const config = require('../config');

module.exports = {
    commands: ['play', 'musica', 'ytmp3', 'ytmp4', 'video', 'tiktok', 'tt', 'imagen', 'img'],
    exec: async ({ sock, m, from, text, command }) => {
        if (!text) return sock.sendMessage(from, { text: `⚠️ Escribe qué quieres buscar. Ejemplo: *.${command} Peso Pluma*` }, { quoted: m });
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
                    const r1 = await axios.get(`https://vreden.my.id{encodeURIComponent(video.url)}`);
                    audioUrl = r1.data?.result?.download?.url;
                } catch {}

                if (!audioUrl) {
                    const r2 = await axios.get(`https://agatz.xyz{encodeURIComponent(video.url)}`);
                    audioUrl = r2.data?.data?.downloadUrl;
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
                    const r1 = await axios.get(`https://vreden.my.id{encodeURIComponent(video.url)}`);
                    vidUrl = r1.data?.result?.download?.url;
                } catch {}

                if (!vidUrl) {
                    const r2 = await axios.get(`https://agatz.xyz{encodeURIComponent(video.url)}`);
                    vidUrl = r2.data?.data?.downloadUrl;
                }

                if (!vidUrl) return sock.sendMessage(from, { text: '❌ No se pudo descargar el video.' }, { quoted: m });

                await sock.sendMessage(from, { video: { url: vidUrl }, caption: `🎬 *${video.title}*` }, { quoted: m });
            }

            else if (['tiktok', 'tt'].includes(command)) {
                const res = await axios.get(`https://tikwm.com{encodeURIComponent(text)}`);
                const videoUrl = res.data?.data?.play;
                if (!videoUrl) return sock.sendMessage(from, { text: '❌ Enlace inválido o privado.' }, { quoted: m });

                await sock.sendMessage(from, { video: { url: videoUrl }, caption: `📱 *TikTok - KRONOS-MD*` }, { quoted: m });
            }

            else if (['imagen', 'img'].includes(command)) {
                const bing = await axios.get(`https://bing.com{encodeURIComponent(text)}`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
                const matches = [...bing.data.matchAll(/murl&quot;:&quot;(https?:\/\/[^&]+)&quot;/g)];
                if (!matches.length) return sock.sendMessage(from, { text: '❌ No encontré imágenes.' }, { quoted: m });

                const randomMatch = matches[Math.floor(Math.random() * Math.min(matches.length, 10))];
                const randomImg = randomMatch.pop();
                await sock.sendMessage(from, { image: { url: randomImg }, caption: `🖼️ *${text}*` }, { quoted: m });
            }
        } catch (e) {
            console.error(e);
            await sock.sendMessage(from, { text: '⚠️ Error al procesar la descarga.' }, { quoted: m });
        }
    }
};
