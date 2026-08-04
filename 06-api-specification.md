# apt.share — Part 6: REST API Design & Authentication Flow

Base URL: `/api/v1`. All responses use a consistent envelope:

```json
// success
{ "success": true, "data": { }, "meta": { "page": 1, "limit": 20, "total": 134 } }
// error
{ "success": false, "error": { "code": "BOOKING_OVERLAP", "message": "These dates are unavailable." } }
```

All authenticated routes require `Authorization: Bearer <accessToken>`. Community-scoped routes additionally require an `X-Community-Id` header or resolve the active community from the user's membership context.

---

## 15. REST API Design

### 15.1 Auth (`/api/v1/auth`)

| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/register` | Create account, send OTP | none |
| POST | `/verify-otp` | Verify email OTP | none |
| POST | `/resend-otp` | Resend OTP (rate-limited) | none |
| POST | `/login` | Email+password login → access token + refresh cookie | none |
| POST | `/refresh` | Rotate refresh token → new access token | refresh cookie |
| POST | `/logout` | Invalidate refresh token | required |
| POST | `/forgot-password` | Send reset link | none |
| POST | `/reset-password` | Reset with token | none |
| GET | `/me` | Current user profile | required |

### 15.2 Users (`/api/v1/users`)

| Method | Path | Description | Auth |
|---|---|---|---|
| PATCH | `/me` | Update own profile | required |
| POST | `/me/avatar` | Upload avatar (multer → Cloudinary) | required |
| PATCH | `/me/notification-preferences` | Update prefs | required |
| GET | `/:userId/public-profile` | Public profile: ratings, badges, trust score | required |
| DELETE | `/me` | Request account deletion | required |

### 15.3 Communities (`/api/v1/communities`)

| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/search?q=` | Search communities to join | required |
| POST | `/request` | Request new community onboarding | required |
| GET | `/:communityId` | Community public info | required |
| PATCH | `/:communityId` | Update settings | community_admin |
| GET | `/:communityId/members` | List members | community_admin |

### 15.4 Memberships (`/api/v1/memberships`)

| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/` | Request to join a community | required |
| PATCH | `/:membershipId/approve` | Approve join request | community_admin |
| PATCH | `/:membershipId/reject` | Reject join request | community_admin |
| PATCH | `/:membershipId/remove` | Remove member | community_admin |
| PATCH | `/:membershipId/set-active` | Switch active community context | required (self) |

### 15.5 Listings (`/api/v1/listings`)

| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/` | Browse/search listings (query: `q, category, availableToday, verifiedOwners, topRated, recentlyAdded, free, paid, nearMe, sort, page, limit`) | required |
| POST | `/` | Create listing | required |
| GET | `/:listingId` | Listing detail | required |
| PATCH | `/:listingId` | Update listing (owner only) | required |
| PATCH | `/:listingId/status` | Pause/resume/remove | required (owner) |
| POST | `/:listingId/images` | Upload images | required (owner) |
| DELETE | `/:listingId/images/:imageId` | Remove image | required (owner) |
| GET | `/:listingId/availability` | Calendar state for date range | required |
| GET | `/mine` | Current user's listings | required |

### 15.6 Bookings (`/api/v1/bookings`)

| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/` | Request booking (`listingId, startDate, endDate, requestMessage`) | required |
| GET | `/` | List bookings (query: `role=borrower|owner, status, page, limit`) | required |
| GET | `/:bookingId` | Booking detail | required (participant) |
| PATCH | `/:bookingId/approve` | Owner approves | required (owner) |
| PATCH | `/:bookingId/decline` | Owner declines (`declineReason`) | required (owner) |
| PATCH | `/:bookingId/cancel` | Either party cancels (`cancellationReason`) | required (participant) |
| POST | `/:bookingId/pickup-scan` | Confirm pickup via QR token | required (participant) |
| POST | `/:bookingId/return-scan` | Confirm return via QR token | required (participant) |
| GET | `/:bookingId/qr/pickup` | Fetch pickup QR payload | required (participant) |
| GET | `/:bookingId/qr/return` | Fetch return QR payload | required (participant) |

### 15.7 Chat (`/api/v1/chat`)

| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/threads` | List my threads | required |
| POST | `/threads` | Start inquiry thread (`listingId` or `bookingId`) | required |
| GET | `/threads/:threadId/messages` | Paginated message history | required (participant) |
| POST | `/threads/:threadId/messages` | Send message (fallback to REST; primary path is Socket.IO) | required (participant) |
| PATCH | `/threads/:threadId/read` | Mark read | required (participant) |

*Real-time events (Socket.IO namespace `/chat`):* `message:send`, `message:new`, `typing:start`, `typing:stop`, `message:read`.

### 15.8 Notifications (`/api/v1/notifications`)

| Method | Path | Description |
|---|---|---|
| GET | `/` | Paginated, filterable by `read` |
| PATCH | `/:id/read` | Mark one read |
| PATCH | `/read-all` | Mark all read |
| GET | `/unread-count` | Badge count |

### 15.9 Wishlist (`/api/v1/wishlist`)

| Method | Path | Description |
|---|---|---|
| GET | `/` | My wishlist |
| POST | `/` | Add (`listingId` or `category`) |
| DELETE | `/:id` | Remove |

### 15.10 Ratings (`/api/v1/ratings`)

| Method | Path | Description |
|---|---|---|
| POST | `/` | Submit rating (`bookingId, direction, scores, comment`) |
| GET | `/user/:userId` | Ratings received by a user |
| GET | `/listing/:listingId` | Ratings for an item |

### 15.11 Damage Reports (`/api/v1/damage-reports`)

| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/` | File report (`bookingId, description, photos`) | required (participant) |
| GET | `/:id` | Detail | required (participant/admin) |
| PATCH | `/:id/resolve` | Resolve (`decision, amount, note`) | community_admin |
| GET | `/community/:communityId` | Dispute queue | community_admin |

### 15.12 Community Feed (`/api/v1/feed`)

| Method | Path | Description |
|---|---|---|
| GET | `/` | Aggregated feed: recent listings, recent activity, announcements, popular categories, top contributors |

### 15.13 Analytics (`/api/v1/analytics`)

| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/me` | Personal analytics | required |
| GET | `/community/:communityId` | Community analytics | community_admin |

### 15.14 Admin — Community (`/api/v1/admin`)

| Method | Path | Description |
|---|---|---|
| GET | `/overview` | Dashboard cards |
| GET | `/listings` | Moderate all listings |
| PATCH | `/listings/:id/remove` | Force-remove listing |
| GET | `/bookings` | All community bookings |
| POST | `/announcements` | Post announcement |
| GET | `/reports` | List generated reports |
| POST | `/reports` | Request new report (`type, dateRangeStart, dateRangeEnd`) |
| GET | `/reports/:id/download` | Download when ready |

### 15.15 Platform — Super Admin (`/api/v1/platform`)

| Method | Path | Description |
|---|---|---|
| GET | `/communities?status=pending` | Review queue |
| PATCH | `/communities/:id/approve` | Approve community |
| PATCH | `/communities/:id/reject` | Reject community |
| GET | `/users` | Global user search/management |
| PATCH | `/users/:id/suspend` | Suspend user (platform-wide) |
| GET | `/analytics` | Platform-wide metrics |
| GET | `/audit-log` | Global audit trail |

### 15.16 Misc

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Liveness/readiness probe |

**Standard error codes (subset):** `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `BOOKING_OVERLAP`, `INVALID_QR_TOKEN`, `QR_TOKEN_EXPIRED`, `MEMBERSHIP_REQUIRED`, `RATE_LIMITED`, `INTERNAL_ERROR`.

---

## 16. Authentication Flow (detailed)

### 16.1 Registration & verification

1. `POST /auth/register` → server validates payload, checks email uniqueness, hashes password (bcrypt), creates `user` with `emailVerified: false`, generates 6-digit OTP, stores `otp.codeHash` (hashed, not plaintext) + `expiresAt` (+10 min), sends OTP email (async, queued).
2. `POST /auth/verify-otp` → compares hash, checks expiry and `attempts < 5`; on success sets `emailVerified: true`, clears OTP fields, issues access token + refresh cookie so the user is logged in immediately post-verification.
3. Rate limiting: `/register` and `/resend-otp` limited per IP+email to prevent OTP spam abuse.

### 16.2 Login

1. `POST /auth/login` → validate credentials against `passwordHash`; on mismatch increment `failedLoginAttempts`; at 10 attempts set `lockoutUntil = now + 15min` and reject even correct future attempts until expiry.
2. On success: reset `failedLoginAttempts`, issue:
   - **Access token** (JWT, 15 min expiry, payload: `{ userId, role, tokenVersion }`), returned in response body for the client to hold in memory (not localStorage, to reduce XSS exposure).
   - **Refresh token** (opaque random string, 7-day expiry), stored httpOnly + Secure + SameSite=Strict cookie; its hash is persisted in `users.refreshTokens[]` with `userAgent` for session visibility/revocation.

### 16.3 Token refresh & rotation

1. `POST /auth/refresh` (cookie auto-sent) → server looks up hash in `users.refreshTokens[]`; if valid and unexpired, issues a **new** access token AND rotates the refresh token (old one invalidated, new one stored) — mitigates replay of a stolen refresh token.
2. If a refresh token is reused after rotation (indicates theft), server invalidates **all** refresh tokens for that user and forces re-login.

### 16.4 Logout

`POST /auth/logout` → removes the specific refresh token hash from `users.refreshTokens[]`, clears the cookie.

### 16.5 Forgot / reset password

1. `POST /auth/forgot-password` → generates a signed, expiring (30 min) reset token (JWT or random+hash stored server-side), emails a reset link `/reset-password/:token`. Response is identical whether or not the email exists (prevents user enumeration).
2. `POST /auth/reset-password` → validates token, sets new `passwordHash`, invalidates **all** existing refresh tokens (force logout everywhere) as a security measure.

### 16.6 Middleware pipeline for protected routes

```
request
  → requestId middleware (attach trace id)
  → authenticate (verify JWT signature+expiry, attach req.user)
  → authorize(requiredRoles) (checks req.user.role and/or membership role for the resolved community)
  → validateRequest(schema) (Zod/Joi body/query validation)
  → controller
  → service (business logic)
  → response envelope
  → errorHandler (catches thrown ApiError, formats consistent error JSON)
```

### 16.7 Role-Based Access Control matrix (summary)

| Action | resident | community_admin | super_admin |
|---|---|---|---|
| Browse/search own community listings | ✅ | ✅ | ✅ (any community, admin view) |
| Create listing | ✅ | ✅ | — |
| Approve membership requests | ❌ | ✅ (own community) | ✅ (any) |
| Resolve disputes | ❌ | ✅ (own community) | ✅ (any) |
| Approve new communities | ❌ | ❌ | ✅ |
| View platform-wide analytics | ❌ | ❌ | ✅ |
| Suspend a user platform-wide | ❌ | ❌ | ✅ |

*Continue to Part 7: Booking Workflow, Notification Workflow, Recommendation Engine & DSA Usage.*
