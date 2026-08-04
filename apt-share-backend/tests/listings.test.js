const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const User = require('../src/models/User.model');
const Community = require('../src/models/Community.model');
const Listing = require('../src/models/Listing.model');

let mongoServer;
let user;
let community;
let accessToken;

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

  // Setup test user & community
  const regRes = await request(app).post('/api/v1/auth/register').send({
    name: 'Listing Tester',
    email: 'tester@example.com',
    password: 'password123'
  });

  await User.updateOne({ email: 'tester@example.com' }, { emailVerified: true });

  const loginRes = await request(app).post('/api/v1/auth/login').send({
    email: 'tester@example.com',
    password: 'password123'
  });

  accessToken = loginRes.body.data.accessToken;
  user = loginRes.body.data.user;

  community = await Community.create({
    name: 'Test Society',
    slug: 'test-society',
    type: 'apartment',
    address: { line1: '123 Test St', city: 'Metropolis', state: 'State', pincode: '560001' },
    status: 'active'
  });
});

describe('Listings Module API Tests', () => {
  describe('POST /api/v1/listings', () => {
    it('should create a new listing when authenticated', async () => {
      const res = await request(app)
        .post('/api/v1/listings')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('X-Community-Id', community._id.toString())
        .send({
          title: 'DeWalt Cordless Saw',
          description: 'High performance circular saw with laser guide.',
          category: 'tools_diy',
          images: [{ url: 'https://example.com/saw.jpg' }],
          securityDeposit: 1000,
          rentalFeePerDay: 50
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('DeWalt Cordless Saw');

      const saved = await Listing.findById(res.body.data._id);
      expect(saved).not.toBeNull();
      expect(saved.category).toBe('tools_diy');
    });
  });

  describe('GET /api/v1/listings', () => {
    it('should fetch community listings with filters', async () => {
      await Listing.create({
        ownerId: user._id,
        communityId: community._id,
        title: 'Camping Stove',
        description: 'Dual burner portable stove.',
        category: 'outdoor_camping',
        images: [{ url: 'https://example.com/stove.jpg' }],
        securityDeposit: 500,
        status: 'active'
      });

      const res = await request(app)
        .get('/api/v1/listings?category=outdoor_camping')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('X-Community-Id', community._id.toString());

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].title).toBe('Camping Stove');
    });
  });
});
