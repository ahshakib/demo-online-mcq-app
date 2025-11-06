import { expect } from 'chai';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../app.js';
import { Payment } from '../modules/payment/payment.model.js';
import { Subscription } from '../modules/subscription/subscription.model.js';

describe('Additional Payment & Subscription routes', function () {
  this.timeout(20000);
  let mongod;
  let adminToken;
  let userToken;

  before(async () => {
    process.env.NODE_ENV = 'test';
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);

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
    delete process.env.NODE_ENV;
  });

  it('initiates payment (test-mode) and returns gateway URL', async () => {
    const reg = await request(app).post('/api/v1/users/register').send({ username: 'payuser', email: 'pay@example.com', password: 'pass' });
    expect(reg.status).to.equal(201);
    userToken = reg.body.data.token;
    const userId = reg.body.data.user._id;

    const res = await request(app)
      .post('/api/v1/payment/initiate')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ amount: 99, subscriptionType: 'basic' });

    expect(res.status).to.equal(200);
    expect(res.body.success).to.equal(true);
    expect(res.body).to.have.property('url');
    expect(res.body).to.have.property('transactionId');

    // ensure Payment doc created
    const payment = await Payment.findOne({ transactionId: res.body.transactionId });
    expect(payment).to.exist;
    expect(payment.paymentStatus).to.equal('Pending');
  });

  it('cancel route behaves like fail (marks payment Failed)', async () => {
    const reg = await request(app).post('/api/v1/users/register').send({ username: 'canceluser', email: 'c@example.com', password: 'pass' });
    expect(reg.status).to.equal(201);
    const userId = reg.body.data.user._id;

    const tranId = 'TXN_CANCEL_' + Date.now();
    await Payment.create({ user: userId, amount: 30, transactionId: tranId, subscriptionType: 'basic' });

    const res = await request(app).post('/api/v1/payment/cancel').send({ tran_id: tranId });
    expect(res.status).to.equal(200);
    expect(res.body.success).to.equal(false);
    expect(res.body.payment).to.have.property('paymentStatus', 'Failed');
  });

  it('returns subscription analytics for admin', async () => {
    // create a few subscriptions
    const reg = await request(app).post('/api/v1/users/register').send({ username: 'suser', email: 's@example.com', password: 'pass' });
    expect(reg.status).to.equal(201);
    const userId = reg.body.data.user._id;

    await Subscription.create({ user: userId, planType: 'basic', endDate: new Date(Date.now() + 1000 * 60 * 60 * 24), status: 'active', amountPaid: 10 });
    await Subscription.create({ user: userId, planType: 'premium', endDate: new Date(Date.now() - 1000 * 60 * 60 * 24), status: 'expired', amountPaid: 30 });

    const res = await request(app).get('/api/v1/subscriptions/analytics').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).to.equal(200);
    expect(res.body.success).to.equal(true);
    expect(res.body.data).to.have.property('total');
    expect(res.body.data).to.have.property('active');
    expect(res.body.data).to.have.property('expired');
  });
});
