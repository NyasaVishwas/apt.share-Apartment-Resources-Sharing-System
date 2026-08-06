const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User.model');
const Community = require('../models/Community.model');
const Membership = require('../models/Membership.model');
const Listing = require('../models/Listing.model');
const logger = require('../config/logger');

const seedData = async () => {
  await connectDB();

  logger.info('Clearing existing database records...');
  await User.deleteMany({});
  await Community.deleteMany({});
  await Membership.deleteMany({});
  await Listing.deleteMany({});

  logger.info('Seeding initial data with Indian residential context...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // Super Admin
  const adminUser = await User.create({
    name: 'Platform Super Admin',
    email: 'admin@aptshare.com',
    passwordHash,
    role: 'super_admin',
    emailVerified: true,
    profileComplete: true,
    trustScore: 100
  });

  // Demo Resident User 1 (Aarav)
  const resident1 = await User.create({
    name: 'Aarav Sharma',
    email: 'aarav@example.com',
    passwordHash,
    role: 'resident',
    emailVerified: true,
    profileComplete: true,
    trustScore: 94,
    trustBadges: ['trusted_lender', 'top_borrower']
  });

  // Demo Resident User 2 (Priya)
  const resident2 = await User.create({
    name: 'Priya Patel',
    email: 'priya@example.com',
    passwordHash,
    role: 'resident',
    emailVerified: true,
    profileComplete: true,
    trustScore: 88,
    trustBadges: ['community_star']
  });

  // Demo Resident User 3 (Ananya)
  const resident3 = await User.create({
    name: 'Ananya Rao',
    email: 'ananya@example.com',
    passwordHash,
    role: 'resident',
    emailVerified: true,
    profileComplete: true,
    trustScore: 96,
    trustBadges: ['trusted_lender']
  });

  // Demo Resident User 4 (Vikram)
  const resident4 = await User.create({
    name: 'Vikram Desai',
    email: 'vikram@example.com',
    passwordHash,
    role: 'resident',
    emailVerified: true,
    profileComplete: true,
    trustScore: 92,
    trustBadges: ['top_borrower']
  });

  // Demo Community
  const community = await Community.create({
    name: 'Green Valley Heights',
    slug: 'green-valley-heights',
    type: 'apartment',
    address: {
      line1: '100 Palm Meadows Drive, Whitefield',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560066',
      country: 'India',
      location: {
        type: 'Point',
        coordinates: [77.7499, 12.9698]
      }
    },
    joinPolicy: 'admin_approval',
    status: 'active',
    requestedByUserId: adminUser._id,
    approvedByUserId: adminUser._id,
    memberCount: 4,
    activeListingCount: 8
  });

  // Memberships
  await Membership.create({
    userId: resident1._id,
    communityId: community._id,
    role: 'resident',
    status: 'active',
    unit: 'Flat A-302',
    block: 'Wing A',
    isActiveContext: true
  });

  await Membership.create({
    userId: resident2._id,
    communityId: community._id,
    role: 'resident',
    status: 'active',
    unit: 'Flat B-501',
    block: 'Wing B',
    isActiveContext: true
  });

  await Membership.create({
    userId: resident3._id,
    communityId: community._id,
    role: 'resident',
    status: 'active',
    unit: 'Flat A-504',
    block: 'Wing A',
    isActiveContext: true
  });

  await Membership.create({
    userId: resident4._id,
    communityId: community._id,
    role: 'resident',
    status: 'active',
    unit: 'Flat C-112',
    block: 'Wing C',
    isActiveContext: true
  });

  // Sample Shared Listings
  await Listing.create([
    {
      ownerId: resident1._id,
      communityId: community._id,
      title: 'Bosch Professional Cordless Impact Drill GSB 18V-55',
      description: 'Heavy duty brushless impact drill driver set. Includes 2x 4.0Ah batteries, fast charger, and 35-piece masonry/metal drill bit kit.',
      category: 'tools_diy',
      images: [
        { url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&auto=format&fit=crop&q=80', order: 0 }
      ],
      brand: 'Bosch',
      condition: 'like_new',
      purchaseYear: 2024,
      securityDeposit: 1500,
      rentalFeePerDay: 0,
      maxBorrowDurationDays: 5,
      pickupInstructions: 'Pick up at Wing A, Flat A-302 after 6 PM on weekdays.',
      usageInstructions: 'Please ensure battery is fully charged before returning. Do not use on reinforced concrete columns.',
      accessoriesIncluded: ['2x 18V Batteries', 'Fast Charger', 'Carry Case', 'Drill Bit Set'],
      tags: ['drill', 'powertool', 'diy', 'bosch', 'repair'],
      status: 'active',
      averageRating: 4.9,
      ratingCount: 8
    },
    {
      ownerId: resident2._id,
      communityId: community._id,
      title: 'Kärcher K3 High Pressure Washer (120 Bar)',
      description: 'Powerful pressure washer for deep cleaning balcony tiles, car wash, patio furniture, and window shutters. Quick connect spray gun included.',
      category: 'cleaning_equipment',
      images: [
        { url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80', order: 0 }
      ],
      brand: 'Kärcher',
      condition: 'good',
      purchaseYear: 2023,
      securityDeposit: 2000,
      rentalFeePerDay: 150,
      maxBorrowDurationDays: 3,
      pickupInstructions: 'Wing B, Flat B-501. Ring doorbell anytime weekend mornings.',
      usageInstructions: 'Connect to standard 1/2 inch garden hose. Drain water completely before returning.',
      accessoriesIncluded: ['High Pressure Hose (6m)', 'Dirt Blaster Lance', 'Foam Nozzle'],
      tags: ['pressurewasher', 'cleaning', 'carwash', 'patio'],
      status: 'active',
      averageRating: 4.8,
      ratingCount: 12
    },
    {
      ownerId: resident3._id,
      communityId: community._id,
      title: 'DJI Mini 3 Pro Drone with Fly More Combo',
      description: 'Lightweight 4K HDR camera drone under 249g. Includes RC controller with built-in screen, 3 intelligent flight batteries, and shoulder bag.',
      category: 'electronics_camera',
      images: [
        { url: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80', order: 0 }
      ],
      brand: 'DJI',
      condition: 'like_new',
      purchaseYear: 2024,
      securityDeposit: 5000,
      rentalFeePerDay: 500,
      maxBorrowDurationDays: 4,
      pickupInstructions: 'Wing A, Flat A-504. In-person demonstration provided upon pickup.',
      usageInstructions: 'Do not fly in strong winds (>25 km/h) or heavy rain. Keep within line of sight.',
      accessoriesIncluded: ['DJI RC', '3x Flight Batteries', 'Charging Hub', 'Carry Bag', 'Spare Propellers'],
      tags: ['drone', 'dji', 'photography', '4k', 'travel'],
      status: 'active',
      averageRating: 5.0,
      ratingCount: 6
    },
    {
      ownerId: resident4._id,
      communityId: community._id,
      title: 'Coleman 4-Person Waterproof Camping Tent & Sleeping Bags',
      description: 'Spacious WeatherTec dome tent with setup under 10 minutes. Includes 2 insulated sleeping bags and rechargeable LED camping lantern.',
      category: 'outdoor_camping',
      images: [
        { url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&auto=format&fit=crop&q=80', order: 0 }
      ],
      brand: 'Coleman',
      condition: 'good',
      purchaseYear: 2023,
      securityDeposit: 1200,
      rentalFeePerDay: 100,
      maxBorrowDurationDays: 7,
      pickupInstructions: 'Wing C, Flat C-112. Pick up prior to your weekend trek.',
      usageInstructions: 'Ensure tent is completely dry before packing into carry bag to prevent mold.',
      accessoriesIncluded: ['Tent Stakes', 'Rainfly', '2x Sleeping Bags', 'LED Lantern'],
      tags: ['camping', 'tent', 'outdoor', 'trekking', 'coleman'],
      status: 'active',
      averageRating: 4.7,
      ratingCount: 5
    },
    {
      ownerId: resident1._id,
      communityId: community._id,
      title: 'Instant Pot Duo 7-in-1 Electric Pressure Cooker (6L)',
      description: 'Multi-use programmable pressure cooker, slow cooker, rice cooker, steamer, and yogurt maker. Perfect for hosting large family dinners.',
      category: 'kitchen_appliances',
      images: [
        { url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80', order: 0 }
      ],
      brand: 'Instant Pot',
      condition: 'like_new',
      purchaseYear: 2024,
      securityDeposit: 1000,
      rentalFeePerDay: 0,
      maxBorrowDurationDays: 3,
      pickupInstructions: 'Wing A, Flat A-302. Available weekdays.',
      usageInstructions: 'Wash inner stainless steel pot with non-abrasive sponge. Do not submerge electric heating base.',
      accessoriesIncluded: ['Steam Rack', 'Ladle', 'Measuring Cup', 'Recipe Booklet'],
      tags: ['instantpot', 'cooking', 'kitchen', 'party'],
      status: 'active',
      averageRating: 5.0,
      ratingCount: 4
    },
    {
      ownerId: resident2._id,
      communityId: community._id,
      title: 'JBL PartyBox 310 Portable Bluetooth Party Speaker',
      description: '240W powerful JBL Pro sound with dynamic light show, built-in karaoke inputs, and splashproof IPX4 design for poolside parties.',
      category: 'party_events',
      images: [
        { url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80', order: 0 }
      ],
      brand: 'JBL',
      condition: 'like_new',
      purchaseYear: 2024,
      securityDeposit: 3000,
      rentalFeePerDay: 300,
      maxBorrowDurationDays: 2,
      pickupInstructions: 'Wing B, Flat B-501. Wheels and telescopic handle make it easy to roll to clubhouse.',
      usageInstructions: 'Maintain moderate volume after 10 PM in residential zones per society guidelines.',
      accessoriesIncluded: ['AC Power Cord', 'Wired Karaoke Mic'],
      tags: ['jbl', 'speaker', 'party', 'bluetooth', 'music'],
      status: 'active',
      averageRating: 4.9,
      ratingCount: 15
    },
    {
      ownerId: resident3._id,
      communityId: community._id,
      title: 'Chicco Next2Me Side Sleeping Baby Crib',
      description: 'Co-sleeping crib with adjustable height and breathable mesh windows. Cleaned and sanitized with hypoallergenic baby detergent.',
      category: 'baby_kids',
      images: [
        { url: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&auto=format&fit=crop&q=80', order: 0 }
      ],
      brand: 'Chicco',
      condition: 'good',
      purchaseYear: 2023,
      securityDeposit: 2000,
      rentalFeePerDay: 50,
      maxBorrowDurationDays: 14,
      pickupInstructions: 'Wing A, Flat A-504.',
      usageInstructions: 'Use fitted sheet provided. Suitable for infants up to 9kg.',
      accessoriesIncluded: ['Padded Mattress', 'Travel Bag', '2x Fitted Sheets'],
      tags: ['baby', 'crib', 'chicco', 'kids'],
      status: 'active',
      averageRating: 4.8,
      ratingCount: 3
    },
    {
      ownerId: resident4._id,
      communityId: community._id,
      title: 'Decathlon Table Tennis Portable Rollnet Set',
      description: 'Attaches in 10 seconds to any household dining table (up to 1.7m wide). Includes 4 bats and 12 ITTF approved 3-star balls.',
      category: 'sports_fitness',
      images: [
        { url: 'https://images.unsplash.com/photo-1534158914592-062992fbe900?w=800&auto=format&fit=crop&q=80', order: 0 }
      ],
      brand: 'Decathlon',
      condition: 'like_new',
      purchaseYear: 2024,
      securityDeposit: 500,
      rentalFeePerDay: 0,
      maxBorrowDurationDays: 5,
      pickupInstructions: 'Wing C, Flat C-112.',
      usageInstructions: 'Keep bats in protective case when not playing.',
      accessoriesIncluded: ['Rollnet', '4x Bats', '12x TT Balls', 'Mesh Carry Case'],
      tags: ['tabletennis', 'sports', 'decathlon', 'indoor'],
      status: 'active',
      averageRating: 5.0,
      ratingCount: 9
    }
  ]);

  logger.info('Database seeded successfully with Indian residential context!');
  logger.info(`Demo Login: aarav@example.com / password123`);
  logger.info(`Admin Login: admin@aptshare.com / password123`);

  process.exit(0);
};

seedData().catch((err) => {
  logger.error(`Seeding failed: ${err.message}`);
  process.exit(1);
});
