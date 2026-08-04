# apt.share — Part 7: Booking Workflow, Notification Workflow, Recommendation Engine & DSA Usage

---

## 17. Booking Workflow (state machine)

```
                request           approve              pickup scan
 ┌────────┐  ───────────►  ┌──────────┐  ─────────►  ┌───────────┐  ───────────►
 │ (none) │                │ pending  │               │ confirmed │               ┌────────┐
 └────────┘                └────┬─────┘               └─────┬─────┘              │ active │
                                 │ decline                    │ cancel            └───┬────┘
                                 ▼                            ▼                       │ return scan
                          ┌───────────┐               ┌────────────┐                  ▼
                          │ declined  │               │ cancelled  │            ┌───────────┐
                          └───────────┘               └────────────┘            │ completed │
                                                                                  └─────┬─────┘
                                                                                        │ damage report filed
                                                                                        │ (within 24h)
                                                                                        ▼
                                                                                  ┌───────────┐
                                                                                  │ disputed  │
                                                                                  └───────────┘
```

**Transition guards:**

- `pending → confirmed`: only `ownerId` may call `approve`; system re-validates no overlap was created by a race condition since the request was made (double-check at approval time, not just request time).
- `pending → declined`: owner-initiated, or system-initiated via `autoDeclineBooking.job.js` if unactioned past `autoDeclineAt`.
- `confirmed → active`: only via a **valid pickup QR scan** (see §17.1); cannot be manually toggled by API to protect the physical-handoff guarantee.
- `active → completed`: only via a **valid return QR scan**.
- `completed → disputed`: either party, within 24h of `returnConfirmedAt`, by filing a `DamageReport`.
- Cancellation allowed from `pending` or `confirmed` only (not once `active` — a physical handoff has occurred, use damage reporting instead).

### 17.1 QR pickup/return sequence

1. On `approve`, the service generates two tokens: `pickupQrToken` and `returnQrToken` — each a signed JWT-like payload `{ bookingId, type, exp }`, HMAC-signed server-side; only the **hash** is stored in `bookings.pickupQrToken.tokenHash` (the raw token is embedded in the QR image shown to the user, never persisted in plaintext).
2. QR images are rendered client-side (e.g., `qrcode.react`) from the raw token fetched via `GET /bookings/:id/qr/pickup`, scoped to the two participants only.
3. At physical handoff, one party scans the other's QR using the app's camera (`/app/bookings/:id/pickup-scan`), which POSTs the decoded token to `POST /bookings/:bookingId/pickup-scan`.
4. Server: verifies signature, checks `expiresAt` not passed, checks `used = false`, checks the calling user is a legitimate participant, checks current `status = confirmed` — only then transitions to `active`, sets `used = true`, records `pickupConfirmedAt`. All checks are idempotent-safe (a duplicate POST with an already-used token is rejected with `QR_TOKEN_EXPIRED`/already-used error, not a silent double-transition).
5. Identical flow for return scan against `active → completed`.

### 17.2 Interval-overlap check (booking request & approval time)

Given a listing's existing bookings with status in `{pending, confirmed, active}`, a new request `[start, end)` is rejected if it overlaps any existing interval:

```
overlap(A, B) = A.start < B.end AND B.start < A.end
```

Implemented as a MongoDB query using compound range conditions on `startDate`/`endDate` with the `{ listingId: 1, startDate: 1, endDate: 1 }` index (see Part 4 §11.5), re-verified inside a transaction/optimistic-lock at approval time to close the race-condition window between two simultaneous requests for overlapping dates.

---

## 18. Notification Workflow

### 18.1 Trigger → channel matrix

| Event | In-app | Email | Timing |
|---|---|---|---|
| Booking requested | ✅ | ✅ | immediate |
| Booking approved/declined | ✅ | ✅ | immediate |
| Pickup reminder | ✅ | ✅ | T-2h before startDate |
| Return reminder | ✅ | ✅ | T-24h and T-2h before endDate |
| Late return | ✅ | ✅ | at endDate+0, then every 24h until returned |
| Wishlist item available | ✅ | ✅ | on trigger event |
| Deposit released | ✅ | ✅ | on auto-release or manual resolution |
| Dispute filed/resolved | ✅ | ✅ | immediate (cannot be disabled — security-critical) |
| New chat message | ✅ (push if unread) | ❌ (avoid email spam for chat) | immediate |
| Community announcement | ✅ | optional (community setting) | immediate |

### 18.2 Delivery pipeline

1. Business event occurs in a service (e.g., `bookings.service.js` on approval) → service writes a `notifications` document AND enqueues an email job (does not block the API response on email send).
2. `emailQueueProcessor.job.js` (a lightweight in-process queue for MVP scale, upgradeable to BullMQ/Redis-backed queue at growth stage) picks up pending email jobs, renders the relevant Handlebars/EJS template, sends via Nodemailer, marks `notifications.emailSent = true` or logs failure with retry (exponential backoff, max 5 attempts).
3. Socket.IO emits a real-time `notification:new` event to the user's connected socket(s) for instant in-app badge updates, independent of the email pipeline.

### 18.3 Scheduling mechanism — Priority Queue

Reminder and auto-action jobs (`returnReminder`, `autoDeclineBooking`, `autoReleaseDeposit`, `lateReturnSweep`) are conceptually a **priority queue keyed by trigger timestamp**: each booking, upon reaching `confirmed`/`active`/`completed`, computes its next relevant trigger time(s) and the scheduler processes "what's due now" via a periodic sweep (cron every 5 minutes) that queries `{ status, triggerField: { $lte: now } }` using indexed date fields — functionally a time-ordered priority queue implemented against MongoDB indexes rather than an in-memory heap, so it survives server restarts. See §19 for where an in-memory heap **is** used (trending computation).

---

## 19. Recommendation Engine Design

**Goal:** surface listings a resident is likely to want to borrow, and suggest wishlist-worthy categories, without heavy ML infrastructure at MVP stage.

**Approach — graph-based collaborative signal + content similarity:**

1. **Graph model:** nodes = `{ User, Listing, Category }`. Edges:
   - `User —borrowed→ Listing` (weighted by recency/frequency)
   - `Listing —belongsTo→ Category`
   - `User —livesNear→ User` (same block/building, from `memberships.block`)
2. **"Users who borrowed X also borrowed Y"**: for a target listing, traverse `Listing → (borrowers) → their other borrowed Listings`, rank by co-occurrence count, filter to same community and currently-active listings.
3. **Category affinity:** for a target user, aggregate the `Category` nodes reachable from their borrow history edges, weighted by recency (exponential decay), to bias `/app/browse` default sort and `/app/feed` "Recommended for you" section.
4. **Cold-start fallback:** new users with no borrow history see trending items (§19.1 heap) and same-block popular categories instead of personalized graph traversal.
5. **Implementation note:** at MVP scale (a single community of hundreds to low-thousands of users/items), this graph traversal is computed on-demand via aggregation pipeline queries (MongoDB `$graphLookup`) rather than a dedicated graph database — revisit (Neo4j or similar) only if traversal depth/scale demands it (see Future Enhancements, Part 11).

### 19.1 Trending / Top-Rated — Heap usage

- A **max-heap keyed by a recency-weighted popularity score** (`score = bookingCount * recencyWeight + viewCount * 0.1`) is computed periodically (`analyticsAggregation.job.js`) per community, producing the "Trending" and "Most Borrowed" lists surfaced in the Community Feed and Community Analytics dashboard.
- A separate max-heap keyed by `averageRating` (with a minimum rating-count threshold to avoid one-review outliers dominating) powers "Top Rated" filter and "Top Contributors" feed section.
- Implementation: since these are periodic batch computations over a bounded per-community dataset, a standard binary heap (`utils/heap.js`) is used to extract the top-N efficiently (`O(n log k)` for top-k of n items) rather than a full sort, then the top-N is cached into `analyticsSnapshots`.

### 19.2 HashMap usage

- In-memory/service-layer **hashmaps** (plain JS objects/Maps, backed by indexed MongoDB lookups) provide O(1) amortized lookups for: user-by-id caching within a single request lifecycle (avoid N+1 queries when hydrating a list of bookings with borrower/owner info), category → listing-count tallies during feed aggregation, and membership-role checks during RBAC middleware evaluation.

### 19.3 Interval Scheduling

Covered in §17.2 — the overlap-prevention logic is a direct application of the classic interval-scheduling/overlap-detection pattern, applied per-listing across its booking history.

---

*Continue to Part 8: Docker, CI/CD, AWS Deployment, Security, Error Handling & Logging.*
