const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, 'antilink.json');

function loadConfig() {
    try {
        if (!fs.existsSync(configPath)) {
            fs.writeFileSync(configPath, JSON.stringify({}, null, 2));
        }
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch {
        return {};
    }
}

function saveConfig(data) {
    try {
        fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
    } catch {}
}

module.exports = {
    commands: ['antilink', 'antilinkon', 'antilinkoff'],
    exec: async ({ sock, m, from, text, command, isGroup, isAdmin, isOwner }) => {
        try {
            if (!isGroup) {
                return sock.sendMessage(from, { text: '👥 Solo en grupos.' }, { quoted: m });
            }
            if (!isAdmin && !isOwner) {
                return sock.sendMessage(from, { text: '❌ Solo admins.' }, { quoted: m });
            }

            const cfg = loadConfig();
            const arg = (text || '').toLowerCase().trim();

            if (command === 'antilink') {
                if (arg === 'on' || arg === 'activar' || arg === '1') {
                    cfg[from] = true;
                    saveConfig(cfg);
                    return sock.sendMessage(from, { text: '🔗 *Antilink ACTIVADO.*' }, { quoted: m });
                }
                if (arg === 'off' || arg === 'desactivar' || arg === '0') {
                    cfg[from] = false;
                    saveConfig(cfg);
                    return sock.sendMessage(from, { text: '🔗 *Antilink DESACTIVADO.*' }, { quoted: m });
                }
                const estado = cfg[from] ? '✅ ACTIVADO' : '❌ DESACTIVADO';
                return sock.sendMessage(from, { text: `🔗 Antilink: ${estado}\nUso: *.antilink on* / *.antilink off*` }, { quoted: m });
            }

            if (command === 'antilinkon') {
                cfg[from] = true;
                saveConfig(cfg);
                return sock.sendMessage(from, { text: '🔗 *Antilink ACTIVADO.*' }, { quoted: m });
            }

            if (command === 'antilinkoff') {
                cfg[from] = false;
                saveConfig(cfg);
                return sock.sendMessage(from, { text: '🔗 *Antilink DESACTIVADO.*' }, { quoted: m });
            }
        } catch (e) {
            console.log('Error antilink:', e);
        }
    },

    checkAntilink: async ({ sock, m, from, sender, isGroup, isAdmin, isOwner }) => {
        try {
            if (!isGroup || isAdmin || isOwner) return false;
            const cfg = loadConfig();
            if (!cfg[from]) return false;

            const body = m.message?.conversation || m.message?.extendedTextMessage?.text || m.message?.imageMessage?.caption || m.message?.videoMessage?.caption || '';
            if (!body) return false;

            const tieneLink = /https?:\/\/|www\.|chat\.whatsapp\.com|wa\.me|t\.me|youtube\.com|youtu\.be|tiktok\.com|instagram\.com|discord\.gg/i.test(body);
            if (!tieneLink) return false;

            await sock.sendMessage(from, { delete: m.key });
            await sock.sendMessage(from, { text: `🚫 @${sender.split('@')[0]} Links no permitidos.`, mentions: [sender] });
            return true;
        } catch {
            return false;
        }
    }
};