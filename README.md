# 💬 Chat en Tiempo Real

Una aplicación web de chat en tiempo real construida con Node.js, Express, Socket.io y Handlebars.

## 🚀 Características

- ✅ **Chat en tiempo real** - Mensajería instantánea entre usuarios
- 🎨 **Interfaz moderna** - Diseño responsive con gradientes y efectos
- 🔄 **Navegación fluida** - Header fijo con navegación entre páginas
- 📱 **Responsive** - Adaptable a dispositivos móviles
- 🎯 **Fácil de usar** - Interfaz intuitiva con botón de envío
- ⚡ **Rápido** - Optimizado para rendimiento

## 🛠️ Tecnologías

- **Backend**: Node.js, Express.js
- **WebSockets**: Socket.io
- **Motor de vistas**: Handlebars (HBS)
- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Estilos**: CSS Grid, Flexbox, Gradientes

## 📦 Instalación

### Prerrequisitos
- Node.js (v14 o superior)
- npm o yarn

### Pasos de instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/maximiliano836/backend1.git
   cd backend1
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Iniciar el servidor**
   ```bash
   npm start
   ```

4. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 🎯 Uso

### Página de Inicio
- Accede a `http://localhost:3000`
- Página de bienvenida con enlace al chat

### Chat en Tiempo Real
- Navega a `http://localhost:3000/chat`
- Escribe mensajes en el campo de texto
- Presiona Enter o haz clic en el botón 📨 para enviar
- Los mensajes aparecen instantáneamente para todos los usuarios conectados

### Navegación
- **Header fijo**: Siempre visible con opciones de navegación
- **🏠 Inicio**: Regresa a la página principal
- **💬 Chat**: Accede al chat en tiempo real

## 📁 Estructura del Proyecto

```
backend1/
├── app.js              # Archivo principal del servidor
├── package.json        # Dependencias y scripts
├── .gitignore         # Archivos ignorados por Git
├── public/            # Archivos estáticos
│   ├── css/
│   │   └── style.css  # Estilos principales
│   ├── js/
│   │   └── chat.js    # Lógica del chat frontend
│   └── img/
│       └── logo.png   # Logo de la aplicación
├── routes/
│   └── index.js       # Rutas principales
└── views/             # Vistas Handlebars
    ├── layouts/
    │   └── main.hbs   # Layout principal
    ├── home.hbs       # Página de inicio
    ├── chat.hbs       # Página del chat
    └── 404.hbs        # Página de error 404
```

## 🔧 Configuración

### Variables de entorno
- `PORT`: Puerto del servidor (por defecto: 3000)

### Personalización
- **Colores**: Modifica los gradientes en `public/css/style.css`
- **Logo**: Reemplaza `public/img/logo.png` con tu logo
- **Mensajes**: Personaliza los mensajes en las vistas HBS

## 📡 API WebSocket

### Eventos del cliente
- `chat message`: Envía un mensaje al servidor

### Eventos del servidor
- `chat message`: Recibe mensajes de otros usuarios
- `connection`: Nueva conexión de usuario
- `disconnect`: Usuario desconectado

## 🎨 Características de Diseño

### Responsive Design
- **Desktop**: Layout completo con sidebar
- **Mobile**: Navegación colapsada, contenido adaptado

### Efectos Visuales
- **Gradientes**: Fondo degradado moderno
- **Sombras**: Profundidad en elementos
- **Animaciones**: Transiciones suaves
- **Hover effects**: Interactividad mejorada

## 🔒 Seguridad

- Validación de entrada de mensajes
- Sanitización de datos
- Protección contra XSS básica

## 📈 Rendimiento

- Archivos estáticos optimizados
- Compresión de CSS
- Lazy loading de imágenes
- Minificación de JavaScript

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia ISC. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Maximiliano**
- GitHub: [@maximiliano836](https://github.com/maximiliano836)
- Repositorio: [backend1](https://github.com/maximiliano836/backend1)

## 🆘 Soporte

Si tienes algún problema o pregunta:
1. Revisa los [Issues](https://github.com/maximiliano836/backend1/issues) existentes
2. Crea un nuevo Issue si no encuentras solución
3. Proporciona detalles sobre tu problema

## 📸 Screenshots

### Página de Inicio
![Página de Inicio](https://via.placeholder.com/600x300?text=Página+de+Inicio)

### Chat en Tiempo Real
![Chat](https://via.placeholder.com/600x300?text=Chat+en+Tiempo+Real)

---

⭐ **¡Dale una estrella al proyecto si te gustó!**
