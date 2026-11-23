const axios = require('axios');

module.exports = {
    commands: [
        'waifu', 'neko', 'shinobu', 'megumin', 'cuddle', 'cry', 'llorar',
        'hug', 'pat', 'acariciar', 'bonk', 'yeet', 'blush', 'sonrojar',
        'smile', 'sonreir', 'wave', 'saludar', 'dance', 'bailar', 'anime', 'buscaranime'
    ],
    exec: async ({ sock, m, from, sender, text, command }) => {
        const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.;

        try {
            if (command === 'anime' || command === 'buscaranime') {
                if (!text) return sock.sendMessage(from, { text: '🎌 Escribe el nombre del anime. Ej: *.anime Naruto*' }, { quoted: m });
                const res = await axios.get(`https://jikan.moe{encodeURIComponent(text)}&limit=1`);
                const data = res.data?.data?.;
                if (!data) return sock.sendMessage(from, { text: '❌ No encontré ese anime.' }, { quoted: m });

                const info = `
🎌 *INFO ANIME - KRONOS-MD*
• *Título:* ${data.title}
• *Episodios:* ${data.episodes || 'En emisión'}
• *Estado:* ${data.status}
• *Puntuación:* ⭐ ${data.score || 'N/A'}
• *Sinopsis:* ${data.synopsis ? data.synopsis.slice(0, 300) + '...' : 'Sin descripción'}
`.trim();
                return sock.sendMessage(from, { image: { url: data.images.jpg.large_image_url }, caption: info }, { quoted: m });
            }

            // Mapeo de comandos en español a endpoints de waifu.pics
            const mapCmd = {
                llorar: 'cry', acariciar: 'pat', sonrojar: 'blush',
                sonreir: 'smile', saludar: 'wave', bailar: 'dance'
            };
            const endpoint = mapCmd[command] || command;

            const res = await axios.get(`https://waifu.pics{endpoint}`);
            const imgUrl = res.data?.url;
            if (!imgUrl) return sock.sendMessage(from, { text: '❌ No se pudo cargar la imagen.' }, { quoted: m });

            const caption = mentioned
                ? `✨ @${sender.split('@')} usó *${command}* con @${mentioned.split('@')}`
                : `🌸 *${command.toUpperCase()}* — KRONOS-MD`;

            await sock.sendMessage(from, {
                image: { url: imgUrl },
                caption,
                mentions: mentioned ? [sender, mentioned] : [sender]
            }, { quoted: m });

        } catch (e) {
            return sock.sendMessage(from, { text: '⚠️ Error al conectar con el servidor de anime.' }, { quoted: m });
        }
    }
};
