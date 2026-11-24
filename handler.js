const config = require('./config');
const antilinkMod = require('./plugins/plugins/antilink.js');

module.exports = async (sock, m) => {
    try {
        const from = m.key?.remoteJid;
        if (!from || from === 'status@broadcast' || !m.message) return;
        const isGroup = from.endsWith('@g.us');

        const rawSender = m.key.fromMe ? sock.user.id : (isGroup ? (m.key.participant || m.participant || m.key.participantAlt) : from);
        if (!rawSender) return;
        const senderNum = rawSender.split(':').shift().split('@').shift().replace(/\D/g, '');
        const senderLid = rawSender.split('@')[0].split(':').shift();

        const msg = m.message.ephemeralMessage?.message || m.message.viewOnceMessage?.message || m.message.viewOnceMessageV2?.message || m.message || {};
        const body = msg.conversation ||
                     msg.extendedTextMessage?.text ||
                     msg.imageMessage?.caption ||
                     msg.videoMessage?.caption || '';

        const prefixes = Array.isArray(config.prefix) ? config.prefix : [config.prefix];
        const owners = Array.isArray(config.ownerNumber) ? config.ownerNumber : [config.ownerNumber];
        const isOwner = m.key.fromMe || owners.some(num => String(num).replace(/\D/g, '') === senderNum);

        let isAdmin = false;
        let isBotAdmin = false;
        let groupMetadata = null;

        if (isGroup) {
            try {
                groupMetadata = await sock.groupMetadata(from);
            } catch { groupMetadata = { participants: [] }; }
            const participants = groupMetadata.participants || [];

            // Sacamos TODOS los IDs del bot: numero y LID
            const botIdRaw = String(sock.user.id || '');
            const botNum = botIdRaw.split(':').shift().split('@').shift().replace(/\D/g, '');
            const botLid = sock.user.lid ? String(sock.user.lid).split(':').shift().split('@').shift().replace(/\D/g, '') : '';
            const botJids = [botNum, botLid, botIdRaw.split('@')[0]].filter(Boolean);

            for (const p of participants) {
                const pIdRaw = String(p.id || '');
                const pId = pIdRaw.split(':').shift().split('@').shift().replace(/\D/g, '');
                const pLid = pIdRaw.split('@')[0].split(':').shift();
                const pPhone = (p.phoneNumber || '').split(':').shift().split('@').shift().replace(/\D/g, '');
                // En Baileys nuevo admin viene como 'admin', 'superadmin' o true
                const adminStatus = (p.admin === 'admin' || p.admin === 'superadmin' || p.admin === true || p.isAdmin === true);

                if ((pId === senderNum || pPhone === senderNum || pLid === senderLid) && adminStatus) isAdmin = true;
                if ((botJids.includes(pId) || botJids.includes(pLid) || botJids.includes(pPhone)) && adminStatus) isBotAdmin = true;
            }

            // ANTILINK - se revisa ANTES de los comandos y aunque no tenga prefijo
            // No revisar mensajes del propio bot
            if (!m.key.fromMe) {
                const borrado = await antilinkMod.checkAntilink({ sock, m, from, sender: rawSender, isGroup, isAdmin, isOwner, isBotAdmin });
                if (borrado) return;
            }
        }

        const usedPrefix = prefixes.find(p => p && body.startsWith(p));
        if (!usedPrefix) return;

        const args = body.slice(usedPrefix.length).trim().split(/ +/);
        const command = args.shift()?.toLowerCase();
        if (!command) return;
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