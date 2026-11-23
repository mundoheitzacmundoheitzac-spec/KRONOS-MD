const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { exec } = require('child_process');
const fs = require('fs');

module.exports = {
    commands: ['s', 'sticker', 'stiker', 'toimg', 'imgsticker', 'tovideo'],
    exec: async ({ sock, m, from, command }) => {
        const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const msgType = Object.keys(quoted || m.message);
        const mediaMsg = quoted ? quoted[msgType] : m.message[msgType];

        if (['s', 'sticker', 'stiker'].includes(command)) {
            if (!['imageMessage', 'videoMessage'].includes(msgType)) {
                return sock.sendMessage(from, { text: '⚠️ Envía o responde a una imagen o video corto (máx. 10 seg) con *.s*' }, { quoted: m });
            }

            const stream = await downloadContentFromMessage(mediaMsg, msgType === 'imageMessage' ? 'image' : 'video');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

            const ext = msgType === 'imageMessage' ? 'jpg' : 'mp4';
            const inputPath = `./temp_${Date.now()}.${ext}`;
            const outputPath = `./temp_${Date.now()}.webp`;
            fs.writeFileSync(inputPath, buffer);

            const ffmpegCmd = msgType === 'imageMessage'
                ? `ffmpeg -i ${inputPath} -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:-1:-1:color=white@0.0" -vcodec libwebp -lossless 1 ${outputPath}`
                : `ffmpeg -i ${inputPath} -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:-1:-1:color=white@0.0,fps=15" -t 00:00:08 -vcodec libwebp -loop 0 -preset default -an -vsync 0 ${outputPath}`;

            exec(ffmpegCmd, async (err) => {
                fs.unlinkSync(inputPath);
                if (err || !fs.existsSync(outputPath)) {
                    return sock.sendMessage(from, { text: '❌ Error al crear el sticker. Verifica que ffmpeg esté instalado.' }, { quoted: m });
                }
                await sock.sendMessage(from, { sticker: fs.readFileSync(outputPath) }, { quoted: m });
                fs.unlinkSync(outputPath);
            });
        }

        if (['toimg', 'imgsticker', 'tovideo'].includes(command)) {
            if (msgType !== 'stickerMessage') {
                return sock.sendMessage(from, { text: '⚠️ Responde a un sticker con *.toimg*' }, { quoted: m });
            }

            const stream = await downloadContentFromMessage(mediaMsg, 'sticker');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

            const inputPath = `./temp_${Date.now()}.webp`;
            const outputPath = `./temp_${Date.now()}.png`;
            fs.writeFileSync(inputPath, buffer);

            exec(`ffmpeg -i ${inputPath} ${outputPath}`, async (err) => {
                fs.unlinkSync(inputPath);
                if (err || !fs.existsSync(outputPath)) {
                    return sock.sendMessage(from, { text: '❌ No se pudo convertir el sticker.' }, { quoted: m });
                }
                await sock.sendMessage(from, { image: fs.readFileSync(outputPath), caption: '✅ *Convertido por KRONOS-MD*' }, { quoted: m });
                fs.unlinkSync(outputPath);
            });
        }
    }
};
