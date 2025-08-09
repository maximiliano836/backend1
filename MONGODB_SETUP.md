# Instructivo de MongoDB - Setup Completo

## Opción 1: MongoDB Atlas (Recomendado - Gratis) ☁️

### Ventajas
- No requiere instalación local
- Configuración simple
- Backup automático
- Acceso desde cualquier lugar

### Pasos
1. **Crear cuenta en MongoDB Atlas**
   - Ve a https://cloud.mongodb.com
   - Clic en "Try Free"
   - Crear cuenta con email o Google

2. **Crear cluster gratuito**
   - Seleccionar "Shared" (gratuito)
   - Elegir región más cercana
   - Mantener configuración por defecto
   - Clic en "Create Cluster"

3. **Configurar acceso**
   - **Database Access**: Crear usuario con permisos de lectura/escritura
   - **Network Access**: Agregar `0.0.0.0/0` para acceso desde cualquier IP

4. **Obtener string de conexión**
   - Clic en "Connect" en tu cluster
   - Seleccionar "Connect your application"
   - Copiar la URL de conexión
   - Ejemplo: `mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/ecommerce`

5. **Configurar en tu aplicación**
   ```javascript
   // En app.js, reemplazar esta línea:
   mongoose.connect('mongodb://localhost:27017/ecommerce')
   
   // Por tu string de Atlas:
   mongoose.connect('mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/ecommerce')
   ```

## Opción 2: MongoDB Local (Avanzado) 💻

### Windows
1. **Descargar MongoDB Community**
   - https://www.mongodb.com/try/download/community
   - Seleccionar Windows
   - Descargar e instalar

2. **Configurar como servicio**
   - Durante instalación, marcar "Install MongoDB as a Service"
   - Marcar "Run service as Network Service user"

3. **Verificar instalación**
   ```powershell
   # Verificar que el servicio esté corriendo
   Get-Service MongoDB
   
   # Conectar con mongo shell
   mongo
   ```

### macOS
```bash
# Instalar con Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Iniciar servicio
brew services start mongodb/brew/mongodb-community

# Verificar conexión
mongo
```

### Linux (Ubuntu)
```bash
# Importar clave pública
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -

# Agregar repositorio
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list

# Instalar
sudo apt-get update
sudo apt-get install -y mongodb-org

# Iniciar servicio
sudo systemctl start mongod
sudo systemctl enable mongod
```

## Configuración Final en la Aplicación 🔧

### 1. Instalar Mongoose (si no está)
```bash
npm install mongoose
```

### 2. String de Conexión
En `app.js`, usa una de estas opciones:

```javascript
// Opción 1: MongoDB Atlas
mongoose.connect('mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/ecommerce')

// Opción 2: MongoDB Local
mongoose.connect('mongodb://localhost:27017/ecommerce')

// Opción 3: Con variables de entorno (recomendado)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce')
```

### 3. Variables de Entorno (Opcional)
Crear archivo `.env`:
```env
MONGODB_URI=mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/ecommerce
PORT=8080
```

Instalar dotenv:
```bash
npm install dotenv
```

En `app.js`:
```javascript
require('dotenv').config()
```

## Verificación de Conexión ✅

### Logs de Conexión
Al iniciar la aplicación, deberías ver:
```
Conectado a MongoDB
Servidor ejecutándose en puerto 8080
```

### Prueba con Compass (GUI)
1. Descargar MongoDB Compass
2. Conectar con tu string de conexión
3. Verificar que aparezca la base de datos `ecommerce`
4. Revisar colecciones `products` y `carts`

## Comandos Útiles 🛠️

### Revisar datos desde terminal
```javascript
// Conectar a MongoDB
mongo

// O si usas Atlas:
mongo "mongodb+srv://cluster0.xxxxx.mongodb.net/ecommerce" --username usuario

// Comandos básicos
use ecommerce
show collections
db.products.find()
db.carts.find()
```

### Limpiar datos de prueba
```javascript
db.products.deleteMany({})
db.carts.deleteMany({})
```

## Solución de Problemas 🔍

### Error de conexión
- Verificar que MongoDB esté corriendo
- Revisar firewall/antivirus
- Confirmar string de conexión

### Error de autenticación
- Verificar usuario/password en Atlas
- Confirmar permisos de base de datos

### Performance lenta
- Verificar región del cluster en Atlas
- Considerar índices para consultas frecuentes

## Recomendación Final 💡

**Para principiantes: usar MongoDB Atlas**
- Más simple de configurar
- No requiere mantenimiento
- Funciona desde cualquier lugar
- Plan gratuito suficiente para desarrollo

**Para desarrollo avanzado: MongoDB local**
- Mayor control
- Mejor para testing
- Sin dependencia de internet
