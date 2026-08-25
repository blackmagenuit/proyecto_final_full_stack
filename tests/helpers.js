const request = require('supertest');
const { app } = require('../server');
const User = require('../models/User');

// Crea un usuario con el rol pedido y devuelve su token JWT vía el propio
// endpoint de login, para probar el mismo camino que usa un cliente real.
async function createUserAndLogin({ name, email, password = 'password123', role = 'operario' }) {
  const user = await User.create({ name, email, password, role });
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return { user, token: res.body.token };
}

module.exports = { createUserAndLogin };
