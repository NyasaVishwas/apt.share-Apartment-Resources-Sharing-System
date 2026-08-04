const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const User = require('../src/models/User.model');
const Community = require('../src/models/Community.model');
const Listing = require('../src/models/Listing.model');
const PriorityQueue = require('../src/utils/priorityQueue');

let mongoServer;
let borrower;
let owner;
let community;
let listing;
let borrowerToken;
let ownerToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Community.deleteMany({});
  await Listing.deleteMany({});

  // Register Borrower
  await request(app).post('/api/v1/auth/register').send({
    name: 'Borrower',
    email: 'borrower@example.com',
    password: 'password123'
  });
  await User.updateOne({ email: 'borrower@example.com' }, { emailVerified: true });
  const bLogin = await request(app).post('/api/v1/auth/login').send({
    email: 'borrower@example.com',
    password: 'password123'
  });
  borrowerToken = bLogin.body.data.accessToken;
  borrower = bLogin.body.data.user;

  // Register Owner
  await request(app).post('/api/v1/auth/register').send({
    name: 'Owner',
    email: 'owner@example.com',
    password: 'password123'
  });
  await User.updateOne({ email: 'owner@example.com' }, { emailVerified: true });
  const oLogin = await request(app).post('/api/v1/auth/login').send({
    email: 'owner@example.com',
    password: 'password123'
  });
  ownerToken = oLogin.body.data.accessToken;
  owner = oLogin.body.data.user;

  community = await Community.create({
    name: 'Society C',
    slug: 'society-c',
    type: 'apartment',
    address: { line1: '789 Main', city: 'City', state: 'ST', pincode: '560001' },
    status: 'active'
  });

  listing = await Listing.create({
    ownerId: owner._id,
    communityId: community._id,
    title: 'Camping Tent',
    description: '4-person waterproof tent.',
    category: 'outdoor_camping',
    images: [{ url: 'https://example.com/tent.jpg' }],
    securityDeposit: 1000,
    status: 'active'
  });
});

describe('Phase 5: Real-time Chat & Notifications Integration Tests', () => {
  it('should test Min-Heap Priority Queue ordering', () => {
    const pq = new PriorityQueue();
    pq.enqueue('Notif C', 30);
    pq.enqueue('Notif A', 10);
    pq.enqueue('Notif B', 20);

    expect(pq.dequeue()).toBe('Notif A');
    expect(pq.dequeue()).toBe('Notif B');
    expect(pq.dequeue()).toBe('Notif C');
  });

  it('should create chat thread and send messages between residents', async () => {
    // 1. Borrower creates inquiry thread for listing
    const threadRes = await request(app)
      .post('/api/v1/chat/threads')
      .set('Authorization', `Bearer ${borrowerToken}`)
      .set('X-Community-Id', community._id.toString())
      .send({ listingId: listing._id.toString() });

    expect(threadRes.statusCode).toEqual(200);
    const threadId = threadRes.body.data._id;

    // 2. Borrower sends message
    const msgRes = await request(app)
      .post(`/api/v1/chat/threads/${threadId}/messages`)
      .set('Authorization', `Bearer ${borrowerToken}`)
      .set('X-Community-Id', community._id.toString())
      .send({ body: 'Hi, is this tent available for this weekend?' });

    expect(msgRes.statusCode).toEqual(201);
    expect(msgRes.body.data.body).toBe('Hi, is this tent available for this weekend?');

    // 3. Verify notification received by owner
    const notifRes = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('X-Community-Id', community._id.toString());

    expect(notifRes.statusCode).toEqual(200);
    expect(notifRes.body.data.length).toBeGreaterThan(0);
    expect(notifRes.body.data[0].type).toBe('chat_message');
  });
});
