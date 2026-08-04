const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const User = require('../src/models/User.model');
const Community = require('../src/models/Community.model');
const Listing = require('../src/models/Listing.model');
const Booking = require('../src/models/Booking.model');

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
  await Booking.deleteMany({});

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
    name: 'Society A',
    slug: 'society-a',
    type: 'apartment',
    address: { line1: '123 Main', city: 'City', state: 'ST', pincode: '560001' },
    status: 'active'
  });

  listing = await Listing.create({
    ownerId: owner._id,
    communityId: community._id,
    title: 'High Power Pressure Washer',
    description: '150 Bar Karcher pressure washer for tiles and cars.',
    category: 'cleaning_equipment',
    images: [{ url: 'https://example.com/washer.jpg' }],
    securityDeposit: 1500,
    rentalFeePerDay: 100,
    maxBorrowDurationDays: 5,
    status: 'active'
  });
});

describe('Booking Core & State Machine Integration Tests', () => {
  it('should run full Request -> Approve -> Pickup Scan -> Return Scan cycle', async () => {
    const startDate = new Date(Date.now() + 86400000).toISOString(); // Tomorrow
    const endDate = new Date(Date.now() + 3 * 86400000).toISOString(); // +3 days

    // 1. Borrower requests booking
    const reqRes = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${borrowerToken}`)
      .set('X-Community-Id', community._id.toString())
      .send({
        listingId: listing._id.toString(),
        startDate,
        endDate,
        requestMessage: 'Need for weekend balcony cleaning'
      });

    expect(reqRes.statusCode).toEqual(201);
    expect(reqRes.body.data.status).toBe('pending');
    const bookingId = reqRes.body.data._id;

    // 2. Interval overlap check: another borrower requesting overlapping dates should fail
    const overlapRes = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${borrowerToken}`)
      .set('X-Community-Id', community._id.toString())
      .send({
        listingId: listing._id.toString(),
        startDate,
        endDate
      });

    expect(overlapRes.statusCode).toEqual(400);
    expect(overlapRes.body.error.code).toBe('BOOKING_OVERLAP');

    // 3. Owner approves booking
    const approveRes = await request(app)
      .patch(`/api/v1/bookings/${bookingId}/approve`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('X-Community-Id', community._id.toString());

    expect(approveRes.statusCode).toEqual(200);
    expect(approveRes.body.data.status).toBe('confirmed');

    // 4. Fetch Pickup QR Token
    const qrRes = await request(app)
      .get(`/api/v1/bookings/${bookingId}/qr/pickup`)
      .set('Authorization', `Bearer ${borrowerToken}`)
      .set('X-Community-Id', community._id.toString());

    expect(qrRes.statusCode).toEqual(200);
    const rawPickupToken = qrRes.body.data.rawToken;

    // 5. Owner scans Pickup QR
    const pickupScanRes = await request(app)
      .post(`/api/v1/bookings/${bookingId}/pickup-scan`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('X-Community-Id', community._id.toString())
      .send({ rawToken: rawPickupToken });

    expect(pickupScanRes.statusCode).toEqual(200);
    expect(pickupScanRes.body.data.status).toBe('active');

    // 6. Fetch Return QR Token
    const returnQrRes = await request(app)
      .get(`/api/v1/bookings/${bookingId}/qr/return`)
      .set('Authorization', `Bearer ${borrowerToken}`)
      .set('X-Community-Id', community._id.toString());

    expect(returnQrRes.statusCode).toEqual(200);
    const rawReturnToken = returnQrRes.body.data.rawToken;

    // 7. Owner scans Return QR
    const returnScanRes = await request(app)
      .post(`/api/v1/bookings/${bookingId}/return-scan`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('X-Community-Id', community._id.toString())
      .send({ rawToken: rawReturnToken });

    expect(returnScanRes.statusCode).toEqual(200);
    expect(returnScanRes.body.data.status).toBe('completed');
    expect(returnScanRes.body.data.depositStatus).toBe('released');
  });
});
