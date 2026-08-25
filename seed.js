const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/stock-app', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('🔗 Conectado a MongoDB');

    // Limpiar colecciones existentes
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('🗑️  Colecciones limpias');

    // Crear usuarios
    const usuarios = await User.insertMany([
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'administrador'
      },
      {
        name: 'Operario Test',
        email: 'operario@example.com',
        password: 'password123',
        role: 'operario'
      }
    ]);

    console.log('✅ Usuarios creados:', usuarios.length);

    // Crear productos
    const productos = await Product.insertMany([
      {
        name: 'Laptop Dell XPS 13',
        sku: 'LAPTOP-DELL-001',
        description: 'Portátil ultradelgado con pantalla FHD',
        category: 'Electrónica',
        stock: 15,
        minStock: 5,
        price: 1299.99,
        unit: 'unidades',
        supplier: 'Dell Inc'
      },
      {
        name: 'Monitor LG 24"',
        sku: 'MONITOR-LG-001',
        description: 'Monitor IPS 24 pulgadas Full HD',
        category: 'Electrónica',
        stock: 32,
        minStock: 10,
        price: 199.99,
        unit: 'unidades',
        supplier: 'LG Electronics'
      },
      {
        name: 'Mouse Logitech MX',
        sku: 'MOUSE-LOG-001',
        description: 'Mouse inalámbrico de alta precisión',
        category: 'Electrónica',
        stock: 2,
        minStock: 8,
        price: 99.99,
        unit: 'unidades',
        supplier: 'Logitech'
      },
      {
        name: 'Teclado Mecánico RGB',
        sku: 'KEYBOARD-RGB-001',
        description: 'Teclado gaming mecánico con RGB',
        category: 'Electrónica',
        stock: 45,
        minStock: 15,
        price: 159.99,
        unit: 'unidades',
        supplier: 'Corsair'
      },
      {
        name: 'Cable HDMI 2.1',
        sku: 'CABLE-HDMI-001',
        description: 'Cable HDMI 2.1 8K 60Hz, 2 metros',
        category: 'Electrónica',
        stock: 0,
        minStock: 20,
        price: 24.99,
        unit: 'unidades',
        supplier: 'Belkin'
      },
      {
        name: 'Camiseta Básica (Blanco)',
        sku: 'SHIRT-WHITE-M',
        description: 'Camiseta de algodón 100%, talla M',
        category: 'Ropa',
        stock: 87,
        minStock: 25,
        price: 19.99,
        unit: 'unidades',
        supplier: 'Textile Factory'
      },
      {
        name: 'Arroz Integral 1kg',
        sku: 'RICE-BROWN-1KG',
        description: 'Arroz integral de grano largo',
        category: 'Alimentos',
        stock: 150,
        minStock: 50,
        price: 3.99,
        unit: 'kg',
        supplier: 'Agricultural Imports'
      },
      {
        name: 'Almohada Memory Foam',
        sku: 'PILLOW-MEMORY-STD',
        description: 'Almohada ergonómica de memory foam',
        category: 'Hogar',
        stock: 23,
        minStock: 8,
        price: 49.99,
        unit: 'unidades',
        supplier: 'HomeComfort Inc'
      }
    ]);

    console.log('✅ Productos creados:', productos.length);

    console.log('\n✨ Base de datos poblada exitosamente!\n');
    console.log('📊 Resumen:');
    console.log('   - Usuarios: 2');
    console.log('   - Productos: 8');
    console.log('\n🔐 Credenciales de prueba:');
    console.log('   Admin: admin@example.com / password123');
    console.log('   Operario: operario@example.com / password123');

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedDatabase();
