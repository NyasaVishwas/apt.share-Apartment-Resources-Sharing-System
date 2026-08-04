# apt.share — Part 4: Database Design, MongoDB Collections & ER Diagram

Database: **MongoDB** via **Mongoose**. Naming convention: collections plural, camelCase fields, `_id` ObjectId PKs, explicit `createdAt`/`updatedAt` (Mongoose timestamps).

---

## 11. Complete Database Schema (MongoDB Collections)

### 11.1 `users`

```js
{
  _id: ObjectId,
  name: String,                    // required
  email: String,                   // required, unique, lowercase
  passwordHash: String,             // bcrypt hash, never returned by API
  phone: String,
  phoneVerified: Boolean,           // default false
  emailVerified: Boolean,           // default false
  avatarUrl: String,                // Cloudinary secure_url
  avatarPublicId: String,           // Cloudinary public_id (for deletion)
  role: String,                     // enum: 'resident' | 'community_admin' | 'super_admin'
                                     // NOTE: community_admin is also expressed per-membership (see 11.3);
                                     // this top-level role flag is for super_admin only in practice.
  profileComplete: Boolean,         // default false
  bio: String,
  trustScore: Number,               // 0-100, denormalized cache, recomputed on events (see 11.11)
  trustBadges: [String],            // e.g. ['trusted_lender', 'community_star']
  notificationPreferences: {
    emailBookingUpdates: Boolean,   // default true
    emailWishlistAlerts: Boolean,   // default true
    emailReturnReminders: Boolean,  // default true
    emailMarketing: Boolean         // default false
  },
  refreshTokens: [{
    tokenHash: String,              // hashed, not raw
    createdAt: Date,
    expiresAt: Date,
    userAgent: String
  }],
  otp: {
    codeHash: String,
    purpose: String,                // 'email_verification' | 'password_reset'
    expiresAt: Date,
    attempts: Number
  },
  status: String,                   // 'active' | 'suspended' | 'deleted'
  failedLoginAttempts: Number,      // default 0
  lockoutUntil: Date,
  createdAt: Date,
  updatedAt: Date
}
```
Indexes: `{ email: 1 } unique`, `{ status: 1 }`.

### 11.2 `communities`

```js
{
  _id: ObjectId,
  name: String,                     // "Green Valley Apartments"
  slug: String,                     // unique, url-safe
  type: String,                     // 'apartment' | 'gated_society' | 'hostel' | 'office_campus' | 'coworking'
  address: { line1: String, city: String, state: String, pincode: String, country: String,
             location: { type: 'Point', coordinates: [Number, Number] } }, // GeoJSON, for "Near Me"
  logoUrl: String,
  coverImageUrl: String,
  joinPolicy: String,               // 'admin_approval' | 'domain_auto_join' | 'invite_code'
  allowedEmailDomain: String,       // used if domain_auto_join
  inviteCode: String,               // used if invite_code policy
  status: String,                   // 'pending' | 'active' | 'suspended' | 'rejected'
  requestedByUserId: ObjectId,      // ref users, the founding admin applicant
  approvedByUserId: ObjectId,       // ref users (super_admin who approved)
  memberCount: Number,              // denormalized counter
  activeListingCount: Number,       // denormalized counter
  createdAt: Date,
  updatedAt: Date
}
```
Indexes: `{ slug: 1 } unique`, `{ status: 1 }`, `{ 'address.location': '2dsphere' }`.

### 11.3 `memberships`

```js
{
  _id: ObjectId,
  userId: ObjectId,                 // ref users
  communityId: ObjectId,            // ref communities
  role: String,                     // 'resident' | 'community_admin'
  status: String,                   // 'pending' | 'active' | 'rejected' | 'removed'
  unit: String,                     // "B-402"
  block: String,
  joinedAt: Date,
  approvedByUserId: ObjectId,
  isActiveContext: Boolean          // marks the user's currently-selected community in multi-community UI (client hint, not authoritative)
}
```
Indexes: `{ userId: 1, communityId: 1 } unique`, `{ communityId: 1, status: 1 }`.

### 11.4 `listings`

```js
{
  _id: ObjectId,
  ownerId: ObjectId,                // ref users
  communityId: ObjectId,            // ref communities
  title: String,
  description: String,
  category: String,                 // enum, see category taxonomy below
  images: [{ url: String, publicId: String, order: Number }],
  brand: String,
  condition: String,                // 'new' | 'like_new' | 'good' | 'fair' | 'worn'
  purchaseYear: Number,
  securityDeposit: Number,          // amount in local currency (paise/cents precision as integer)
  rentalFeePerDay: Number,          // 0 = free
  maxBorrowDurationDays: Number,
  pickupInstructions: String,
  usageInstructions: String,
  accessoriesIncluded: [String],
  tags: [String],
  blackoutDates: [{ start: Date, end: Date, reason: String }],
  status: String,                   // 'draft' | 'active' | 'paused' | 'under_maintenance' | 'removed'
  viewCount: Number,                // denormalized, for trending/popularity
  bookingCount: Number,             // denormalized, completed bookings count
  averageRating: Number,            // denormalized cache from ratings
  ratingCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```
Indexes: `{ communityId: 1, status: 1, createdAt: -1 }`, `{ communityId: 1, category: 1 }`,
text index on `{ title: 'text', description: 'text', tags: 'text', brand: 'text' }`.

**Category taxonomy (enum):** `tools_diy, cleaning_equipment, electronics_camera, outdoor_camping, party_events, kitchen_appliances, baby_kids, sports_fitness, furniture, other`.

### 11.5 `bookings`

```js
{
  _id: ObjectId,
  listingId: ObjectId,              // ref listings
  communityId: ObjectId,            // denormalized for query scoping
  borrowerId: ObjectId,             // ref users
  ownerId: ObjectId,                // ref users, denormalized from listing at booking time
  startDate: Date,
  endDate: Date,                    // expected return date
  status: String,                   // 'pending' | 'confirmed' | 'active' | 'completed' | 'declined' | 'cancelled' | 'disputed'
  requestMessage: String,
  declineReason: String,
  cancellationReason: String,
  cancelledByUserId: ObjectId,
  depositAmount: Number,            // snapshot from listing at request time
  rentalFeeAmount: Number,          // snapshot, computed = rentalFeePerDay * days
  depositStatus: String,            // 'not_applicable' | 'held' | 'released' | 'deducted' | 'disputed'
  depositDeductionAmount: Number,
  pickupQrToken: { tokenHash: String, expiresAt: Date, used: Boolean },
  returnQrToken: { tokenHash: String, expiresAt: Date, used: Boolean },
  pickupConfirmedAt: Date,
  returnConfirmedAt: Date,
  preConditionPhotos: [{ url: String, publicId: String }],
  postConditionPhotos: [{ url: String, publicId: String }],
  autoDeclineAt: Date,              // scheduler target for FR-BOOK-03
  lateReturnFlagged: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```
Indexes: `{ listingId: 1, startDate: 1, endDate: 1 }` (overlap checks), `{ communityId: 1, status: 1 }`,
`{ borrowerId: 1, status: 1 }`, `{ ownerId: 1, status: 1 }`, `{ autoDeclineAt: 1 }` (scheduler sweep),
`{ endDate: 1, status: 1 }` (late-return sweep).

### 11.6 `chatThreads`

```js
{
  _id: ObjectId,
  communityId: ObjectId,
  bookingId: ObjectId,              // nullable — pre-booking inquiry threads have no bookingId yet
  listingId: ObjectId,              // present for pre-booking inquiry context
  participantIds: [ObjectId],       // exactly 2 for MVP
  lastMessageAt: Date,
  lastMessagePreview: String,
  createdAt: Date
}
```

### 11.7 `chatMessages`

```js
{
  _id: ObjectId,
  threadId: ObjectId,
  senderId: ObjectId,
  body: String,
  imageUrl: String,
  imagePublicId: String,
  readBy: [ObjectId],
  createdAt: Date
}
```
Indexes: `{ threadId: 1, createdAt: 1 }`.

### 11.8 `notifications`

```js
{
  _id: ObjectId,
  userId: ObjectId,
  communityId: ObjectId,
  type: String,                     // 'booking_requested' | 'booking_approved' | 'booking_declined' |
                                     // 'pickup_reminder' | 'return_reminder' | 'late_return' |
                                     // 'wishlist_available' | 'deposit_released' | 'dispute_filed' |
                                     // 'dispute_resolved' | 'announcement' | 'rating_received'
  title: String,
  body: String,
  relatedEntityType: String,        // 'booking' | 'listing' | 'dispute' | 'announcement'
  relatedEntityId: ObjectId,
  read: Boolean,                    // default false
  emailSent: Boolean,
  createdAt: Date
}
```
Indexes: `{ userId: 1, read: 1, createdAt: -1 }`.

### 11.9 `wishlists`

```js
{
  _id: ObjectId,
  userId: ObjectId,
  communityId: ObjectId,
  listingId: ObjectId,              // nullable if category-level wishlist
  category: String,                 // nullable if listing-level wishlist
  createdAt: Date
}
```
Indexes: `{ userId: 1, communityId: 1 }`, `{ listingId: 1 }`, `{ communityId: 1, category: 1 }`.

### 11.10 `ratings`

```js
{
  _id: ObjectId,
  bookingId: ObjectId,
  communityId: ObjectId,
  raterUserId: ObjectId,
  rateeUserId: ObjectId,            // nullable if this is an item-only rating
  listingId: ObjectId,              // present for item ratings
  direction: String,                // 'borrower_to_owner' | 'owner_to_borrower' | 'borrower_to_item'
  scores: {
    communication: Number,          // 1-5
    condition: Number,              // 1-5 (item condition, applicable to item/owner ratings)
    overall: Number                 // 1-5
  },
  comment: String,
  createdAt: Date
}
```
Indexes: `{ bookingId: 1, direction: 1 } unique`, `{ rateeUserId: 1 }`, `{ listingId: 1 }`.

### 11.11 `trustScoreEvents` (append-only ledger feeding the denormalized `users.trustScore`)

```js
{
  _id: ObjectId,
  userId: ObjectId,
  communityId: ObjectId,
  eventType: String,                // 'successful_return' | 'rating_received' | 'complaint' |
                                     // 'damage_incident' | 'late_return' | 'completed_transaction'
  scoreDelta: Number,
  relatedBookingId: ObjectId,
  createdAt: Date
}
```
Indexes: `{ userId: 1, createdAt: -1 }`.

### 11.12 `damageReports`

```js
{
  _id: ObjectId,
  bookingId: ObjectId,
  communityId: ObjectId,
  reportedByUserId: ObjectId,
  againstUserId: ObjectId,
  description: String,
  photos: [{ url: String, publicId: String }],
  status: String,                   // 'open' | 'under_review' | 'resolved_deducted' | 'resolved_dismissed'
  resolutionAmount: Number,
  resolvedByUserId: ObjectId,       // community_admin
  resolutionNote: String,
  createdAt: Date,
  resolvedAt: Date
}
```
Indexes: `{ communityId: 1, status: 1 }`, `{ bookingId: 1 }`.

### 11.13 `announcements`

```js
{
  _id: ObjectId,
  communityId: ObjectId,
  authorUserId: ObjectId,           // community_admin
  title: String,
  body: String,
  pinned: Boolean,
  createdAt: Date
}
```

### 11.14 `auditLogs` (immutable, append-only)

```js
{
  _id: ObjectId,
  communityId: ObjectId,            // nullable for platform-level actions
  actorUserId: ObjectId,
  actorRole: String,
  action: String,                   // e.g. 'dispute.resolved', 'listing.removed', 'community.approved'
  targetEntityType: String,
  targetEntityId: ObjectId,
  metadata: Object,                 // free-form snapshot of relevant before/after state
  ipAddress: String,
  createdAt: Date
}
```
Indexes: `{ communityId: 1, createdAt: -1 }`, `{ actorUserId: 1, createdAt: -1 }`.

### 11.15 `reports` (generated PDF artifacts)

```js
{
  _id: ObjectId,
  communityId: ObjectId,
  requestedByUserId: ObjectId,
  type: String,                     // 'inventory' | 'bookings' | 'transactions' | 'community_stats'
  dateRangeStart: Date,
  dateRangeEnd: Date,
  status: String,                   // 'queued' | 'processing' | 'ready' | 'failed'
  fileUrl: String,                  // Cloudinary or S3 URL once generated
  createdAt: Date,
  completedAt: Date
}
```

### 11.16 `analyticsSnapshots` (scheduled aggregation cache — see FR-ANALYTICS-03)

```js
{
  _id: ObjectId,
  scope: String,                    // 'community' | 'user'
  communityId: ObjectId,
  userId: ObjectId,                 // present if scope = 'user'
  periodStart: Date,
  periodEnd: Date,
  metrics: Object,                  // e.g. { moneySaved, co2Saved, itemsBorrowed, itemsLent, ... }
  computedAt: Date
}
```
Indexes: `{ communityId: 1, scope: 1, periodEnd: -1 }`.

---

## 12. ER Diagram Description

Since this is a document-oriented (MongoDB) schema, relationships are expressed via referenced ObjectIds rather than foreign keys, with selective denormalization for read performance (e.g., `communityId` and `ownerId` copied onto `bookings` to avoid extra lookups on hot paths).

**Core entity relationships:**

- `User (1) —— (N) Membership (N) —— (1) Community` — many-to-many join collection carrying role/status/unit.
- `User (1) —— (N) Listing` — a user owns many listings; `Listing (N) —— (1) Community`.
- `Listing (1) —— (N) Booking` — a listing has many bookings over time, but **no two active/confirmed bookings may overlap in date range** (enforced at the service layer, see Part 7 Interval Scheduling).
- `Booking (N) —— (1) User [borrowerId]`, `Booking (N) —— (1) User [ownerId]`.
- `Booking (1) —— (1) ChatThread` (optional) — `ChatThread (1) —— (N) ChatMessage`.
- `Booking (1) —— (0..1) DamageReport`.
- `Booking (1) —— (0..3) Rating` (borrower→owner, owner→borrower, borrower→item).
- `User (1) —— (N) TrustScoreEvent` — append-only ledger; `User.trustScore` is a denormalized rollup recomputed on each new event (or via scheduled recompute job for consistency).
- `User (1) —— (N) Wishlist` — references either a `Listing` or a `category` string.
- `Community (1) —— (N) Announcement`, `Community (1) —— (N) AuditLog`, `Community (1) —— (N) Report`.

**Cardinality summary table:**

| Relationship | Cardinality |
|---|---|
| User ↔ Community | N:N (via Membership) |
| Community → Listing | 1:N |
| User (owner) → Listing | 1:N |
| Listing → Booking | 1:N |
| User (borrower) → Booking | 1:N |
| Booking → ChatThread | 1:1 (optional) |
| ChatThread → ChatMessage | 1:N |
| Booking → DamageReport | 1:0..1 |
| Booking → Rating | 1:0..3 |
| User → TrustScoreEvent | 1:N |
| User → Wishlist | 1:N |
| Community → Announcement/Report/AuditLog | 1:N each |

*Continue to Part 5: Backend & Frontend Folder Structure.*
