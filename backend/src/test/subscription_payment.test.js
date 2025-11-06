import { expect } from 'chai';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../app.js';
import { Payment } from '../modules/payment/payment.model.js';
import { Subscription } from '../modules/subscription/subscription.model.js';

describe('Subscription & Payment routes integration', function () {
  this.timeout(20000);
  let mongod;
  let adminToken;
  let userToken;

  before(async () => {
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
  });

  it('handles payment success and creates subscription', async () => {
    // create a normal user
    const reg = await request(app).post('/api/v1/users/register').send({ username: 'u1', email: 'u1@example.com', password: 'pass' });
    expect(reg.status).to.equal(201);
    userToken = reg.body.data.token;
    const userId = reg.body.data.user._id;

    // Create a Payment doc that would be pending
    const tranId = 'TXN_TEST_SUCCESS_' + Date.now();
    await Payment.create({ user: userId, amount: 50, transactionId: tranId, subscriptionType: 'basic' });

    // Call success webhook/controller
    const res = await request(app).post('/api/v1/payment/success').send({ tran_id: tranId });
    expect(res.status).to.equal(200);
    expect(res.body.success).to.equal(true);
    expect(res.body.payment).to.have.property('paymentStatus', 'Success');

    // Now the subscription for the user should exist
    const subRes = await request(app).get('/api/v1/subscriptions/me').set('Authorization', `Bearer ${userToken}`);
    expect(subRes.status).to.equal(200);
    expect(subRes.body.success).to.equal(true);
    expect(subRes.body.data).to.be.an('array');
    expect(subRes.body.data.length).to.be.greaterThan(0);
    const sub = subRes.body.data[0];
    expect(sub).to.have.property('planType');
  });

  it('handles payment fail', async () => {
    // create user and payment
    const reg = await request(app).post('/api/v1/users/register').send({ username: 'u2', email: 'u2@example.com', password: 'pass' });
    expect(reg.status).to.equal(201);
    const userId = reg.body.data.user._id;

    const tranId = 'TXN_TEST_FAIL_' + Date.now();
    await Payment.create({ user: userId, amount: 30, transactionId: tranId, subscriptionType: 'basic' });

    const res = await request(app).post('/api/v1/payment/fail').send({ tran_id: tranId });
    expect(res.status).to.equal(200);
    expect(res.body.success).to.equal(false);
    expect(res.body.payment).to.have.property('paymentStatus', 'Failed');
  });

  it('expires old subscriptions (admin)', async () => {
    // create a subscription that is past due
    const reg = await request(app).post('/api/v1/users/register').send({ username: 'u3', email: 'u3@example.com', password: 'pass' });
    expect(reg.status).to.equal(201);
    const userId = reg.body.data.user._id;

    const past = new Date();
    past.setDate(past.getDate() - 10);

    await Subscription.create({ user: userId, planType: 'basic', endDate: past, status: 'active', amountPaid: 10 });

    const res = await request(app).post('/api/v1/subscriptions/expire').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).to.equal(200);
    expect(res.body.success).to.equal(true);
    // message should indicate some expired subscriptions
    expect(res.body.message).to.match(/\d+ subscriptions expired\./);
  });
});
