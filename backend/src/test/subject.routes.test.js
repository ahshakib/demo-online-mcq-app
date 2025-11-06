import { expect } from 'chai';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../app.js';

describe('Subject routes integration', function () {
  this.timeout(10000);
  let mongod;
  let adminToken;
  let subjectId;

  before(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);

    // register placeholder models used by Subject.populate to avoid MissingSchemaError in tests
    try {
      mongoose.model('Chapter');
    } catch (e) {
      mongoose.model('Chapter', new mongoose.Schema({}, { strict: false }));
    }
    try {
      mongoose.model('Routine');
    } catch (e) {
      mongoose.model('Routine', new mongoose.Schema({}, { strict: false }));
    }

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

  it('creates a subject (admin only)', async () => {
    const res = await request(app)
      .post('/api/v1/subjects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Mathematics',
        code: 'MATH101',
        description: 'Basic math',
        price: 10,
        isPremium: false
      });

    expect(res.status).to.equal(201);
    expect(res.body.success).to.equal(true);
    expect(res.body.data).to.have.property('_id');
    expect(res.body.data).to.have.property('name', 'Mathematics');
    subjectId = res.body.data._id;
  });

  it('gets all subjects (requires auth)', async () => {
    const res = await request(app)
      .get('/api/v1/subjects')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).to.equal(200);
    expect(res.body.success).to.equal(true);
    expect(res.body.data).to.be.an('array');
    expect(res.body.data.length).to.be.greaterThan(0);
  });

  it('gets subject by id', async () => {
    const res = await request(app)
      .get(`/api/v1/subjects/${subjectId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).to.equal(200);
    expect(res.body.success).to.equal(true);
    expect(res.body.data).to.have.property('_id', subjectId);
  });

  it('updates subject (admin only)', async () => {
    const res = await request(app)
      .patch(`/api/v1/subjects/${subjectId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ description: 'Updated description', price: 20 });

    expect(res.status).to.equal(200);
    expect(res.body.success).to.equal(true);
    expect(res.body.data).to.have.property('description', 'Updated description');
    expect(res.body.data).to.have.property('price', 20);
  });

  it('deletes subject (admin only)', async () => {
    const res = await request(app)
      .delete(`/api/v1/subjects/${subjectId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    // deletion returns 204 with no content in our successResponse implementation
    expect([200, 204]).to.include(res.status);
  });
});
