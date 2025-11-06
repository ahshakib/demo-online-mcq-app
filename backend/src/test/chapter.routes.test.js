import { expect } from 'chai';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../app.js';

describe('Chapter routes integration', function () {
  this.timeout(10000);
  let mongod;
  let adminToken;
  let subjectId;
  let chapterId;

  before(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);

    // create admin user and get token
    const resAdmin = await request(app).post('/api/v1/users/register/admin').send({
      username: 'adminchap',
      email: 'adminchap@example.com',
      password: 'adminpass'
    });
    expect(resAdmin.status).to.equal(201);
    adminToken = resAdmin.body.data.token;

    // create a subject to attach chapters to
    const resSubject = await request(app)
      .post('/api/v1/subjects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Physics', code: 'PHY101', description: 'Physics basics' });
    expect(resSubject.status).to.equal(201);
    subjectId = resSubject.body.data._id;
  });

  after(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  it('creates a chapter (admin only)', async () => {
    const res = await request(app)
      .post('/api/v1/chapters')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Introduction to Physics',
        description: 'Overview of topics',
        subject: subjectId,
        order: 1,
        isPublished: true
      });

    expect(res.status).to.equal(201);
    expect(res.body.success).to.equal(true);
    expect(res.body.data).to.have.property('_id');
    expect(res.body.data).to.have.property('title', 'Introduction to Physics');
    chapterId = res.body.data._id;
  });

  it('gets all chapters (requires auth)', async () => {
    const res = await request(app)
      .get('/api/v1/chapters')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).to.equal(200);
    expect(res.body.success).to.equal(true);
    expect(res.body.data).to.be.an('array');
    expect(res.body.data.length).to.be.greaterThan(0);
  });

  it('gets chapter by id', async () => {
    const res = await request(app)
      .get(`/api/v1/chapters/${chapterId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).to.equal(200);
    expect(res.body.success).to.equal(true);
    expect(res.body.data).to.have.property('_id', chapterId);
  });

  it('updates chapter (admin only)', async () => {
    const res = await request(app)
      .put(`/api/v1/chapters/${chapterId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ description: 'Updated chapter description', order: 2 });

    expect(res.status).to.equal(200);
    expect(res.body.success).to.equal(true);
    expect(res.body.data).to.have.property('description', 'Updated chapter description');
    expect(res.body.data).to.have.property('order', 2);
  });

  it('deletes chapter (admin only)', async () => {
    const res = await request(app)
      .delete(`/api/v1/chapters/${chapterId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    // deletion returns 204 with no content in our successResponse implementation
    expect([200, 204]).to.include(res.status);
  });
});
