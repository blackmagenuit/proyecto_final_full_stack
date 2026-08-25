const request = require('supertest');
const { app } = require('../server');
const { createUserAndLogin } = require('./helpers');

const nuevoProducto = {
  name: 'Producto Test',
  sku: 'test-001',
  category: 'Electrónica',
  price: 10,
  stock: 5,
  minStock: 2
};

describe('CRUD de productos y permisos por rol', () => {
  it('rechaza listar productos sin autenticación', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(401);
  });

  it('un operario puede listar pero no crear productos', async () => {
    const { token } = await createUserAndLogin({
      name: 'Operario',
      email: 'operario@test.com',
      role: 'operario'
    });

    const list = await request(app).get('/api/products').set('Authorization', `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(list.body.data).toEqual([]);

    const create = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send(nuevoProducto);
    expect(create.status).toBe(403);
  });

  it('un administrador puede crear, editar y eliminar productos', async () => {
    const { token } = await createUserAndLogin({
      name: 'Admin',
      email: 'admin@test.com',
      role: 'administrador'
    });

    const create = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send(nuevoProducto);
    expect(create.status).toBe(201);
    expect(create.body.data.sku).toBe('TEST-001');
    const id = create.body.data._id;

    const update = await request(app)
      .put(`/api/products/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Producto Editado' });
    expect(update.status).toBe(200);
    expect(update.body.data.name).toBe('Producto Editado');

    const del = await request(app)
      .delete(`/api/products/${id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(del.status).toBe(200);

    // La baja es lógica: ya no aparece en el listado (isActive: false)
    const list = await request(app).get('/api/products').set('Authorization', `Bearer ${token}`);
    expect(list.body.data.find(p => p._id === id)).toBeUndefined();
  });

  it('rechaza crear un producto con SKU repetido', async () => {
    const { token } = await createUserAndLogin({
      name: 'Admin',
      email: 'admin2@test.com',
      role: 'administrador'
    });

    await request(app).post('/api/products').set('Authorization', `Bearer ${token}`).send(nuevoProducto);
    const res = await request(app).post('/api/products').set('Authorization', `Bearer ${token}`).send(nuevoProducto);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/SKU/i);
  });
});
