const fs = require('fs');
const config = require('../config');

module.exports = {
    commands: ['menu', 'help', 'comandos'],
    exec: async ({ sock, m, from, sender }) => {
        const menuText = `
╔══════════════════════╗
   ⚡ *${config.botName}* ⚡
╚══════════════════════╝
👋 Hola @${sender.split('@')}
👑 *Owner:* +52 639 136 6054
⚙️ *Prefijos:* [ . / # ! ]

📥 *DESCARGAS (MULTIMEDIA)*
├ .play <canción>
├ .ytmp3 <link>
├ .ytmp4 <link>
├ .tiktok <link>
├ .ig <link>
├ .fb <link>
└ .imagen <búsqueda>

🛡️ *ADMINISTRACIÓN DE GRUPOS*
├ .kick @usuario
├ .promote @usuario
├ .demote @usuario
├ .grupo abrir / cerrar
├ .hidetag <texto>
├ .tagall
└ .linkgrupo

🎮 *ECONOMÍA Y JUEGOS*
├ .work | .minar | .robar
├ .balance | .top | .shop
├ .ppt <piedra/papel/tijera>
├ .slot | .dado | .math
└ .ship @user1 @user2

🎨 *STICKERS Y HERRAMIENTAS*
├ .s (responder imagen/video)
├ .toimg (sticker a imagen)
├ .ia <pregunta>
├ .traducir <idioma> <texto>
└ .calculadora <operación>

👑 *SOLO OWNER*
├ .bc <mensaje global>
├ .ban @usuario
├ .unban @usuario
└ .restart

_Nota: Los comandos de admin están bloqueados para miembros normales._
`.trim();

        if (fs.existsSync(config.menuImage)) {
            await sock.sendMessage(from, {
                image: fs.readFileSync(config.menuImage),
                caption: menuText,
                mentions: [sender]
            }, { quoted: m });
        } else {
            await sock.sendMessage(from, {
                text: menuText,
                mentions: [sender]
            }, { quoted: m });
        }
    }
};
