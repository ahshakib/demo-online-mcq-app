import { expect } from 'chai';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../app.js';

describe('Routine routes integration', function () {
  this.timeout(10000);
  let mongod;
  let adminToken;
  let userToken;
  let subjectId;
  let routineId;

  before(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);

    // register placeholder models used by populate to avoid MissingSchemaError in tests
    try { mongoose.model('Subject'); } catch (e) { mongoose.model('Subject', new mongoose.Schema({}, { strict: false })); }
    try { mongoose.model('Chapter'); } catch (e) { mongoose.model('Chapter', new mongoose.Schema({}, { strict: false })); }
    try { mongoose.model('Exam'); } catch (e) { mongoose.model('Exam', new mongoose.Schema({}, { strict: false })); }
    try { mongoose.model('Admin'); } catch (e) { mongoose.model('Admin', new mongoose.Schema({}, { strict: false })); }

    // create admin user and get token
    const res = await request(app).post('/api/v1/users/register/admin').send({
      username: 'adminuser',
      email: 'admin@example.com',
      password: 'adminpass'
    });
    expect(res.status).to.equal(201);
    adminToken = res.body.data.token;
  });

  after(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  it('creates a subject (admin) to attach to routine', async () => {
    const res = await request(app)
      .post('/api/v1/subjects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Physics', code: 'PHY101', description: 'Physics', price: 0, isPremium: false });

    expect(res.status).to.equal(201);
    subjectId = res.body.data._id;
  });

  it('creates a routine (admin only)', async () => {
    const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const res = await request(app)
      .post('/api/v1/routines')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Test Routine',
        subject: subjectId,
        date: future,
        startTime: '10:00',
        duration: 60,
        notes: 'Some notes'
      });

    expect(res.status).to.equal(201);
    expect(res.body.success).to.equal(true);
    expect(res.body.routine).to.have.property('_id');
    routineId = res.body.routine._id;
  });

  it('gets all routines (public)', async () => {
    const res = await request(app).get('/api/v1/routines');
    expect(res.status).to.equal(200);
    expect(res.body.success).to.equal(true);
    expect(res.body.routines).to.be.an('array');
    expect(res.body.routines.length).to.be.greaterThan(0);
  });

  it('gets a routine by id', async () => {
    const res = await request(app).get(`/api/v1/routines/${routineId}`);
    expect(res.status).to.equal(200);
    expect(res.body.success).to.equal(true);
    expect(res.body.routine).to.have.property('_id', routineId);
  });

  it('updates a routine (admin only)', async () => {
    const res = await request(app)
      .put(`/api/v1/routines/${routineId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Updated Routine' });

    expect(res.status).to.equal(200);
    expect(res.body.success).to.equal(true);
    expect(res.body.routine).to.have.property('title', 'Updated Routine');
  });

  it('returns upcoming routines for authenticated user', async () => {
    // create normal user
    const reg = await request(app).post('/api/v1/users/register').send({ username: 'user1', email: 'u1@example.com', password: 'password' });
    expect(reg.status).to.equal(201);
    userToken = reg.body.data.token;

    const res = await request(app)
      .get('/api/v1/routines/user/upcoming')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).to.equal(200);
    expect(res.body.success).to.equal(true);
    expect(res.body.routines).to.be.an('array');
    expect(res.body.routines.length).to.be.greaterThan(0);
  });

  it('deletes a routine (admin only)', async () => {
    const res = await request(app)
      .delete(`/api/v1/routines/${routineId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).to.equal(200);
    expect(res.body.success).to.equal(true);
  });
});
