const axios = require('axios');

module.exports = {
    commands: [
        'ia', 'ai', 'chatgpt', 'gpt', 'traducir', 'translate', 'calc', 'calculadora',
        'qr', 'codigoqr', 'acortar', 'tinyurl', 'clima', 'weather', 'pass', 'password',
        'invertir', 'reverse', 'binario', 'debinario', 'contar', 'mayus'
    ],
    exec: async ({ sock, m, from, args, text, command }) => {
        try {
            if (['ia', 'ai', 'chatgpt', 'gpt'].includes(command)) {
                if (!text) return sock.sendMessage(from, { text: '🤖 Escribe tu pregunta. Ej: *.ia Explícame qué es un agujero negro*' }, { quoted: m });
                const res = await axios.get(`https://pollinations.ai{encodeURIComponent(text)}`);
                return sock.sendMessage(from, { text: `🧠 *KRONOS-MD IA:*\n\n${res.data}` }, { quoted: m });
            }

            if (command === 'traducir' || command === 'translate') {
                const lang = args;
                const query = args.slice(1).join(' ');
                if (!lang || !query) return sock.sendMessage(from, { text: '🌐 Uso: *.traducir en Hola mundo* (en=inglés, es=español, pt=portugués, fr=francés)' }, { quoted: m });
                const res = await axios.get(`https://translated.net{encodeURIComponent(query)}&langpair=autodetect|${lang}`);
                const translated = res.data?.responseData?.translatedText || 'No se pudo traducir.';
                return sock.sendMessage(from, { text: `🌐 *Traducción (${lang}):*\n${translated}` }, { quoted: m });
            }

            if (command === 'calc' || command === 'calculadora') {
                if (!text) return sock.sendMessage(from, { text: '🧮 Ejemplo: *.calc 25 * 4 + 10*' }, { quoted: m });
                const clean = text.replace(/[^0-9+\-*/().]/g, '');
                const result = Function(`"use strict"; return (${clean})`)();
                return sock.sendMessage(from, { text: `🧮 *Resultado:* ${result}` }, { quoted: m });
            }

            if (command === 'qr' || command === 'codigoqr') {
                if (!text) return sock.sendMessage(from, { text: '📱 Escribe el texto o enlace para el QR. Ej: *.qr https://google.com*' }, { quoted: m });
                const qrUrl = `https://qrserver.com{encodeURIComponent(text)}`;
                return sock.sendMessage(from, { image: { url: qrUrl }, caption: `✅ *Código QR generado por KRONOS-MD*` }, { quoted: m });
            }

            if (command === 'acortar' || command === 'tinyurl') {
                if (!text) return sock.sendMessage(from, { text: '🔗 Pega el enlace largo. Ej: *.acortar https://...*' }, { quoted: m });
                const res = await axios.get(`https://tinyurl.com{encodeURIComponent(text)}`);
                return sock.sendMessage(from, { text: `🔗 *Enlace acortado:*\n${res.data}` }, { quoted: m });
            }

            if (command === 'clima' || command === 'weather') {
                if (!text) return sock.sendMessage(from, { text: '🌤️ Escribe una ciudad. Ej: *.clima Chihuahua*' }, { quoted: m });
                const res = await axios.get(`https://wttr.in{encodeURIComponent(text)}?format=3`);
                return sock.sendMessage(from, { text: `🌍 *Clima actual:* ${res.data}` }, { quoted: m });
            }

            if (command === 'pass' || command === 'password') {
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';
                let pass = '';
                for (let i = 0; i < 14; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
                return sock.sendMessage(from, { text: `🔐 *Contraseña segura generada:*\n\`${pass}\`` }, { quoted: m });
            }

            if (command === 'invertir' || command === 'reverse') {
                if (!text) return sock.sendMessage(from, { text: '🔄 Escribe un texto para invertirlo.' }, { quoted: m });
                return sock.sendMessage(from, { text: text.split('').reverse().join('') }, { quoted: m });
            }

            if (command === 'binario') {
                if (!text) return sock.sendMessage(from, { text: '💻 Escribe texto para pasar a binario.' }, { quoted: m });
                const bin = text.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
                return sock.sendMessage(from, { text: bin }, { quoted: m });
            }

            if (command === 'debinario') {
                if (!text) return sock.sendMessage(from, { text: '💻 Pega código binario para leerlo.' }, { quoted: m });
                const str = text.split(' ').map(b => String.fromCharCode(parseInt(b, 2))).join('');
                return sock.sendMessage(from, { text: str }, { quoted: m });
            }

            if (command === 'contar') {
                if (!text) return sock.sendMessage(from, { text: '📝 Escribe un texto.' }, { quoted: m });
                return sock.sendMessage(from, { text: `📊 Caracteres: *${text.length}* | Palabras: *${text.trim().split(/\s+/).length}*` }, { quoted: m });
            }

            if (command === 'mayus') {
                if (!text) return sock.sendMessage(from, { text: '🔠 Escribe un texto.' }, { quoted: m });
                return sock.sendMessage(from, { text: text.toUpperCase() }, { quoted: m });
            }
        } catch (e) {
            return sock.sendMessage(from, { text: '⚠️ Error al ejecutar la herramienta. Intenta de nuevo.' }, { quoted: m });
        }
    }
};
