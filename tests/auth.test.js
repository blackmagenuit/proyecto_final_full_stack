const request = require('supertest');
const { app } = require('../server');

describe('POST /api/auth/register', () => {
  it('registra un usuario nuevo con rol operario por defecto', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Nuevo Usuario',
      email: 'nuevo@test.com',
      password: 'password123'
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('operario');
    expect(res.body.user.password).toBeUndefined();
  });

  it('rechaza un registro con email duplicado', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Uno',
      email: 'duplicado@test.com',
      password: 'password123'
    });

    const res = await request(app).post('/api/auth/register').send({
      name: 'Dos',
      email: 'duplicado@test.com',
      password: 'password123'
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rechaza contraseñas de menos de 6 caracteres', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Corto',
      email: 'corto@test.com',
      password: '123'
    });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('hashea la contraseña al registrar y permite loguearse con la misma', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Login Test',
      email: 'login@test.com',
      password: 'password123'
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'login@test.com',
      password: 'password123'
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('rechaza credenciales incorrectas', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Login Test',
      email: 'login2@test.com',
      password: 'password123'
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'login2@test.com',
      password: 'incorrecta'
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/auth/me', () => {
  it('rechaza el acceso sin token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('devuelve el perfil del usuario autenticado', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Perfil Test',
      email: 'perfil@test.com',
      password: 'password123'
    });
    const login = await request(app).post('/api/auth/login').send({
      email: 'perfil@test.com',
      password: 'password123'
    });

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${login.body.token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('perfil@test.com');
  });
});
