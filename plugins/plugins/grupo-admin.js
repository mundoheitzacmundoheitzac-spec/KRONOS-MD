module.exports = {
    commands: [
        'kick', 'ban', 'echar', 'promote', 'daradmin', 'demote', 'quitaradmin',
        'grupo', 'group', 'hidetag', 'totag', 'tagall', 'invocar', 'todos',
        'link', 'linkgrupo', 'revoke', 'restablecer', 'setname', 'setdesc', 'infogrupo'
    ],
    group: true,
    admin: true,
    botAdmin: true,
    exec: async ({ sock, m, from, args, text, command, groupMetadata }) => {
        const participants = groupMetadata.participants;
        const ctx = m.message?.extendedTextMessage?.contextInfo;
        const mentioned = (ctx?.mentionedJid && ctx.mentionedJid.length > 0) ? ctx.mentionedJid.shift() : ctx?.participant;

        switch (command) {
            case 'kick':
            case 'ban':
            case 'echar': {
                if (!mentioned) return sock.sendMessage(from, { text: '⚠️ Etiqueta o responde al mensaje del usuario que quieres eliminar.' }, { quoted: m });
                await sock.groupParticipantsUpdate(from, [mentioned], 'remove');
                await sock.sendMessage(from, { text: `✅ Usuario @${mentioned.split('@').shift()} eliminado del grupo.`, mentions: [mentioned] });
                break;
            }

            case 'promote':
            case 'daradmin': {
                if (!mentioned) return sock.sendMessage(from, { text: '⚠️ Etiqueta o responde a quien le darás admin.' }, { quoted: m });
                await sock.groupParticipantsUpdate(from, [mentioned], 'promote');
                await sock.sendMessage(from, { text: `👑 @${mentioned.split('@').shift()} ahora es administrador.`, mentions: [mentioned] });
                break;
            }

            case 'demote':
            case 'quitaradmin': {
                if (!mentioned) return sock.sendMessage(from, { text: '⚠️ Etiqueta o responde al admin que vas a degradar.' }, { quoted: m });
                await sock.groupParticipantsUpdate(from, [mentioned], 'demote');
                await sock.sendMessage(from, { text: `📉 Se le quitó el admin a @${mentioned.split('@').shift()}.`, mentions: [mentioned] });
                break;
            }

            case 'grupo':
            case 'group': {
                const sub = (args.shift() || '').toLowerCase();
                if (sub === 'abrir' || sub === 'open') {
                    await sock.groupSettingUpdate(from, 'not_announcement');
                    await sock.sendMessage(from, { text: '🔓 *Grupo abierto.* Todos pueden enviar mensajes.' });
                } else if (sub === 'cerrar' || sub === 'close') {
                    await sock.groupSettingUpdate(from, 'announcement');
                    await sock.sendMessage(from, { text: '🔒 *Grupo cerrado.* Solo los administradores pueden escribir.' });
                } else {
                    await sock.sendMessage(from, { text: '⚙️ Usa: *.grupo abrir* o *.grupo cerrar*' });
                }
                break;
            }

            case 'hidetag':
            case 'totag': {
                const msg = text || '📢 Atención a todos';
                await sock.sendMessage(from, { text: msg, mentions: participants.map(u => u.id) });
                break;
            }

            case 'tagall':
            case 'invocar':
            case 'todos': {
                let teks = `📢 *INVOCACIÓN GENERAL - KRONOS-MD*\n\n*Mensaje:* ${text || 'Sin mensaje'}\n\n`;
                for (let mem of participants) {
                    teks += `🔸 @${mem.id.split('@').shift()}\n`;
                }
                await sock.sendMessage(from, { text: teks, mentions: participants.map(a => a.id) });
                break;
            }

            case 'link':
            case 'linkgrupo': {
                const code = await sock.groupInviteCode(from);
                await sock.sendMessage(from, { text: `🔗 *Enlace del grupo:*\nhttps://whatsapp.com{code}` }, { quoted: m });
                break;
            }

            case 'revoke':
            case 'restablecer': {
                await sock.groupRevokeInvite(from);
                await sock.sendMessage(from, { text: '🔄 El enlace del grupo ha sido restablecido con éxito.' }, { quoted: m });
                break;
            }

            case 'setname': {
                if (!text) return sock.sendMessage(from, { text: '⚠️ Escribe el nuevo nombre del grupo.' });
                await sock.groupUpdateSubject(from, text);
                await sock.sendMessage(from, { text: `✅ Nombre cambiado a: *${text}*` });
                break;
            }

            case 'setdesc': {
                if (!text) return sock.sendMessage(from, { text: '⚠️ Escribe la nueva descripción del grupo.' });
                await sock.groupUpdateDescription(from, text);
                await sock.sendMessage(from, { text: '✅ Descripción actualizada correctamente.' });
                break;
            }

            case 'infogrupo': {
                const info = `📋 *INFO DEL GRUPO*\n• *Nombre:* ${groupMetadata.subject}\n• *Miembros:* ${participants.length}\n• *Descripción:* ${groupMetadata.desc || 'Sin descripción'}`;
                await sock.sendMessage(from, { text: info }, { quoted: m });
                break;
            }
        }
    }
};
