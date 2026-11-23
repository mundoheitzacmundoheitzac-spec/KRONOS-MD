const fs = require('fs');
const warnPath = './warns.json';

function loadWarns() {
    if (!fs.existsSync(warnPath)) fs.writeFileSync(warnPath, JSON.stringify({}, null, 2));
    return JSON.parse(fs.readFileSync(warnPath));
}

function saveWarns(data) {
    fs.writeFileSync(warnPath, JSON.stringify(data, null, 2));
}

module.exports = {
    commands: [
        'warn', 'advertir', 'unwarn', 'quitarwarn', 'warns', 'admins', 'listaadmins',
        'encuesta', 'poll', 'mutear', 'desmutear', 'logo1', 'logo2', 'logo3',
        'neon', 'fuego', 'galaxia', 'estilo', 'fancy', 'sorteo'
    ],
    exec: async ({ sock, m, from, sender, text, command, isGroup, isAdmin, isBotAdmin, isOwner, groupMetadata }) => {
        const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || m.message?.extendedTextMessage?.contextInfo?.participant;

        // 1. LOGOS Y TEXTOS ESTILIZADOS (Para todos)
        if (['logo1', 'logo2', 'logo3', 'neon', 'fuego', 'galaxia'].includes(command)) {
            if (!text) return sock.sendMessage(from, { text: `🎨 Escribe un texto corto. Ej: *.${command} KRONOS*` }, { quoted: m });
            const url = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(text)}&backgroundColor=0f172a,7c3aed,dc2626&size=512`;
            return sock.sendMessage(from, { image: { url }, caption: `✨ *Logo generado para:* ${text}` }, { quoted: m });
        }

        if (command === 'estilo' || command === 'fancy') {
            if (!text) return sock.sendMessage(from, { text: '✍️ Escribe texto. Ej: *.estilo KRONOS-MD*' }, { quoted: m });
            const styled = text.replace(/[a-zA-Z]/g, c => {
                const code = c.charCodeAt(0);
                return String.fromCodePoint(code + (code >= 97 ? 119737 : 119743));
            });
            return sock.sendMessage(from, { text: `✨ ${styled}` }, { quoted: m });
        }

        // 2. COMANDOS DE GRUPO
        if (!isGroup) return sock.sendMessage(from, { text: '👥 Este comando solo funciona en grupos.' }, { quoted: m });

        if (command === 'admins' || command === 'listaadmins') {
            const admins = groupMetadata.participants.filter(p => p.admin);
            let msg = `👑 *ADMINISTRADORES DEL GRUPO*\n\n`;
            admins.forEach(a => { msg += `• @${a.id.split('@')[0]}\n`; });
            return sock.sendMessage(from, { text: msg, mentions: admins.map(a => a.id) }, { quoted: m });
        }

        if (command === 'sorteo') {
            const members = groupMetadata.participants.map(p => p.id);
            const winner = members[Math.floor(Math.random() * members.length)];
            return sock.sendMessage(from, { text: `🎉 *¡GANADOR DEL SORTEO!*\n\n🏆 Felicidades @${winner.split('@')[0]}`, mentions: [winner] }, { quoted: m });
        }

        // 3. SOLO ADMINS DEL GRUPO
        if (!isAdmin && !isOwner) {
            return sock.sendMessage(from, { text: '❌ *Acceso denegado:* Este comando es exclusivo para administradores.' }, { quoted: m });
        }

        if