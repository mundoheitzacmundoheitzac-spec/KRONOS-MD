const config = require('./config');
const antilinkMod = require('./plugins/plugins/antilink.js');

module.exports = async (sock, m) => {
    try {
        const from = m.key.remoteJid;
        if (!from || from === 'status@broadcast') return;
        const isGroup = from.endsWith('@g.us');

        const rawSender = m.key.fromMe ? sock.user.id : (isGroup ? (m.key.participant || m.participant) : from);
        if (!rawSender) return;
        const senderNum = rawSender.split(':').shift().split('@').shift().replace(/\D/g, '');

        const msg = m.message.ephemeralMessage?.message || m.message.viewOnceMessage?.message || m.message.viewOnceMessageV2?.message || m.message;
        const body = msg.conversation ||
                     msg.extendedTextMessage?.text ||
                     msg.imageMessage?.caption ||
                     msg.videoMessage?.caption || '';

        const isOwner = m.key.fromMe || config.ownerNumber.some(num => num.replace(/\D/g, '') === senderNum);

        let isAdmin = false;
        let isBotAdmin = false;
        let groupMetadata = null;

        if (isGroup) {
            groupMetadata = await sock.groupMetadata(from);
            const participants = groupMetadata.participants || [];
            const botNum = sock.user.id.split(':').shift().split('@').shift().replace(/\D/g, '');
            const botLid = sock.user.lid ? sock.user.lid.split(':').shift().split('@').shift().replace(/\D/g, '') : '';

            for (const p of participants) {
                const pId = (p.id || '').split(':').shift().split('@').shift().replace(/\D/g, '');
                const pPhone = (p.phoneNumber || '').split(':').shift().split('@').shift().replace(/\D/g, '');
                const adminStatus = (p.admin === 'admin' || p.admin === 'superadmin');

                if ((pId === senderNum || pPhone === senderNum) && adminStatus) isAdmin = true;
                if ((pId === botNum || pPhone === botNum || (botLid && pId === botLid)) && adminStatus) isBotAdmin = true;
            }

            // ANTILINK
            const borrado = await antilinkMod.checkAntilink({ sock, m, from, sender: rawSender, isGroup, isAdmin, isOwner, isBotAdmin });
            if (borrado) return;
        }

        const usedPrefix = config.prefix.find(p => body.startsWith(p));
        if (!usedPrefix) return;

        const args = body.slice(usedPrefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();
        const text = args.join(' ');

        for (const [, plugin] of global.plugins) {
            if (plugin.commands && plugin.commands.includes(command)) {
                if (plugin.owner && !isOwner) return sock.sendMessage(from, { text: config.mess.onlyOwner }, { quoted: m });
                if (plugin.group && !isGroup) return sock.sendMessage(from, { text: config.mess.onlyGroup }, { quoted: m });
                if (plugin.admin && !isAdmin && !isOwner) return sock.sendMessage(from, { text: config.mess.onlyAdmin }, { quoted: m });
                if (plugin.botAdmin && !isBotAdmin) return sock.sendMessage(from, { text: config.mess.botAdmin }, { quoted: m });

                await plugin.exec({ sock, m, from, sender: rawSender, args, text, command, isOwner, isAdmin, isBotAdmin, isGroup, groupMetadata });
                break;
            }
        }
    } catch (err) {
        console.error('Error en handler:', err);
    }
};