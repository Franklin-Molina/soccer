# Usar una imagen base de Node.js
FROM node:20-alpine

# Establecer el directorio de trabajo en /app
WORKDIR /app

# Copiar los archivos package.json y package-lock.json (si existe)
COPY package*.json ./

# Instalar las dependencias
RUN npm install

# Copiar el resto del código de la aplicación
COPY . .

# Construir la aplicación para producción
RUN npm run build

# Servir la aplicación con un servidor web ligero (por ejemplo, serve)
# Instalar serve globalmente
RUN npm install -g serve

# Exponer el puerto en el que corre la aplicación (por defecto 3000 para create-react-app, pero serve usa 3000 por defecto)
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["serve", "-s", "dist"]
