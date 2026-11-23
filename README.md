### ⚡ Instalación de KRONOS-MD ⚡

### 1. Actualizar Termux:

```bash
pkg update && pkg upgrade -y
```

### 2. Instalar lo que necesita el bot:

```bash
pkg install nodejs git ffmpeg -y
```

### 3. Bajar el bot de GitHub:

```bash
git clone https://github.com/mundoheitzacmundoheitzac-spec/KRONOS-MD.git
```

### 4. Entrar a la carpeta del bot:

```bash
cd KRONOS-MD
```

### 5. Mover el menu.jpg a su carpeta:

```bash
mkdir -p media
mv menu.jpg media/menu.jpg
```

### 6. Acomodar los plugins:

```bash
mv plugins/plugins/* plugins/
```

### 7. Instalar las librerías del bot:

```bash
npm install
```

### 8. Prender el bot:

```bash
npm start
```
