# E-Commerce Backend

Una aplicación web de comercio electrónico desarrollada con Node.js, Express y MongoDB.

## Qué hace esta aplicación

- Muestra productos en un catálogo
- Permite agregar productos al carrito
- Gestiona productos (crear, editar, eliminar)
- Todo funciona en tiempo real

## Qué necesitas tener instalado

- Node.js
- MongoDB
- Un editor de código (como VS Code)

## Cómo ejecutar el proyecto

1. Descarga el proyecto:
```
git clone https://github.com/maximiliano836/backend1.git
cd backend1
```

2. Instala las dependencias:
```
npm install
```

3. Configura la base de datos:
- Copia el archivo `.env.example` y renómbralo a `.env`
- Cambia la URL de MongoDB si es necesario

## Auth y Usuarios (Entrega 1)

- Variables en `.env` (ver `.env.example`):
	- MONGODB_URI
	- JWT_SECRET
	- JWT_EXPIRES

- Endpoints:
	- POST `/api/sessions/register` body: { first_name, last_name, email, age, password }
	- POST `/api/sessions/login` body: { email, password } -> Setea cookie `token`
	- GET `/api/sessions/current` (requiere JWT por cookie o header Bearer)
	- POST `/api/sessions/logout`
	- CRUD de usuarios `/api/users` (protegido con JWT; crear/eliminar requiere rol admin)

- Notas:
	- Las contraseñas se guardan en hash con bcrypt.
	- El JWT se puede enviar por header `Authorization: Bearer <token>` o viene en cookie `token`.
4. Importa productos de ejemplo (solo la primera vez):
```
node importar_productos.js
```

5. Ejecuta la aplicación:
```
npm start
```

6. Abre tu navegador en: http://localhost:8080

## Páginas disponibles

- `/` - Página principal
- `/products` - Catálogo de productos
- `/products/:id` - Detalle de un producto
- `/carts/:id` - Ver carrito
- `/realtimeproducts` - Gestión de productos en tiempo real

## API disponible

- `GET /api/products` - Lista de productos
- `POST /api/products` - Crear producto
- `PUT /api/products/:id` - Actualizar producto
- `DELETE /api/products/:id` - Eliminar producto
- `POST /api/carts` - Crear carrito
- `GET /api/carts/:id` - Ver carrito

## Tecnologías usadas

- Node.js
- Express
- MongoDB
- Handlebars
- Socket.IO

## Comandos útiles

- `npm start` - Ejecutar la aplicación
- `npm run dev` - Ejecutar en modo desarrollo

## Configuración

En el archivo `.env` puedes configurar:
- `PORT` - Puerto del servidor (por defecto 8080)
- `MONGODB_URI` - Dirección de tu base de datos MongoDB

## Autor

Maximiliano González
