const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const User = require('../src/models/User.model');
const Community = require('../src/models/Community.model');
const Listing = require('../src/models/Listing.model');
const Booking = require('../src/models/Booking.model');
const DamageReport = require('../src/models/DamageReport.model');
const AuditLog = require('../src/models/AuditLog.model');

let mongoServer;
let borrower;
let owner;
let admin;
let community;
let listing;
let borrowerToken;
let ownerToken;
let adminToken;

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
  await DamageReport.deleteMany({});
  await AuditLog.deleteMany({});

  // Register Borrower
  await request(app).post('/api/v1/auth/register').send({
    name: 'Borrower User',
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
    name: 'Owner User',
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

  const adminPasswordHash = await bcrypt.hash('password123', 10);
  admin = await User.create({
    name: 'Community Admin',
    email: 'admin@example.com',
    passwordHash: adminPasswordHash,
    role: 'super_admin',
    emailVerified: true
  });
  const aLogin = await request(app).post('/api/v1/auth/login').send({
    email: 'admin@example.com',
    password: 'password123'
  });
  adminToken = aLogin.body.data.accessToken;

  community = await Community.create({
    name: 'Society B',
    slug: 'society-b',
    type: 'apartment',
    address: { line1: '456 Main', city: 'City', state: 'ST', pincode: '560001' },
    status: 'active'
  });

  listing = await Listing.create({
    ownerId: owner._id,
    communityId: community._id,
    title: 'DSLR Camera',
    description: 'Canon EOS 1500D DSLR Camera set.',
    category: 'electronics_camera',
    images: [{ url: 'https://example.com/camera.jpg' }],
    securityDeposit: 2000,
    rentalFeePerDay: 200,
    status: 'active'
  });
});

describe('Phase 4: Ratings, Trust & Disputes Integration Tests', () => {
  it('should submit a rating and increase user trust score', async () => {
    const booking = await Booking.create({
      listingId: listing._id,
      communityId: community._id,
      borrowerId: borrower._id,
      ownerId: owner._id,
      startDate: new Date(),
      endDate: new Date(),
      status: 'completed',
      depositAmount: 2000
    });

    const rateRes = await request(app)
      .post('/api/v1/ratings')
      .set('Authorization', `Bearer ${borrowerToken}`)
      .set('X-Community-Id', community._id.toString())
      .send({
        bookingId: booking._id.toString(),
        direction: 'borrower_to_owner',
        scores: { communication: 5, condition: 5, overall: 5 },
        comment: 'Great lender! Very helpful.'
      });

    expect(rateRes.statusCode).toEqual(201);
    expect(rateRes.body.success).toBe(true);

    const updatedOwner = await User.findById(owner._id);
    expect(updatedOwner.trustScore).toBeGreaterThan(80);
  });

  it('should file damage report, freeze deposit, and allow admin resolution with audit log', async () => {
    const booking = await Booking.create({
      listingId: listing._id,
      communityId: community._id,
      borrowerId: borrower._id,
      ownerId: owner._id,
      startDate: new Date(),
      endDate: new Date(),
      status: 'active',
      depositAmount: 2000,
      depositStatus: 'held'
    });

    // 1. Owner files damage report
    const reportRes = await request(app)
      .post('/api/v1/damage-reports')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('X-Community-Id', community._id.toString())
      .send({
        bookingId: booking._id.toString(),
        description: 'Camera lens scratched upon return.',
        photos: [{ url: 'https://example.com/scratch.jpg' }]
      });

    expect(reportRes.statusCode).toEqual(201);
    const reportId = reportRes.body.data._id;

    const disputedBooking = await Booking.findById(booking._id);
    expect(disputedBooking.status).toBe('disputed');
    expect(disputedBooking.depositStatus).toBe('disputed');

    // 2. Admin resolves dispute with deposit deduction
    const resolveRes = await request(app)
      .patch(`/api/v1/damage-reports/${reportId}/resolve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Community-Id', community._id.toString())
      .send({
        decision: 'deduct',
        resolutionAmount: 1500,
        note: 'Verified lens scratch. 1500 INR deducted from deposit hold.'
      });

    expect(resolveRes.statusCode).toEqual(200);
    expect(resolveRes.body.data.status).toBe('resolved_deducted');

    const finalBooking = await Booking.findById(booking._id);
    expect(finalBooking.depositStatus).toBe('deducted');
    expect(finalBooking.depositDeductionAmount).toBe(1500);

    // Verify audit log entry was created
    const logs = await AuditLog.find({ action: 'dispute.resolved' });
    expect(logs.length).toBe(1);
    expect(logs[0].targetEntityId.toString()).toBe(reportId.toString());
  });
});
