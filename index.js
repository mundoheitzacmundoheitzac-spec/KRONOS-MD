const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const handler = require('./handler');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

// Cargar todos los plugins automáticamente
global.plugins = new Map();
function loadPlugins() {
    const pluginDir = path.join(__dirname, 'plugins');
    if (!fs.existsSync(pluginDir)) fs.mkdirSync(pluginDir);
    const files = fs.readdirSync(pluginDir).filter(file => file.endsWith('.js'));
    for (const file of files) {
        try {
            delete require.cache[require.resolve(path.join(pluginDir, file))];
            const plugin = require(path.join(pluginDir, file));
            global.plugins.set(file, plugin);
        } catch (e) {
            console.error(`Error cargando plugin ${file}:`, e);
        }
    }
    console.log(`✅ [KRONOS-MD] Se cargaron ${global.plugins.size} módulos de comandos.`);
}

async function startKronos() {
    loadPlugins();
    const { state, saveCreds } = await useMultiFileAuthState('./session_kronos');
    const { version } = await fetchLatestBaileysVersion();

    let usePairingCode = false;
    let phoneNumber = '';

    if (!state.creds.registered) {
        console.clear();
        console.log('====================================');
        console.log('       INICIANDO KRONOS-MD          ');
        console.log('====================================');
        console.log('1. Conectar mediante Código QR');
        console.log('2. Conectar mediante Código de 8 dígitos (Pairing Code)');
        const option = await question('\n👉 Elige una opción (1 o 2): ');

        if (option.trim() === '2') {
            usePairingCode = true;
            phoneNumber = await question('📱 Ingresa tu número de WhatsApp (ej. 526391366054): ');
            phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
        }
    }

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: !usePairingCode,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
        },
        browser: ['Ubuntu', 'Chrome', '20.0.04']
    });

    if (usePairingCode && !sock.authState.creds.registered) {
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(phoneNumber);
                code = code?.match(/.{1,4}/g)?.join('-') || code;
                console.log(`\n🔑 TU CÓDIGO DE VINCULACIÓN DE 8 DÍGITOS ES: ${code}\n`);
            } catch (err) {
                console.error('❌ Error al generar el código:', err);
            }
        }, 3000);
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startKronos();
        } else if (connection === 'open') {
            console.log('\n🚀 ¡KRONOS-MD CONECTADO Y LISTO PARA USARSE!');
        }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message || m.key.fromMe) return;
        await handler(sock, m);
    });
}

startKronos();
