import { expect } from 'chai';
import fs from 'fs';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import path from 'path';
import request from 'supertest';
import app from '../app.js';
let attemptRoutes;
let questionRoutes;

describe('Exam, Question, Attempt routes integration', function () {
  this.timeout(20000);
  let mongod;
  let adminToken;
  let subjectId;
  let chapterId;
  let examId;
  let questionId;

  before(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);

    // dynamically import and mount question and attempt routes to avoid import cycles
    try {
      const { default: qRoutes } = await import('../modules/exam/question/question.routes.js');
      const { default: aRoutes } = await import('../modules/exam/attempt/attempt.routes.js');
      questionRoutes = qRoutes;
      attemptRoutes = aRoutes;
      app.use('/api/v1/questions', questionRoutes);
      app.use('/api/v1/attempts', attemptRoutes);
    } catch (err) {
      console.warn('Could not dynamically mount question/attempt routes in test:', err.message);
    }

    // create admin user and get token
    const resAdmin = await request(app).post('/api/v1/users/register/admin').send({
      username: 'adminexam',
      email: 'adminexam@example.com',
      password: 'adminpass'
    });
    expect(resAdmin.status).to.equal(201);
    adminToken = resAdmin.body.data.token;

    // create subject
    const resSubject = await request(app)
      .post('/api/v1/subjects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Chemistry', code: 'CHEM101', description: 'Chem basics' });
    expect(resSubject.status).to.equal(201);
    subjectId = resSubject.body.data._id;

    // create chapter
    const resChapter = await request(app)
      .post('/api/v1/chapters')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Intro to Chemistry', subject: subjectId });
    expect(resChapter.status).to.equal(201);
    chapterId = resChapter.body.data._id;
  });

  after(async () => {
    // cleanup uploads created by question tests
    const questionDir = path.resolve(process.cwd(), 'uploads', 'questions');
    const explanationDir = path.resolve(process.cwd(), 'uploads', 'explanations');
    [questionDir, explanationDir].forEach((dir) => {
      if (fs.existsSync(dir)) {
        for (const f of fs.readdirSync(dir)) {
          try { fs.unlinkSync(path.join(dir, f)); } catch (e) { /* ignore */ }
        }
      }
    });

    await mongoose.disconnect();
    await mongod.stop();
  });

  it('creates an exam (admin only)', async () => {
    const res = await request(app)
      .post('/api/v1/exams')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Chemistry Midterm', chapter: chapterId, duration: 30 });

    expect(res.status).to.equal(201);
    expect(res.body.success).to.equal(true);
    examId = res.body.data._id;
  });

  it('gets all exams and exam by id', async () => {
    const resAll = await request(app)
      .get('/api/v1/exams')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(resAll.status).to.equal(200);
    expect(resAll.body.success).to.equal(true);
    expect(resAll.body.data).to.be.an('array');

    const resById = await request(app)
      .get(`/api/v1/exams/${examId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(resById.status).to.equal(200);
    expect(resById.body.success).to.equal(true);
    expect(resById.body.data).to.have.property('_id', examId);
  });

  it('creates a question with images', async () => {
    const fixture = path.resolve('src', 'test', 'fixtures', 'test-image.png');
    expect(fs.existsSync(fixture)).to.equal(true);

    const options = [
      { text: 'A', isCorrect: false },
      { text: 'B', isCorrect: true },
      { text: 'C', isCorrect: false },
    ];

    const res = await request(app)
      .post('/api/v1/questions')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('exam', examId)
      .field('text', 'What is H2O?')
      .field('options', JSON.stringify(options))
      .field('explanationText', 'Because water')
      .attach('questionImage', fixture)
      .attach('explanationImage', fixture);

    expect(res.status).to.equal(201);
    expect(res.body.success).to.equal(true);
    expect(res.body.data).to.have.property('_id');
    questionId = res.body.data._id;
  });

  it('submits an attempt and returns feedback', async () => {
    // pick the correct option 'B'
    const answers = [
      { questionId, selectedOption: 'B' }
    ];

    const res = await request(app)
      .post('/api/v1/attempts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ examId, answers, timeTaken: 120 });

    expect(res.status).to.equal(201);
    expect(res.body.success).to.equal(true);
    expect(res.body.data).to.have.property('attempt');
    expect(res.body.data).to.have.property('feedback');
    expect(res.body.data.feedback).to.be.an('array');
    expect(res.body.data.attempt).to.have.property('score');
  });

  it('gets attempts list and attempt by exam id', async () => {
    const resList = await request(app)
      .get('/api/v1/attempts')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(resList.status).to.equal(200);
    expect(resList.body.success).to.equal(true);
    expect(resList.body.data).to.be.an('array');

    const resByExam = await request(app)
      .get(`/api/v1/attempts/${examId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(resByExam.status).to.equal(200);
    expect(resByExam.body.success).to.equal(true);
    expect(resByExam.body.data).to.have.property('exam');
  });

  it('updates and deletes the exam (admin only)', async () => {
    const resUpdate = await request(app)
      .put(`/api/v1/exams/${examId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ description: 'Updated exam description', duration: 45 });

    expect(resUpdate.status).to.equal(200);
    expect(resUpdate.body.success).to.equal(true);
    expect(resUpdate.body.data).to.have.property('description', 'Updated exam description');

    const resDelete = await request(app)
      .delete(`/api/v1/exams/${examId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect([200, 204]).to.include(resDelete.status);
  });
});
