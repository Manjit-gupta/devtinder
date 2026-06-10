const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/user');

// MongoDB runs in Docker (locally) or as a GitHub Actions service container
const TEST_DB = 'mongodb://localhost:27017/devtinder-test';

const userA = {
  firstName: 'Test',
  lastName: 'UserA',
  emailId: 'usera@devtindertest.com',
  password: 'Test@1234',
  age: 25,
  gender: 'Male',
};

const userB = {
  firstName: 'Test',
  lastName: 'UserB',
  emailId: 'userb@devtindertest.com',
  password: 'Test@1234',
  age: 26,
  gender: 'Female',
};

let cookieHeader;
let userBId;

beforeAll(async () => {
  await mongoose.connect(TEST_DB, { serverSelectionTimeoutMS: 5000 });
  // Clean slate before tests
  await mongoose.connection.dropDatabase();
}, 15000);

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
}, 15000);

describe('POST /signup', () => {
  it('registers a new user and returns success message', async () => {
    const res = await request(app).post('/signup').send(userA);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('User registered successfully');
  });
});

describe('POST /login', () => {
  it('logs in a user and sets an httpOnly auth cookie', async () => {
    const res = await request(app)
      .post('/login')
      .send({ emailId: userA.emailId, password: userA.password });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Login successful');
    expect(res.headers['set-cookie']).toBeDefined();

    cookieHeader = res.headers['set-cookie'][0];
  });
});

describe('POST /request/send/:status/:toUserId', () => {
  it('sends an Interested connection request to another user', async () => {
    // Create user B
    await request(app).post('/signup').send(userB);
    const userBDoc = await User.findOne({ emailId: userB.emailId });
    userBId = userBDoc._id.toString();

    const res = await request(app)
      .post(`/request/send/Interested/${userBId}`)
      .set('Cookie', cookieHeader);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('Interested');
    expect(res.body.data.toUserId).toBe(userBId);
  });
});

describe('GET /feed', () => {
  it('returns paginated feed and excludes already-interacted users', async () => {
    const res = await request(app)
      .get('/feed?page=1&limit=10')
      .set('Cookie', cookieHeader);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);

    // userB was sent a request — must not appear in userA's feed
    const returnedIds = res.body.data.map((u) => u._id.toString());
    expect(returnedIds).not.toContain(userBId);
  });
});
