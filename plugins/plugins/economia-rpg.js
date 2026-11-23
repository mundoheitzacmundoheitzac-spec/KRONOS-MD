const fs = require('fs');
const dbPath = './database.json';

function loadDB() {
    if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({ users: {} }, null, 2));
    return JSON.parse(fs.readFileSync(dbPath));
}

function saveDB(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

function getUser(db, id) {
    if (!db.users[id]) {
        db.users[id] = { money: 500, bank: 0, xp: 0, level: 1, lastWork: 0, lastDaily: 0 };
    }
    return db.users[id];
}

module.exports = {
    commands: ['work', 'trabajar', 'minar', 'pescar', 'cazar', 'daily', 'bal', 'balance', 'dinero', 'perfil'],
    exec: async ({ sock, m, from, sender, command }) => {
        const db = loadDB();
        const user = getUser(db, sender);
        const now = Date.now();
        const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || m.message?.extendedTextMessage?.contextInfo?.participant;

        if (command === 'work' || command === 'trabajar') {
            const earn = Math.floor(Math.random() * 400) + 150;
            user.money += earn;
            user.xp += 50;
            saveDB(db);
            return sock.sendMessage(from, { text: `💼 Trabajaste duro y ganaste *$${earn} monedas* (+50 XP).` }, { quoted: m });
        }

        if (command === 'minar') {
            const earn = Math.floor(Math.random() * 600) + 100;
            user.money += earn;
            user.xp += 70;
            saveDB(db);
            return sock.sendMessage(from, { text: `⛏️ Fuiste a la mina y sacaste *$${earn} monedas* (+70 XP).` }, { quoted: m });
        }

        if (command === 'pescar') {
            const earn = Math.floor(Math.random() * 450) + 80;
            user.money += earn;
            saveDB(db);
            return sock.sendMessage(from, { text: `🎣 Pescaste y vendiste tu captura por *$${earn} monedas*.` }, { quoted: m });
        }

        if (command === 'cazar') {
            const earn = Math.floor(Math.random() * 500) + 120;
            user.money += earn;
            saveDB(db);
            return sock.sendMessage(from, { text: `🏹 Cazaste una presa y ganaste *$${earn} monedas*.` }, { quoted: m });
        }

        if (command === 'daily') {
            if (now - user.lastDaily < 86400000) {
                return sock.sendMessage(from, { text: '🎁 Ya reclamaste tu recompensa diaria. Vuelve mañana.' }, { quoted: m });
            }
            user.money += 1500;
            user.xp += 200;
            user.lastDaily = now;
            saveDB(db);
            return sock.sendMessage(from, { text: '🎉 *¡RECOMPENSA DIARIA!* Recibiste *$1,500 monedas*.' }, { quoted: m });
        }

        if (['bal', 'balance', 'dinero', 'perfil'].includes(command)) {
            const target = mentioned || sender;
            const tUser = getUser(db, target);
            saveDB(db);
            const info = `💳 *PERFIL - KRONOS-MD*\n👤 @${target.split('@')}\n⭐ Nivel: ${tUser.level} (${tUser.xp} XP)\n💵 Cartera: $${tUser.money}\n🏦 Banco: $${tUser.bank}`;
            return sock.sendMessage(from, { text: info, mentions: [target] }, { quoted: m });
        }
    }
};