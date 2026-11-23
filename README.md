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
