# 📊 Estructura del Proyecto Stock App

## 📁 Árbol de Archivos

```
stock-app/
│
├── 📄 Backend (Node.js + Express + MongoDB)
│   ├── server.js                          # Servidor principal
│   ├── package.json                       # Dependencias del backend
│   ├── seed.js                            # Script para poblar BD
│   ├── Dockerfile                         # Imagen Docker backend
│   ├── .env.example                       # Plantilla de variables
│   ├── .gitignore
│   │
│   ├── 📁 models/                         # Esquemas de MongoDB
│   │   ├── User.js                        # Modelo de usuario
│   │   ├── Product.js                     # Modelo de producto
│   │   └── Movement.js                    # Modelo de movimientos
│   │
│   ├── 📁 routes/                         # Definición de APIs
│   │   ├── auth.routes.js                 # Login/Registro
│   │   ├── products.routes.js             # CRUD productos
│   │   ├── movements.routes.js            # Entradas/Salidas
│   │   └── reports.routes.js              # Reportes y analytics
│   │
│   └── 📁 middleware/
│       └── auth.js                        # Verificación JWT
│
├── 📁 Frontend (React + Vite + Tailwind)
│   ├── package.json                       # Dependencias frontend
│   ├── vite.config.js                     # Configuración Vite
│   ├── tailwind.config.js                 # Configuración Tailwind
│   ├── postcss.config.js                  # Procesamiento CSS
│   ├── index.html                         # HTML entrada
│   ├── Dockerfile                         # Imagen Docker frontend
│   ├── .env.example
│   │
│   └── 📁 src/
│       ├── main.jsx                       # Punto de entrada React
│       ├── App.jsx                        # Componente principal
│       ├── index.css                      # Estilos globales
│       │
│       ├── 📁 pages/                      # Páginas principales
│       │   ├── Login.jsx                  # Autenticación
│       │   ├── Dashboard.jsx              # Dashboard/Inicio
│       │   ├── Products.jsx               # Gestión de productos
│       │   ├── Movements.jsx              # Registro de movimientos
│       │   └── Reports.jsx                # Reportes y análisis
│       │
│       └── 📁 components/                 # Componentes reutilizables
│           ├── Navigation.jsx             # Barra de navegación
│           └── ProtectedRoute.jsx         # Rutas protegidas
│
├── 📄 Docker & Config
│   ├── docker-compose.yml                 # Orquestación servicios
│   ├── .env.example                       # Variables de entorno
│   └── .gitignore
│
└── 📄 Documentación
    ├── README.md                          # Documentación completa
    ├── QUICKSTART.md                      # Guía de inicio rápido
    └── PROJECT_STRUCTURE.md               # Este archivo
```

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    USUARIO EN NAVEGADOR                  │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │      FRONTEND (React + Vite)   │
        │     Puerto 3000 - Navegador    │
        │  - Dashboard                   │
        │  - Productos                   │
        │  - Movimientos                 │
        │  - Reportes                    │
        └────────────┬───────────────────┘
                     │ HTTP + WebSocket
                     ▼
    ┌──────────────────────────────────────┐
    │    BACKEND (Node.js + Express)       │
    │  Puerto 5000 - API REST + WebSocket  │
    │  - Autenticación (JWT)               │
    │  - CRUD Productos                    │
    │  - Control de Stock                  │
    │  - Reportes                          │
    └────────────┬─────────────────────────┘
                 │
                 ▼
    ┌──────────────────────────────────────┐
    │    BASE DE DATOS (MongoDB)           │
    │    Puerto 27017 - Datos Persistentes │
    │  - Usuarios                          │
    │  - Productos                         │
    │  - Movimientos                       │
    └──────────────────────────────────────┘
```

## 🔄 Flujo de Datos

### 1. **Autenticación**
```
Usuario → Login Form → POST /api/auth/login → JWT Token → localStorage
```

### 2. **Obtener Productos**
```
Frontend → GET /api/products + JWT → Backend → MongoDB → JSON Response
```

### 3. **Registrar Entrada/Salida**
```
Usuario → Form → POST /api/movements/entrada|salida → Backend
         → Actualizar Stock en MongoDB → WebSocket → Actualizar Frontend
```

### 4. **Reportes en Tiempo Real**
```
Backend → GET /api/reports/dashboard → Agregaciones MongoDB → Datos → Frontend
         ↓ WebSocket (socket.io)
Cuando cambia stock → Emite evento → Frontend actualiza sin recargar
```

## 📦 Dependencias Principales

### Backend
- **express**: Framework web
- **mongoose**: ODM para MongoDB
- **jsonwebtoken**: Autenticación
- **bcryptjs**: Hash de contraseñas
- **socket.io**: WebSockets
- **cors**: Control de orígenes cruzados
- **helmet**: Seguridad HTTP

### Frontend
- **react**: Librería UI
- **react-router-dom**: Enrutamiento
- **axios**: Cliente HTTP
- **socket.io-client**: WebSocket client
- **tailwindcss**: Framework CSS

## 🔐 Sistema de Permisos

```
┌─────────────────────────────────────────┐
│           USUARIO NO AUTENTICADO        │
│   Solo puede ver: Login/Registro        │
└────────────────┬────────────────────────┘
                 │ JWT Token
                 ▼
    ┌────────────────────────────┐
    │  OPERARIO (rol: operario)  │
    │  - Ver productos           │
    │  - Registrar entradas      │
    │  - Registrar salidas       │
    │  - Ver reportes (lectura)  │
    └────────────────────────────┘

    ┌────────────────────────────┐
    │  ADMINISTRADOR (rol: admin)│
    │  - Todo lo del operario +  │
    │  - Crear productos         │
    │  - Editar productos        │
    │  - Eliminar productos      │
    │  - Gestionar usuarios      │
    └────────────────────────────┘
```

## 🗄️ Esquema de Base de Datos

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: "administrador" | "operario",
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Products Collection
```javascript
{
  _id: ObjectId,
  name: String,
  sku: String (unique),
  description: String,
  category: "Electrónica" | "Ropa" | "Alimentos" | "Hogar" | "Otros",
  stock: Number,
  minStock: Number,
  price: Number,
  unit: "unidades" | "kg" | "litros" | "metros" | "cajas",
  supplier: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Movements Collection
```javascript
{
  _id: ObjectId,
  type: "entrada" | "salida",
  product: ObjectId (ref: Product),
  quantity: Number,
  reason: String,
  supplier: String,
  reference: String,
  user: ObjectId (ref: User),
  stockBefore: Number,
  stockAfter: Number,
  notes: String,
  date: Date,
  createdAt: Date
}
```

## 🌐 Endpoints de API

### Autenticación
```
POST   /api/auth/register              Crear usuario
POST   /api/auth/login                 Iniciar sesión
GET    /api/auth/me                    Obtener perfil
PUT    /api/auth/profile               Actualizar perfil
```

### Productos
```
GET    /api/products                   Listar todos
GET    /api/products/:id               Obtener uno
POST   /api/products                   Crear (admin)
PUT    /api/products/:id               Actualizar (admin)
DELETE /api/products/:id               Eliminar (admin)
```

### Movimientos
```
GET    /api/movements                  Listar movimientos
POST   /api/movements/entrada          Registrar entrada
POST   /api/movements/salida           Registrar salida
```

### Reportes
```
GET    /api/reports/dashboard          Dashboard general
GET    /api/reports/stock-por-categoria Stock por categoría
GET    /api/reports/alertas/bajo-stock Productos con bajo stock
GET    /api/reports/movimientos-periodo Reportes por período
GET    /api/reports/historial/:productId Historial producto
```

## 🚀 Pipeline de CI/CD (Futuro)

```
GitHub Push
    ↓
Run Tests
    ↓
Build Docker Images
    ↓
Push to Registry
    ↓
Deploy to Production
    ↓
Health Checks
```

## 💡 Características Implementadas

✅ Autenticación JWT
✅ CRUD Completo de Productos
✅ Control automático de stock
✅ WebSocket para actualizaciones en tiempo real
✅ Reportes y dashboard
✅ Sistema de roles y permisos
✅ Validación de datos
✅ Manejo de errores
✅ Docker y docker-compose
✅ Responsive design con Tailwind

## 🔮 Mejoras Futuras

- [ ] Exportar reportes (PDF/Excel)
- [ ] Notificaciones por email
- [ ] Códigos de barras/QR
- [ ] API de terceros (contabilidad)
- [ ] App móvil nativa
- [ ] Análisis predictivo
- [ ] Sistema de auditoría
- [ ] Caché Redis
- [ ] Pruebas automatizadas (Jest, Cypress)

---

**Última actualización**: Agosto 2026
