import { expect } from 'chai';
import fs from 'fs';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import path from 'path';
import request from 'supertest';
import app from '../app.js';

describe('User routes integration', function () {
  this.timeout(10000);
  let mongod;
  let authToken;

  before(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
  });

  after(async () => {
    // cleanup DB and stop
    await mongoose.disconnect();
    await mongod.stop();

    // cleanup uploaded files
    const uploadDir = path.resolve(process.cwd(), 'uploads', 'profile');
    if (fs.existsSync(uploadDir)) {
      for (const f of fs.readdirSync(uploadDir)) {
        try { fs.unlinkSync(path.join(uploadDir, f)); } catch (e) { /* ignore */ }
      }
    }
  });

  it('registers a user', async () => {
    const res = await request(app).post('/api/v1/users/register').send({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });

    expect(res.status).to.equal(201);
    expect(res.body.success).to.equal(true);
    expect(res.body.data).to.have.property('token');
    expect(res.body.data.user).to.have.property('email', 'test@example.com');
  });

  it('logs in the user and returns token', async () => {
    const res = await request(app).post('/api/v1/users/login').send({
      email: 'test@example.com',
      password: 'password123'
    });

    expect(res.status).to.equal(200);
    expect(res.body.success).to.equal(true);
    expect(res.body.data).to.have.property('token');
    authToken = res.body.data.token;
  });

  it('gets profile with auth', async () => {
    const res = await request(app).get('/api/v1/users/profile').set('Authorization', `Bearer ${authToken}`);
    expect(res.status).to.equal(200);
    expect(res.body.success).to.equal(true);
    expect(res.body.data).to.have.property('email', 'test@example.com');
  });

  it('updates profile with image upload', async () => {
    const imagePath = path.resolve('src', 'test', 'fixtures', 'test-image.png');
    // ensure file exists
    expect(fs.existsSync(imagePath)).to.equal(true);

    const res = await request(app)
      .patch('/api/v1/users/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .field('bio', 'Updated bio')
      .attach('profilePic', imagePath);

    expect(res.status).to.equal(200);
    expect(res.body.success).to.equal(true);
    expect(res.body.data).to.have.property('profilePic');
    expect(res.body.data.profilePic).to.match(/^profile\//);

    // check file exists on disk
    const filename = res.body.data.profilePic.split('/').pop();
    const savedPath = path.resolve('uploads', 'profile', filename);
    expect(fs.existsSync(savedPath)).to.equal(true);
  });
});
