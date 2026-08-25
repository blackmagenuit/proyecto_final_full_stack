# Pruebas manuales con Postman/Insomnia

1. Levantar el backend: `npm run dev` (o `docker-compose up`).
2. Cargar datos de prueba: `npm run seed` (crea `admin@example.com` / `password123` y `operario@example.com` / `password123`, con 8 productos).
3. Importar `Stock-App.postman_collection.json` en Postman o Insomnia.
4. Correr las carpetas en orden (1. Auth → 2. Productos → 3. Movimientos → 4. Reportes), con el botón "Run collection" o petición por petición.

Cada request trae un test embebido (pestaña *Tests* en Postman) que valida el código de estado y, cuando corresponde, el contenido de la respuesta — por ejemplo que un operario reciba `403` al intentar crear un producto, o que una salida mayor al stock disponible sea rechazada con `400`.

Los tokens (`adminToken`, `operarioToken`) y el `productId` creado se guardan automáticamente como variables de la colección al correr los requests de login y creación, así que no hay que copiarlos a mano entre pasos.
