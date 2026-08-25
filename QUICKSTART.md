# 🚀 Guía de Inicio Rápido

## Opción 1: Con Docker (Recomendado)

### Paso 1: Preparar el proyecto

```bash
cd stock-app
cp .env.example .env
cd frontend && cp .env.example .env && cd ..
```

### Paso 2: Iniciar los servicios

```bash
docker-compose up
```

Espera a que todo esté listo. Verás algo como:
```
✓ Conectado a MongoDB
🚀 Servidor corriendo en puerto 5000
```

### Paso 3: Acceder a la aplicación

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api

### Paso 4: Crear primer usuario

En tu navegador, ve a http://localhost:3000 y haz clic en "Regístrate aquí"

Datos de ejemplo:
- **Nombre**: Juan Admin
- **Email**: admin@example.com
- **Contraseña**: password123

---

## Opción 2: Sin Docker (Desarrollo Local)

### Backend

```bash
# 1. Asegúrate de tener MongoDB corriendo
# macOS con Homebrew:
brew services start mongodb-community

# Linux:
sudo systemctl start mongod

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env

# 4. Iniciar servidor en modo desarrollo
npm run dev
```

El servidor estará en http://localhost:5000

### Frontend

```bash
# En otra terminal...

# 1. Ir a la carpeta del frontend
cd frontend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env

# 4. Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará en http://localhost:3000

---

## 🧪 Pruebas Rápidas

### 1. Crear un producto (requiere login como admin)

**Credenciales de prueba:**
- Email: admin@example.com
- Contraseña: password123

```bash
# O vía API directamente
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer <tu_token_aqui>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop Dell",
    "sku": "LAPTOP001",
    "category": "Electrónica",
    "price": 899.99,
    "minStock": 3,
    "supplier": "Dell Inc"
  }'
```

### 2. Registrar una entrada de producto

```bash
curl -X POST http://localhost:5000/api/movements/entrada \
  -H "Authorization: Bearer <tu_token_aqui>" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "<product_id>",
    "quantity": 10,
    "supplier": "Proveedor XYZ",
    "reference": "COMPRA-2024-001"
  }'
```

### 3. Registrar una salida

```bash
curl -X POST http://localhost:5000/api/movements/salida \
  -H "Authorization: Bearer <tu_token_aqui>" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "<product_id>",
    "quantity": 2,
    "reason": "Venta a cliente",
    "reference": "VENTA-2024-001"
  }'
```

---

## 🔍 Verificar que todo funciona

### Verificar Backend

```bash
curl http://localhost:5000/api/auth/me
# Debería retornar: {"success":false,"message":"Token no proporcionado"}
```

### Verificar MongoDB

```bash
# Si tienes mongosh instalado
mongosh --eval "db.adminCommand('ping')"
```

### Verificar Frontend

Abre http://localhost:3000 en tu navegador. Deberías ver la página de login.

---

## 🐛 Solucionar Problemas

### "Puerto 5000 ya está en uso"
```bash
# Encuentra y detén el proceso
lsof -i :5000
kill -9 <PID>

# O cambia el puerto en .env
PORT=5001
```

### "No puedo conectarme a MongoDB"
```bash
# Verifica que MongoDB esté corriendo
# macOS:
brew services list

# Linux:
sudo systemctl status mongod
```

### "El frontend no carga"
- Verifica que http://localhost:3000 esté disponible
- Revisa la consola del navegador (F12)
- Comprueba que el backend esté corriendo

---

## 📝 Siguiente Pasos

1. **Crear productos**: Navega a "Productos" y crea algunos
2. **Registrar movimientos**: Ve a "Movimientos" y prueba entradas/salidas
3. **Ver reportes**: Consulta las estadísticas en "Reportes"
4. **Explorar API**: Abre http://localhost:5000/api/products en el navegador

---

## 🆘 Necesitas ayuda?

1. Revisa el README.md para documentación completa
2. Verifica los logs de Docker: `docker-compose logs backend`
3. Abre el DevTools del navegador (F12) para ver errores del frontend

¡Buena suerte! 🚀
