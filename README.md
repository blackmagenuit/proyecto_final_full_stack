# 📦 Sistema de Gestión de Stock - Full Stack

[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue?logo=react)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-green?logo=mongodb)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

Una aplicación web profesional y completa para gestionar inventarios con entradas y salidas de productos en depósitos, con actualizaciones en tiempo real y sistema de roles.

**[Ver Documentación Completa →](PROYECTO_COMPLETADO.md)**

## 🚀 Características Principales

| Característica | Descripción |
|---|---|
| 📦 **Gestión de Productos** | Crear, editar, eliminar productos con SKU, categoría y precio |
| 📊 **Control de Stock** | Registrar entradas/salidas con validaciones automáticas |
| 👥 **Usuarios y Roles** | Administrador y Operario con permisos diferenciados |
| 📈 **Dashboard Dinámico** | Estadísticas en tiempo real con WebSockets |
| 📋 **Reportes Completos** | Análisis por categoría, período y alertas |
| ⚡ **Tiempo Real** | Socket.io para actualizaciones instantáneas |
| 🐳 **Docker Ready** | Configuración lista para producción |
| 🎨 **Responsive Design** | Interfaz moderna con Tailwind CSS |

## 🛠️ Stack Tecnológico

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT para autenticación
- Socket.io para actualizaciones en tiempo real

**Frontend:**
- React 18
- Vite (build tool)
- Tailwind CSS
- Axios para API calls
- Socket.io-client

**DevOps:**
- Docker & Docker Compose
- MongoDB 6.0

## 📋 Requisitos Previos

- Docker & Docker Compose
- Node.js 18+ (si quieres ejecutar sin Docker)
- Git

## 🚀 Inicio Rápido con Docker

### 1. Clonar y configurar

```bash
cd stock-app
cp .env.example .env
cd frontend
cp .env.example .env
cd ..
```

### 2. Iniciar los servicios

```bash
docker-compose up -d
```

Los servicios estarán disponibles en:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

### 3. Crear datos de prueba

```bash
# Registrar un usuario administrador
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "email": "admin@example.com",
    "password": "password123"
  }'
```

## 🏃 Ejecución sin Docker

### Backend

```bash
npm install
npm run dev
```

El servidor estará en http://localhost:5000

### Frontend

```bash
cd frontend
npm install
npm run dev
```

La aplicación estará en http://localhost:3000

## 📚 Estructura del Proyecto

```
stock-app/
├── server.js                 # Servidor principal
├── package.json
├── models/
│   ├── User.js
│   ├── Product.js
│   └── Movement.js
├── routes/
│   ├── auth.routes.js
│   ├── products.routes.js
│   ├── movements.routes.js
│   └── reports.routes.js
├── middleware/
│   └── auth.js
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── Movements.jsx
│   │   │   └── Reports.jsx
│   │   ├── components/
│   │   │   ├── Navigation.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── docker-compose.yml
├── Dockerfile
└── .env.example
```

## 🔐 Autenticación

La API usa JWT (JSON Web Tokens). Los tokens deben enviarse en el header:

```
Authorization: Bearer <token>
```

### Endpoints de Auth

- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener perfil del usuario

## 📦 API Endpoints

### Productos
- `GET /api/products` - Listar productos
- `GET /api/products/:id` - Obtener un producto
- `POST /api/products` - Crear producto (admin)
- `PUT /api/products/:id` - Actualizar producto (admin)
- `DELETE /api/products/:id` - Eliminar producto (admin)

### Movimientos
- `GET /api/movements` - Listar movimientos
- `POST /api/movements/entrada` - Registrar entrada
- `POST /api/movements/salida` - Registrar salida

### Reportes
- `GET /api/reports/dashboard` - Dashboard general
- `GET /api/reports/stock-por-categoria` - Stock por categoría
- `GET /api/reports/alertas/bajo-stock` - Alertas de bajo stock
- `GET /api/reports/movimientos-periodo` - Movimientos en período

## 🎯 Roles y Permisos

**Administrador:**
- Crear, editar, eliminar productos
- Ver todos los reportes
- Gestionar usuarios

**Operario:**
- Ver productos
- Registrar entradas y salidas
- Ver reportes (solo lectura)

## 🧪 Testing

### Pruebas automatizadas (Jest + Supertest)

```bash
npm test
```

18 pruebas unitarias/integración sobre la API (auth, permisos por rol, CRUD de productos, entradas/salidas de stock, reportes). Corren contra una MongoDB en memoria (`mongodb-memory-server`), no requieren Docker ni una base real levantada.

### Postman/Insomnia

Colección lista para importar en [`postman/Stock-App.postman_collection.json`](postman/Stock-App.postman_collection.json), con tests embebidos por request. Ver [`postman/README.md`](postman/README.md) para el paso a paso.

**Ejemplo de login:**
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "password123"
}
```

## 🐛 Troubleshooting

### MongoDB no inicia
```bash
docker-compose down -v
docker-compose up -d
```

### Puerto ya en uso
```bash
# Cambiar puertos en docker-compose.yml
# o detener el servicio que usa el puerto
```

### Frontend no conecta con backend
- Verificar que el backend esté corriendo (http://localhost:5000)
- Revisar la variable `VITE_API_URL` en `frontend/.env`

## 🚀 Deployment

### Heroku (Backend)
```bash
git push heroku main
```

### Vercel (Frontend)
```bash
vercel deploy
```

## 📝 Variables de Entorno

### Backend (.env)
```
MONGODB_URI=mongodb://usuario:contraseña@localhost:27017/stock-app
PORT=5000
JWT_SECRET=tu_secreto_aqui
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de código abierto bajo la licencia MIT.

## ✨ Características Futuras

- [ ] Exportar reportes a PDF/Excel
- [ ] Notificaciones por email
- [ ] Códigos de barras/QR
- [ ] Integración con contabilidad
- [ ] App móvil
- [ ] Análisis predictivo

## 📞 Soporte

Para reportar bugs o solicitar features, abre un issue en el repositorio.

---

**Última actualización**: Agosto 2026
