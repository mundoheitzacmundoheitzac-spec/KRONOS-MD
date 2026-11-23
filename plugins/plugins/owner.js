module.exports = {
    commands: ['bc', 'broadcast', 'comunicado', 'restart', 'reiniciar', 'salir', 'leave', 'eval'],
    owner: true,
    exec: async ({ sock, m, from, text, command }) => {
        const sleep = (ms) => new Promise(r => setTimeout(r, ms));

        switch (command) {
            case 'bc':
            case 'broadcast':
            case 'comunicado': {
                if (!text) return sock.sendMessage(from, { text: '⚠️ Escribe el mensaje que quieres enviar a todos los grupos.' }, { quoted: m });
                const chats = await sock.groupFetchAllParticipating();
                const groups = Object.keys(chats);
                await sock.sendMessage(from, { text: `📢 Enviando comunicado a *${groups.length}* grupos...` }, { quoted: m });

                let enviados = 0;
                let fallidos = 0;
                for (let id of groups) {
                    try {
                        await sock.sendMessage(id, { text: `👑 *COMUNICADO OFICIAL DE KRONOS-MD*\n\n${text}` });
                        enviados++;
                        await sleep(1500);
                    } catch {
                        fallidos++;
                    }
                }
                await sock.sendMessage(from, { text: `✅ Comunicado terminado.\n✔️ Enviados: ${enviados}\n❌ Fallidos: ${fallidos}` }, { quoted: m });
                break;
            }

            case 'salir':
            case 'leave': {
                if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: '⚠️ Este comando solo se usa en grupos.' }, { quoted: m });
                await sock.sendMessage(from, { text: '👋 Mi creador ordenó que me retire. ¡Hasta luego!' });
                await sleep(1000);
                await sock.groupLeave(from);
                break;
            }

            case 'restart':
            case 'reiniciar': {
                await sock.sendMessage(from, { text: '🔄 Reiniciando sistema *KRONOS-MD*...' }, { quoted: m });
                setTimeout(() => process.exit(0), 1000);
                break;
            }

            case 'eval': {
                if (!text) return sock.sendMessage(from, { text: '⚠️ Escribe código para evaluar. Ej: *.eval 2+2*' }, { quoted: m });
                try {
                    let evaled = await eval(text);
                    if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);
                    await sock.sendMessage(from, { text: String(evaled).slice(0, 4000) }, { quoted: m });
                } catch (err) {
                    await sock.sendMessage(from, { text: `❌ Error:\n${String(err)}` }, { quoted: m });
                }
                break;
            }
        }
    }
};