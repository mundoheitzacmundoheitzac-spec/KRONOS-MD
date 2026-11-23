const config = require('./config');

module.exports = async (sock, m) => {
    try {
        const from = m.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const sender = isGroup ? m.key.participant : m.key.remoteJid;
        const senderNumber = sender.split('@')[0];

        const body = m.message.conversation ||
                     m.message.extendedTextMessage?.text ||
                     m.message.imageMessage?.caption ||
                     m.message.videoMessage?.caption || '';

        const usedPrefix = config.prefix.find(p => body.startsWith(p));
        if (!usedPrefix) return;

        const args = body.slice(usedPrefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();
        const text = args.join(' ');

        // Verificar si es Owner (+52 639 136 6054)
        const isOwner = config.ownerNumber.includes(senderNumber);

        // Verificar permisos dentro de grupos
        let isAdmin = false;
        let isBotAdmin = false;
        let groupMetadata = null;

        if (isGroup) {
            groupMetadata = await sock.groupMetadata(from);
            const participants = groupMetadata.participants;
            const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
            isAdmin = participants.some(p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin'));
            isBotAdmin = participants.some(p => p.id === botId && (p.admin === 'admin' || p.admin === 'superadmin'));
        }

        // Buscar y ejecutar el comando desde la carpeta plugins
        for (const [, plugin] of global.plugins) {
            if (plugin.commands && plugin.commands.includes(command)) {
                
                // Validaciones estrictas de seguridad
                if (plugin.owner && !isOwner) {
                    return sock.sendMessage(from, { text: config.mess.onlyOwner }, { quoted: m });
                }
                if (plugin.group && !isGroup) {
                    return sock.sendMessage(from, { text: config.mess.onlyGroup }, { quoted: m });
                }
                if (plugin.admin && !isAdmin && !isOwner) {
                    return sock.sendMessage(from, { text: config.mess.onlyAdmin }, { quoted: m });
                }
                if (plugin.botAdmin && !isBotAdmin) {
                    return sock.sendMessage(from, { text: config.mess.botAdmin }, { quoted: m });
                }

                // Ejecutar comando
                await plugin.exec({ sock, m, from, sender, args, text, command, isOwner, isAdmin, isBotAdmin, groupMetadata });
                break;
            }
        }
    } catch (err) {
        console.error('Error en handler:', err);
    }
};
