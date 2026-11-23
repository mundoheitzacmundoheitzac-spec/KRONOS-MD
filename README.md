# KRONOS-MD

Bot de WhatsApp con +180 comandos, QR y Código de 8 dígitos.
Owner: +52 639 136 6054

## Instalación en Termux

pkg update && pkg upgrade -y

pkg install nodejs git ffmpeg -y

git clone https://github.com/mundoheitzacmundoheitzac-spec/KRONOS-MD.git

cd KRONOS-MD

mkdir -p media && mv menu.jpg media/menu.jpg

mv plugins/plugins/* plugins/ && rmdir plugins/plugins

npm install

npm start
