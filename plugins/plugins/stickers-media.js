const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { exec } = require('child_process');
const fs = require('fs');

module.exports = {
    commands: ['s', 'sticker', 'stiker', 'toimg', 'imgsticker', 'tovideo'],
    exec: async ({ sock, m, from, command }) => {
        try {
            const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const mainMsg = quoted || m.message;
            const msgType = Object.keys(mainMsg)[0];
            const mediaMsg = mainMsg[msgType];

            if (['s', 'sticker', 'stiker'].includes(command)) {
                if (!['imageMessage', 'videoMessage'].includes(msgType)) {
                    return sock.sendMessage(from, { text: '⚠️ Envía o responde a una imagen o video corto (máx. 10 seg) con *.s*' }, { quoted: m });
                }

                const stream = await downloadContentFromMessage(mediaMsg, msgType === 'imageMessage' ? 'image' : 'video');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

                const ext = msgType === 'imageMessage' ? 'jpg' : 'mp4';
                const id = Date.now();
                const inputPath = `./temp_${id}.${ext}`;
                const outputPath = `./temp_${id}.webp`;
                fs.writeFileSync(inputPath, buffer);

                const ffmpegCmd = msgType === 'imageMessage'
                    ? `ffmpeg -y -i ${inputPath} -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:-1:-1:color=white@0.0" -vcodec libwebp -lossless 1 ${outputPath}`
                    : `ffmpeg -y -i ${inputPath} -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:-1:-1:color=white@0.0,fps=15" -t 00:00:08 -vcodec libwebp -loop 0 -preset default -an -vsync 0 ${outputPath}`;

                exec(ffmpegCmd, async (err) => {
                    try { fs.unlinkSync(inputPath); } catch