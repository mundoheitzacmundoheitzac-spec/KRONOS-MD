module.exports = {
    commands: [
        'ppt', 'dado', 'moneda', 'caraocruz', 'ship', 'amor', 'love',
        '8ball', 'pregunta', 'verdad', 'reto', 'chiste', 'piropo',
        'gay', 'facha', 'inteligente', 'suerte', 'abrazo', 'beso', 'golpe'
    ],
    exec: async ({ sock, m, from, sender, args, text, command }) => {
        const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        const target = mentioned || sender;

        if (command === 'ppt') {
            const opciones = ['piedra', 'papel', 'tijera'];
            const userChoice = args?.toLowerCase();
            if (!opciones.includes(userChoice)) return sock.sendMessage(from, { text: '🎮 Usa: *.ppt piedra*, *.ppt papel* o *.ppt tijera*' }, { quoted: m });
            const botChoice = opciones[Math.floor(Math.random() * 3)];
            let res = '🤝 ¡Empate!';
            if ((userChoice === 'piedra' && botChoice === 'tijera') ||
                (userChoice === 'papel' && botChoice === 'piedra') ||
                (userChoice === 'tijera' && botChoice === 'papel')) res = '🎉 ¡Ganaste!';
            else if (userChoice !== botChoice) res = '💀 ¡Perdiste!';
            return sock.sendMessage(from, { text: `Tú: *${userChoice}*\nKRONOS-MD: *${botChoice}*\n\n${res}` }, { quoted: m });
        }

        if (command === 'dado') {
            const num = Math.floor(Math.random() * 6) + 1;
            return sock.sendMessage(from, { text: `🎲 Tiraste el dado y cayó en: *${num}*` }, { quoted: m });
        }

        if (command === 'moneda' || command === 'caraocruz') {
            const lado = Math.random() < 0.5 ? '🪙 Cara' : '🦅 Cruz';
            return sock.sendMessage(from, { text: `Lanzaste la moneda y salió: *${lado}*` }, { quoted: m });
        }

        if (command === 'ship' || command === 'amor' || command === 'love') {
            const p1 = mentioned || sender;
            const p2 = mentioned || (mentioned ? sender : null);
            if (!p2) return sock.sendMessage(from, { text: '💘 Etiqueta a una o dos personas. Ej: *.ship @usuario*' }, { quoted: m });
            const pct = Math.floor(Math.random() * 101);
            return sock.sendMessage(from, { text: `💖 *COMPATIBILIDAD*\n@${p1.split('@')} ❤️ @${p2.split('@')}\n\n📊 Resultado: *${pct}%*`, mentions: [p1, p2] }, { quoted: m });
        }

        if (command === '8ball' || command === 'pregunta') {
            if (!text) return sock.sendMessage(from, { text: '🎱 Hazme una pregunta. Ej: *.8ball ¿Hoy me va a ir bien?*' }, { quoted: m });
            const resp = ['Sí, totalmente.', 'No cuentes con ello.', 'Definitivamente sí.', 'Pregunta más tarde.', 'Sin duda alguna.', 'Muy dudoso.'];
            return sock.sendMessage(from, { text: `🎱 *Pregunta:* ${text}\n🔮 *Respuesta:* ${resp[Math.floor(Math.random() * resp.length)]}` }, { quoted: m });
        }

        if (command === 'verdad') {
            const verdades = ['¿Cuál es tu mayor secreto?', '¿Quién te gusta de este grupo?', '¿Cuál fue tu peor oso en público?', '¿Alguna vez revisaste un celular ajeno?'];
            return sock.sendMessage(from, { text: `🤔 *VERDAD:* ${verdades[Math.floor(Math.random() * verdades.length)]}` }, { quoted: m });
        }

        if (command === 'reto') {
            const retos = ['Manda un audio cantando el coro de una canción.', 'Pon de foto de perfil lo que el grupo elija por 1 hora.', 'Declárate a la tercera persona de tus chats.', 'Manda una selfie haciendo mueca.'];
            return sock.sendMessage(from, { text: `🔥 *RETO:* ${retos[Math.floor(Math.random() * retos.length)]}` }, { quoted: m });
        }

        if (command === 'chiste') {
            const chistes = ['¿Qué hace una abeja en el gimnasio? ¡Zum-ba!', '¿Cuál es el último animal que subió al arca de Noé? El del-fín.', '¿Qué le dice un techo a otro? Techo de menos.'];
            return sock.sendMessage(from, { text: `😂 ${chistes[Math.floor(Math.random() * chistes.length)]}` }, { quoted: m });
        }

        if (command === 'piropo') {
            const piropos = ['Si fuera juez te condenaría a cadena perpetua… pero en mi corazón.', '¿Acaba de salir el sol o me sonreíste?', 'No eres Google, pero tienes todo lo que busco.'];
            return sock.sendMessage(from, { text: `🌹 ${piropos[Math.floor(Math.random() * piropos.length)]}` }, { quoted: m });
        }

        if (['gay', 'facha', 'inteligente', 'suerte'].includes(command)) {
            const pct = Math.floor(Math.random() * 101);
            return sock.sendMessage(from, { text: `📊 El nivel de *${command.toUpperCase()}* de @${target.split('@')} es del *${pct}%*`, mentions: [target] }, { quoted: m });
        }

        if (['abrazo', 'beso', 'golpe'].includes(command)) {
            if (!mentioned) return sock.sendMessage(from, { text: `⚠️ Etiqueta a alguien. Ej: *.${command} @usuario*` }, { quoted: m });
            const accion = command === 'abrazo' ? 'le dio un fuerte abrazo a' : command === 'beso' ? 'le plantó un beso a' : 'le soltó un zape a';
            return sock.sendMessage(from, { text: `✨ @${sender.split('@')} ${accion} @${mentioned.split('@')}`, mentions: [sender, mentioned] }, { quoted: m });
        }
    }
};
