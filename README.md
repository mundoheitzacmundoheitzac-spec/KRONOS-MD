# ⚡ KRONOS-MD ⚡

Bot de WhatsApp con más de 180 comandos reales, conexión por Código QR o Código de 8 dígitos (Pairing Code).
👑 Owner: +52 639 136 6054

## 📲 Instalación en Termux (Paso a Paso)

### 1. Actualizar los paquetes de Termux:

    pkg update && pkg upgrade -y

### 2. Instalar Node.js, Git y FFmpeg:

    pkg install nodejs git ffmpeg -y

### 3. Descargar (clonar) el repositorio del bot:

    git clone https://github.com/mundoheitzacmundoheitzac-spec/KRONOS-MD.git

### 4. Entrar a la carpeta del bot:

    cd KRONOS-MD

### 5. Acomodar la imagen del menú en su carpeta:

    mkdir -p media && mv menu.jpg media/menu.jpg

### 6. Acomodar los archivos de comandos (plugins):

    mv plugins/plugins/* plugins/ && rmdir plugins/plugins

### 7. Instalar las librerías necesarias del bot:

    npm install

### 8. Encender el bot (elegir QR o Código de 8 dígitos):

    npm start

## 🛠️ Solución si el bot conecta pero no responde

### 1. Detener el bot en Termux:
Presiona las teclas **CTRL + C** en tu teclado de Termux.

### 2. Ejecutar el comando de reparación automática y reiniciar:

    sed -i 's/messages;/messages[0];/g' index.js && sed -i 's/if (!m.message || m.key.fromMe) return;/if (!m || !m.message) return;/g' index.js && sed -i "s/split('@');/split('@')[0];/g" handler.js && sed -i "s/split(':');/split(':')[0];/g" handler.js && sed -i 's/mentionedJid?\.;/mentionedJid?.[0];/g' plugins/*.js && sed -i 's/mentionedJid?\. ||/mentionedJid?.[0] ||/g' plugins/*.js && sed -i 's/search\.videos;/search.videos[0];/g' plugins/descargas.js && sed -i 's/data?\.\?\.url/data?.[0]?.url/g' plugins/descargas.js && sed -i 's/randomImg },/randomImg[1] },/g' plugins/descargas.js && sed -i 's/data?\.data?\.;/data?.data?.[0];/g' plugins/anime-otaku.js && sed -i 's/msgType = Object.keys(quoted || m.message);/msgType = Object.keys(quoted || m.message)[0];/g' plugins/stickers-media.js && npm start

