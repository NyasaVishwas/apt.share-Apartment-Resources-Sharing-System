const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const User = require('../src/models/User.model');
const Community = require('../src/models/Community.model');
const Listing = require('../src/models/Listing.model');
const Booking = require('../src/models/Booking.model');
const MaxHeap = require('../src/utils/heap');
const CategoryAffinityGraph = require('../src/utils/graph');

let mongoServer;
let adminToken;
let userToken;
let community;
let user;

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
  await Booking.deleteMany({});

  const passwordHash = await bcrypt.hash('password123', 10);
  const admin = await User.create({
    name: 'Platform Admin',
    email: 'admin@platform.com',
    passwordHash,
    role: 'super_admin',
    emailVerified: true
  });

  const normalUser = await User.create({
    name: 'Normal User',
    email: 'user@example.com',
    passwordHash,
    role: 'resident',
    emailVerified: true
  });
  user = normalUser;

  const aLogin = await request(app).post('/api/v1/auth/login').send({
    email: 'admin@platform.com',
    password: 'password123'
  });
  adminToken = aLogin.body.data.accessToken;

  const uLogin = await request(app).post('/api/v1/auth/login').send({
    email: 'user@example.com',
    password: 'password123'
  });
  userToken = uLogin.body.data.accessToken;

  community = await Community.create({
    name: 'Pending Heights',
    slug: 'pending-heights',
    type: 'apartment',
    address: { line1: '789 Main St', city: 'Metropolis', state: 'ST', pincode: '560001' },
    status: 'pending',
    requestedByUserId: normalUser._id
  });
});

describe('Phase 6: Feed, Analytics & Admin Integration Tests', () => {
  it('should test Max-Heap algorithm ordering', () => {
    const heap = new MaxHeap();
    heap.insert('User A', 5);
    heap.insert('User B', 25);
    heap.insert('User C', 12);

    expect(heap.extractMax()).toBe('User B');
    expect(heap.extractMax()).toBe('User C');
    expect(heap.extractMax()).toBe('User A');
  });

  it('should test Graph BFS related categories traversal', () => {
    const graph = new CategoryAffinityGraph();
    const related = graph.getRelatedCategoriesBFS('tools_diy', 1);
    expect(related).toContain('tools_diy');
    expect(related).toContain('cleaning_equipment');
  });

  it('should allow Super Admin to approve a pending community', async () => {
    const res = await request(app)
      .patch(`/api/v1/platform/communities/${community._id}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('active');

    const updated = await Community.findById(community._id);
    expect(updated.status).toBe('active');
  });

  it('should compute personal analytics impact metrics', async () => {
    const listing = await Listing.create({
      ownerId: adminToken ? community.requestedByUserId : user._id,
      communityId: community._id,
      title: 'Bosch Cordless Drill',
      description: 'Heavy duty drill',
      category: 'tools_diy',
      images: [{ url: 'https://example.com/drill.jpg' }],
      securityDeposit: 2000,
      rentalFeePerDay: 200,
      status: 'active'
    });

    await Booking.create({
      listingId: listing._id,
      communityId: community._id,
      borrowerId: user._id,
      ownerId: community.requestedByUserId,
      startDate: new Date(),
      endDate: new Date(),
      status: 'completed',
      depositAmount: 2000,
      rentalFeeAmount: 200
    });

    const res = await request(app)
      .get('/api/v1/analytics/me')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.metrics.itemsBorrowed).toBe(1);
    expect(res.body.data.metrics.moneySaved).toBeGreaterThan(0);
    expect(res.body.data.metrics.co2Saved).toBe(15);
  });
});
