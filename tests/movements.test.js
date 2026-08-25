const request = require('supertest');
const { app } = require('../server');
const Product = require('../models/Product');
const { createUserAndLogin } = require('./helpers');

describe('Movimientos de stock (entradas y salidas)', () => {
  it('una entrada suma al stock y queda registrada con el stock antes/después', async () => {
    const { token } = await createUserAndLogin({ name: 'Op', email: 'op1@test.com' });
    const producto = await Product.create({
      name: 'Mouse', sku: 'MOUSE-1', category: 'Electrónica', price: 10, stock: 5
    });

    const res = await request(app)
      .post('/api/movements/entrada')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: producto._id, quantity: 10, supplier: 'Logitech' });

    expect(res.status).toBe(201);
    expect(res.body.data.stockBefore).toBe(5);
    expect(res.body.data.stockAfter).toBe(15);

    const actualizado = await Product.findById(producto._id);
    expect(actualizado.stock).toBe(15);
  });

  it('una salida resta del stock', async () => {
    const { token } = await createUserAndLogin({ name: 'Op', email: 'op2@test.com' });
    const producto = await Product.create({
      name: 'Teclado', sku: 'KB-1', category: 'Electrónica', price: 20, stock: 15
    });

    const res = await request(app)
      .post('/api/movements/salida')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: producto._id, quantity: 4, reason: 'Venta' });

    expect(res.status).toBe(201);
    expect(res.body.data.stockAfter).toBe(11);
  });

  it('rechaza una salida que deja el stock en negativo', async () => {
    const { token } = await createUserAndLogin({ name: 'Op', email: 'op3@test.com' });
    const producto = await Product.create({
      name: 'Cable', sku: 'CBL-1', category: 'Electrónica', price: 5, stock: 3
    });

    const res = await request(app)
      .post('/api/movements/salida')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: producto._id, quantity: 10, reason: 'Venta' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/insuficiente/i);

    const sinCambios = await Product.findById(producto._id);
    expect(sinCambios.stock).toBe(3);
  });

  it('lista los movimientos registrados con el producto poblado', async () => {
    const { token } = await createUserAndLogin({ name: 'Op', email: 'op4@test.com' });
    const producto = await Product.create({
      name: 'Monitor', sku: 'MON-1', category: 'Electrónica', price: 100, stock: 2
    });
    await request(app)
      .post('/api/movements/entrada')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: producto._id, quantity: 5, supplier: 'LG' });

    const res = await request(app).get('/api/movements').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].product.sku).toBe('MON-1');
  });
});
