module.exports = {
    commands: ['bc', 'broadcast', 'comunicado', 'restart', 'reiniciar', 'salir', 'leave', 'eval'],
    owner: true,
    exec: async ({ sock, m, from, text, command }) => {
        switch (command) {
            case 'bc':
            case 'broadcast':
            case 'comunicado': {
                if (!text) return sock.sendMessage(from, { text: '⚠️ Escribe el mensaje que quieres enviar a todos los grupos.' });
                const chats = await sock.groupFetchAllParticipating();
                const groups = Object.keys(chats);
                await sock.sendMessage(from, { text: `📢 Enviando comunicado a *${groups.length}* grupos...` });

                for (let id of groups) {
                    await sock.sendMessage(id, { text: `👑 *COMUNICADO OFICIAL DE KRONOS-MD*\n\n${text}` });
                }
                await sock.sendMessage(from, { text: '✅ Comunicado enviado con éxito.' });
                break;
            }

            case 'salir':
            case 'leave': {
                if (!from.endsWith('@g.us')) return;
                await sock.sendMessage(from, { text: '👋 Mi creador ordenó que me retire. ¡Hasta luego!' });
                await sock.groupLeave(from);
                break;
            }

            case 'restart':
            case 'reiniciar': {
                await sock.sendMessage(from, { text: '🔄 Reiniciando sistema *KRONOS-MD*...' });
                process.exit(0);
                break;
            }

            case 'eval': {
                if (!text) return;
                try {
                    let evaled = await eval(text);
                    if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);
                    await sock.sendMessage(from, { text: evaled });
                } catch (err) {
                    await sock.sendMessage(from, { text: String(err) });
                }
                break;
            }
        }
    }
};
