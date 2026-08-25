const request = require('supertest');
const { app } = require('../server');
const Product = require('../models/Product');
const { createUserAndLogin } = require('./helpers');

describe('Reportes', () => {
  it('el dashboard cuenta productos con bajo stock', async () => {
    const { token } = await createUserAndLogin({ name: 'Op', email: 'rep1@test.com' });
    await Product.create({ name: 'A', sku: 'A-1', category: 'Electrónica', price: 1, stock: 1, minStock: 5 });
    await Product.create({ name: 'B', sku: 'B-1', category: 'Electrónica', price: 1, stock: 20, minStock: 5 });

    const res = await request(app).get('/api/reports/dashboard').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.totalProductos).toBe(2);
    expect(res.body.data.productosConBajoStock).toBe(1);
    expect(res.body.data.productosBajoStock[0].sku).toBe('A-1');
  });

  it('agrupa el stock por categoría con el valor total', async () => {
    const { token } = await createUserAndLogin({ name: 'Op', email: 'rep2@test.com' });
    await Product.create({ name: 'A', sku: 'A-2', category: 'Hogar', price: 10, stock: 3 });
    await Product.create({ name: 'B', sku: 'B-2', category: 'Hogar', price: 5, stock: 2 });

    const res = await request(app)
      .get('/api/reports/stock-por-categoria')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const hogar = res.body.data.find(c => c._id === 'Hogar');
    expect(hogar.totalProductos).toBe(2);
    expect(hogar.stockTotal).toBe(5);
    expect(hogar.valorTotal).toBe(3 * 10 + 2 * 5);
  });

  it('devuelve las alertas de bajo stock ordenadas de menor a mayor', async () => {
    const { token } = await createUserAndLogin({ name: 'Op', email: 'rep3@test.com' });
    await Product.create({ name: 'A', sku: 'A-3', category: 'Ropa', price: 1, stock: 0, minStock: 5 });
    await Product.create({ name: 'B', sku: 'B-3', category: 'Ropa', price: 1, stock: 2, minStock: 5 });

    const res = await request(app)
      .get('/api/reports/alertas/bajo-stock')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.cantidad).toBe(2);
    expect(res.body.data[0].sku).toBe('A-3');
  });
});
