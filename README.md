# E-Commerce Backend - Entrega Final

Sistema backend para e-commerce con MongoDB, filtros avanzados, paginación y gestión completa de carritos.

## Nuevas Funcionalidades - Entrega Final ✨

### �️ Base de Datos MongoDB
- Migración completa de archivos JSON a MongoDB
- Modelos con Mongoose para productos y carritos
- Referencias entre colecciones usando populate

### 🔍 Consultas Profesionales de Productos
- **Paginación**: Navegación por páginas de productos
- **Filtros**: Búsqueda por categoría y disponibilidad
- **Ordenamiento**: Por precio ascendente o descendente
- **Límites**: Control de cantidad de productos por página

### � Gestión Avanzada de Carritos
- **CRUD completo**: Crear, leer, actualizar y eliminar
- **Gestión de cantidades**: Actualizar cantidad de productos específicos
- **Eliminación selectiva**: Remover productos individuales
- **Vaciado completo**: Limpiar todo el carrito
- **Referencias a productos**: Población automática con datos completos

### 🎨 Vistas Profesionales
- **Catálogo con paginación**: `/products`
- **Detalle de producto**: `/products/:pid`
- **Vista de carrito**: `/carts/:cid`
- **Interfaz responsive** y moderna

## Estructura del Proyecto

```
├── models/
│   ├── Product.js           # Modelo de producto en MongoDB
│   └── Cart.js              # Modelo de carrito en MongoDB
├── managers/
│   ├── ProductManagerMongo.js  # Gestión de productos con MongoDB
│   └── CartManagerMongo.js     # Gestión de carritos con MongoDB
├── views/
│   ├── products.hbs         # Catálogo con paginación
│   ├── productDetail.hbs    # Detalle del producto
│   └── cart.hbs             # Vista del carrito
└── middleware/
    └── validation.js        # Validaciones para MongoDB ObjectIds
```

## Endpoints API

### Productos
- `GET /api/products?limit=10&page=1&sort=asc&query=categoria` - Listar con filtros
- `GET /api/products/:pid` - Obtener producto por ID
- `POST /api/products` - Crear producto
- `PUT /api/products/:pid` - Actualizar producto
- `DELETE /api/products/:pid` - Eliminar producto

### Carritos
- `POST /api/carts` - Crear carrito
- `GET /api/carts/:cid` - Obtener carrito con productos completos
- `POST /api/carts/:cid/product/:pid` - Agregar producto al carrito
- `DELETE /api/carts/:cid/products/:pid` - Eliminar producto del carrito
- `PUT /api/carts/:cid` - Actualizar carrito completo
- `PUT /api/carts/:cid/products/:pid` - Actualizar cantidad de producto
- `DELETE /api/carts/:cid` - Vaciar carrito

### Vistas
- `GET /products` - Catálogo con paginación y filtros
- `GET /products/:pid` - Detalle del producto
- `GET /carts/:cid` - Vista del carrito

## Parámetros de Consulta de Productos

- **limit**: Número de productos por página (default: 10)
- **page**: Página a mostrar (default: 1)
- **sort**: Ordenamiento por precio (`asc` o `desc`)
- **query**: Filtro por categoría o `available` para productos en stock

## Formato de Respuesta API

```json
{
  "status": "success",
  "payload": [...],
  "totalPages": 5,
  "prevPage": 1,
  "nextPage": 3,
  "page": 2,
  "hasPrevPage": true,
  "hasNextPage": true,
  "prevLink": "/api/products?page=1&limit=10",
  "nextLink": "/api/products?page=3&limit=10"
}
```

## Instalación

```bash
# Instalar dependencias
npm install

# Iniciar MongoDB (ver instrucciones abajo)
# Ejecutar aplicación
npm start
```

## Tecnologías

- **Node.js** con Express
- **MongoDB** con Mongoose
- **Socket.IO** para tiempo real
- **Handlebars** para vistas
- **Validación** de ObjectIds
