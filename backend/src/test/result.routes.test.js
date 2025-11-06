import { expect } from 'chai';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../app.js';
import { resultService } from '../modules/result/result.service.js';

describe('Result routes integration', function () {
  this.timeout(10000);
  let mongod;
  let adminToken;
  let userToken;
  let userId;
  let subjectId;
  let chapterId;
  let examId;

  before(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);

    // dynamically mount result routes to avoid cycles
    try {
      const { default: resultRoutes } = await import('../modules/result/result.routes.js');
      app.use('/api/v1/results', resultRoutes);
    } catch (err) {
      console.warn('Could not mount result routes in test:', err.message);
    }

    // create admin and user
    const resAdmin = await request(app).post('/api/v1/users/register/admin').send({
      username: 'adminres',
      email: 'adminres@example.com',
      password: 'adminpass'
    });
    expect(resAdmin.status).to.equal(201);
    adminToken = resAdmin.body.data.token;

    const resUser = await request(app).post('/api/v1/users/register').send({
      username: 'normaluser',
      email: 'normal@example.com',
      password: 'userpass'
    });
    expect(resUser.status).to.equal(201);
    userToken = resUser.body.data.token;
    userId = resUser.body.data.user._id;

    // create subject and chapter and exam
    const resSubject = await request(app)
      .post('/api/v1/subjects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Biology', code: 'BIO101' });
    expect(resSubject.status).to.equal(201);
    subjectId = resSubject.body.data._id;

    const resChapter = await request(app)
      .post('/api/v1/chapters')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Cell Biology', subject: subjectId });
    expect(resChapter.status).to.equal(201);
    chapterId = resChapter.body.data._id;

    const resExam = await request(app)
      .post('/api/v1/exams')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Biology Final', chapter: chapterId, totalMarks: 100, totalQuestions: 1 });
    expect(resExam.status).to.equal(201);
    examId = resExam.body.data._id;

    // create a result record for the user
    await resultService.createResult({
      user: userId,
      exam: examId,
      subject: subjectId,
      score: 90,
      totalMarks: 100,
      percentage: 90,
      answers: [],
      timeTaken: 120,
    });
  });

  after(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  it('returns my results for authenticated user', async () => {
    const res = await request(app)
      .get('/api/v1/results/my-results')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).to.equal(200);
    expect(res.body.success).to.equal(true);
    expect(res.body.results).to.be.an('array');
    expect(res.body.results[0]).to.have.property('exam');
  });

  it('returns user analytics', async () => {
    const res = await request(app)
      .get('/api/v1/results/my-analytics')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).to.equal(200);
    expect(res.body.success).to.equal(true);
    expect(res.body.analytics).to.be.an('array');
  });

  it('returns leaderboard for exam', async () => {
    const res = await request(app).get(`/api/v1/results/leaderboard/${examId}`);
    expect(res.status).to.equal(200);
    expect(res.body.success).to.equal(true);
    expect(res.body.leaderboard).to.be.an('array');
  });

  it('returns all results for admin and admin analytics', async () => {
    const resAll = await request(app)
      .get('/api/v1/results/all')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(resAll.status).to.equal(200);
    expect(resAll.body.success).to.equal(true);
    expect(resAll.body.results).to.be.an('array');

    const resAdminAnalytics = await request(app)
      .get('/api/v1/results/admin-analytics')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(resAdminAnalytics.status).to.equal(200);
    expect(resAdminAnalytics.body.success).to.equal(true);
    expect(resAdminAnalytics.body.analytics).to.be.an('array');
  });
});
