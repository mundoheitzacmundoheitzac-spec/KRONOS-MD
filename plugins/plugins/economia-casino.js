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
    if (!db.users[id]) db.users[id] = { money: 500, bank: 0, xp: 0, level: 1, lastWork: 0, lastDaily: 0 };
    return db.users[id];
}

module.exports = {
    commands: ['dep', 'depositar', 'retirar', 'robar', 'apostar', 'slot', 'top', 'ranking'],
    exec: async ({ sock, m, from, sender, args, command }) => {
        const db = loadDB();
        const user = getUser(db, sender);
        const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

        if (command === 'dep' || command === 'depositar') {
            const amount = args[0] === 'todo' ? user.money : parseInt(args[0]);
            if (!amount || amount <= 0 || amount > user.money) return sock.sendMessage(from, { text: '⚠️ Cantidad inválida. Ej: *.dep 500* o *.dep todo*' });
            user.money -= amount;
            user.bank += amount;
            saveDB(db);
            return sock.sendMessage(from, { text: `🏦 Depositaste *$${amount}* en el banco.` });
        }

        if (command === 'retirar') {
            const amount = args[0] === 'todo' ? user.bank : parseInt(args[0]);
            if (!amount || amount <= 0 || amount > user.bank) return sock.sendMessage(from, { text: '⚠️ No tienes ese saldo en el banco.' });
            user.bank -= amount;
            user.money += amount;
            saveDB(db);
            return sock.sendMessage(from, { text: `💵 Retiraste *$${amount}* a tu cartera.` });
        }

        if (command === 'robar') {
            if (!mentioned || mentioned === sender) return sock.sendMessage(from, { text: '⚠️ Etiqueta a alguien para robarle.' });
            const victim = getUser(db, mentioned);
            if (victim.money < 100) return sock.sendMessage(from, { text: '😅 No tiene suficiente dinero en cartera.' });
            const stolen = Math.floor(victim.money * 0.3);
            victim.money -= stolen;
            user.money += stolen;
            saveDB(db);
            return sock.sendMessage(from, { text: `🥷 Le robaste *$${stolen}* a @${mentioned.split('@')[0]}`, mentions: [mentioned] });
        }

        if (command === 'apostar') {
            const amount = parseInt(args[0]);
            if (!amount || amount <= 0 || amount > user.money) return sock.sendMessage(from, { text: '⚠️ Indica cuánto apostar. Ej: *.apostar 200*' });
            if (Math.random() < 0.5) {
                user.money += amount;
                saveDB(db);
                return sock.sendMessage(from, { text: `🎲 ¡GANASTE! Ganaste *$${amount}*.` });
            } else {
                user.money -= amount;
                saveDB(db);
                return sock.sendMessage(from, { text: `📉 Perdiste *$${amount}*.` });
            }
        }

        if (command === 'slot') {
            const icons = ['🍒', '🍋', '🍇', '💎', '7️⃣'];
            const a = icons[Math.floor(Math.random() * 5)], b = icons[Math.floor(Math.random() * 5)], c = icons[Math.floor(Math.random() * 5)];
            const win = (a === b && b === c) ? 1000 : (a === b || b === c || a === c) ? 250 : -100;
            user.money = Math.max(0, user.money + win);
            saveDB(db);
            return sock.sendMessage(from, { text: `🎰 [ ${a} | ${b} | ${c} ]\n${win > 0 ? `🎉 Ganaste *$${win}*` : '❌ Perdiste *$100*'}` });
        }

        if (command === 'top' || command === 'ranking') {
            const sorted = Object.entries(db.users).sort(([, a], [, b]) => (b.money + b.bank) - (a.money + a.bank)).slice(0, 10);
            let text = '🏆 *TOP MILLONARIOS KRONOS-MD*\n\n';
            sorted.forEach(([id, data], i) => { text += `${i + 1}. @${id.split('@')[0]} — *$${data.money + data.bank}*\n`; });
            return sock.sendMessage(from, { text, mentions: sorted.map(([id]) => id) });
        }
    }
};
