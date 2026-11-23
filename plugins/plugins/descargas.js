const yts = require('yt-search');
const ytdl = require('ytdl-core');
const axios = require('axios');
const fs = require('fs');
const config = require('../config');

module.exports = {
    commands: ['play', 'musica', 'ytmp3', 'ytmp4', 'video', 'tiktok', 'tt', 'ig', 'instagram', 'fb', 'facebook', 'imagen', 'img'],
    exec: async ({ sock, m, from, text, command }) => {
        if (!text) return sock.sendMessage(from, { text: `⚠️ Escribe el nombre o enlace. Ejemplo: *.${command} Bad Bunny*` }, { quoted: m });

        await sock.sendMessage(from, { text: config.mess.wait }, { quoted: m });

        try {
            // 1. BÚSQUEDA Y DESCARGA DE AUDIO DE YOUTUBE
            if (command === 'play' || command === 'musica' || command === 'ytmp3') {
                const search = await yts(text);
                const video = search.videos;
                if (!video) return sock.sendMessage(from, { text: '❌ No encontré resultados.' });

                const infoMsg = `🎵 *KRONOS-MD MUSIC*\n• *Título:* ${video.title}\n• *Duración:* ${video.timestamp}\n• *Canal:* ${video.author.name}\n\n_Enviando audio..._`;
                await sock.sendMessage(from, { image: { url: video.thumbnail }, caption: infoMsg }, { quoted: m });

                const stream = ytdl(video.url, { filter: 'audioonly', quality: 'highestaudio' });
                const filePath = `./temp_${Date.now()}.mp3`;
                const writeStream = fs.createWriteStream(filePath);
                stream.pipe(writeStream);

                writeStream.on('finish', async () => {
                    await sock.sendMessage(from, { audio: fs.readFileSync(filePath), mimetype: 'audio/mp4', ptt: false }, { quoted: m });
                    fs.unlinkSync(filePath);
                });
            }

            // 2. DESCARGA DE VIDEO DE YOUTUBE
            else if (command === 'ytmp4' || command === 'video') {
                const search = await yts(text);
                const video = search.videos;
                if (!video) return sock.sendMessage(from, { text: '❌ No encontré el video.' });

                const stream = ytdl(video.url, { filter: 'audioandvideo', quality: 'lowest' });
                const filePath = `./temp_${Date.now()}.mp4`;
                const writeStream = fs.createWriteStream(filePath);
                stream.pipe(writeStream);

                writeStream.on('finish', async () => {
                    await sock.sendMessage(from, { video: fs.readFileSync(filePath), caption: `🎬 *${video.title}*` }, { quoted: m });
                    fs.unlinkSync(filePath);
                });
            }

            // 3. DESCARGA DE TIKTOK SIN MARCA DE AGUA
            else if (command === 'tiktok' || command === 'tt') {
                const res = await axios.get(`https://tikwm.com{encodeURIComponent(text)}`);
                const videoUrl = res.data?.data?.play;
                if (!videoUrl) return sock.sendMessage(from, { text: '❌ No se pudo descargar el TikTok. Verifica que el enlace sea público.' });

                await sock.sendMessage(from, {
                    video: { url: videoUrl },
                    caption: `📱 *TikTok descargado por KRONOS-MD*\n📝 ${res.data.data.title || ''}`
                }, { quoted: m });
            }

            // 4. INSTAGRAM Y FACEBOOK
            else if (['ig', 'instagram', 'fb', 'facebook'].includes(command)) {
                const res = await axios.get(`https://ryzendesu.vip{encodeURIComponent(text)}`);
                const mediaUrl = res.data?.data?.?.url;
                if (!mediaUrl) return sock.sendMessage(from, { text: '❌ Enlace inválido o privado.' });

                await sock.sendMessage(from, { video: { url: mediaUrl }, caption: '✅ *Descargado por KRONOS-MD*' }, { quoted: m });
            }

            // 5. BUSCADOR DE IMÁGENES
            else if (command === 'imagen' || command === 'img') {
                const bing = await axios.get(`https://bing.com{encodeURIComponent(text)}`, {
                    headers: { 'User-Agent': 'Mozilla/5.0' }
                });
                const matches = [...bing.data.matchAll(/murl&quot;:&quot;(https?:\/\/[^&]+)&quot;/g)];
                if (!matches.length) return sock.sendMessage(from, { text: '❌ No encontré imágenes.' });

                const randomImg = matches[Math.floor(Math.random() * Math.min(matches.length, 10))];
                await sock.sendMessage(from, { image: { url: randomImg }, caption: `🖼️ Resultado para: *${text}*` }, { quoted: m });
            }
        } catch (e) {
            console.error(e);
            await sock.sendMessage(from, { text: '⚠️ Ocurrió un error al procesar la descarga. Intenta con otro enlace.' }, { quoted: m });
        }
    }
};
