# apt.share — Part 2: Functional & Non-Functional Requirements

---

## 5. Functional Requirements

Each requirement is tagged `FR-<module>-<number>` for traceability into tickets/milestones.

### 5.1 Authentication & Account (FR-AUTH)

- FR-AUTH-01: User can register with name, email, phone, password.
- FR-AUTH-02: Password stored with bcrypt (min. cost factor 12), never logged or returned in any API response.
- FR-AUTH-03: Email verification via 6-digit OTP, expires in 10 minutes, max 5 attempts before lockout (15 min cooldown).
- FR-AUTH-04: Login issues short-lived JWT access token (15 min) + long-lived httpOnly refresh token cookie (7 days, rotated on use).
- FR-AUTH-05: Forgot Password flow: request → emailed reset link with signed, expiring token (30 min) → reset form → invalidate all existing sessions.
- FR-AUTH-06: Logout invalidates refresh token server-side (refresh token stored/blacklisted in DB or Redis).
- FR-AUTH-07: Role-Based Access Control enforced at API middleware level for roles: `guest`, `resident`, `community_admin`, `super_admin`.
- FR-AUTH-08: Account lockout after 10 failed login attempts within 15 minutes.

### 5.2 Onboarding (FR-ONB)

- FR-ONB-01: After email verification, user must either (a) select an existing verified community from a searchable list, or (b) submit a "request new community" form.
- FR-ONB-02: Joining an existing community requires Community Admin approval (or auto-approval if the community allows open domain-based join, e.g., matching email domain or apartment block code).
- FR-ONB-03: Profile completion requires: profile picture (optional but prompted), unit/block/flat number, phone verification (optional OTP).
- FR-ONB-04: Onboarding progress persists — user can resume mid-flow.
- FR-ONB-05: A user may belong to more than one community (e.g., resident + coworking space) and switch active community context via a community switcher.

### 5.3 Item / Listing Management (FR-ITEM)

- FR-ITEM-01: Resident can create a listing with: title, description, category, condition, brand, purchase year, up to 8 images, security deposit amount, optional rental fee (per day), max borrow duration, pickup instructions, accessories included, usage instructions, tags.
- FR-ITEM-02: Images uploaded client → server → Cloudinary; server stores only secure URLs + public IDs, never raw files.
- FR-ITEM-03: Listing has a status: `draft`, `active`, `paused`, `under_maintenance`, `removed`.
- FR-ITEM-04: Owner can edit or pause a listing; edits to deposit/fee do not retroactively affect active bookings.
- FR-ITEM-05: Each listing has an availability calendar (see FR-CAL) derived from bookings + owner-defined blackout dates.
- FR-ITEM-06: Listings are scoped to the community(ies) the owner is an active member of; never visible cross-community.
- FR-ITEM-07: Soft-delete only — listings are never hard-deleted while booking history references them.

### 5.4 Booking System (FR-BOOK)

- FR-BOOK-01: Resident requests a booking for a date range on an active listing.
- FR-BOOK-02: System rejects requests that overlap an existing `confirmed` or `active` booking for that item (interval-overlap check, see Part 7 DSA).
- FR-BOOK-03: Owner receives request notification; can Approve or Decline within a configurable auto-expire window (default 48h; unactioned requests auto-decline and notify requester).
- FR-BOOK-04: On approval, booking status → `confirmed`; a unique pickup QR token and return QR token are generated (see FR-QR).
- FR-BOOK-05: On pickup scan, booking status → `active`, `pickupConfirmedAt` timestamp recorded, pre-condition photos optionally attached by owner.
- FR-BOOK-06: On return scan, booking status → `completed`, `returnConfirmedAt` recorded, post-condition photos optionally attached.
- FR-BOOK-07: Deposit is marked `held` at confirmation and `released` automatically 24h after `completed` unless a damage report is filed within that window.
- FR-BOOK-08: Borrower and owner can cancel prior to pickup; cancellation reason required; a cancellation history/count feeds trust score.
- FR-BOOK-09: Full booking history is queryable by both parties and filterable by status/date.
- FR-BOOK-10: Late return (past `expectedReturnDate` with no return scan) triggers escalating reminders (Part 7) and flags the trust score.

### 5.5 Availability Calendar (FR-CAL)

- FR-CAL-01: Calendar renders states: `available`, `booked` (pending approval), `reserved` (confirmed), `maintenance`, `unavailable` (owner blackout).
- FR-CAL-02: Calendar is computed server-side from the booking collection + owner blackout dates; never manually toggled per day by default (blackout ranges only).
- FR-CAL-03: Calendar prevents selection of any date range that would create an overlap.

### 5.6 Search & Discovery (FR-SEARCH)

- FR-SEARCH-01: Global search across item title, description, category, brand, tags, owner name — scoped to active community.
- FR-SEARCH-02: Search supports typo-tolerant partial matching (MongoDB text index or Atlas Search).
- FR-SEARCH-03: Filters: Available Today, Verified Owners, Top Rated, Recently Added, Free, Paid, Near Me (by block/building distance if geodata available).
- FR-SEARCH-04: Results sortable by relevance, distance, rating, recency.
- FR-SEARCH-05: Empty-state and zero-result states must suggest wishlist creation.

### 5.7 Chat (FR-CHAT)

- FR-CHAT-01: Real-time 1:1 chat scoped to a booking or a pre-booking inquiry thread, via Socket.IO.
- FR-CHAT-02: Typing indicators, read receipts, image attachments (via Cloudinary).
- FR-CHAT-03: Chat history persisted in MongoDB; retrievable on reconnect.
- FR-CHAT-04: Messages containing raw phone numbers/emails are soft-flagged (policy nudge, not blocked) to encourage in-app coordination — configurable per community.

### 5.8 Notifications (FR-NOTIF)

- FR-NOTIF-01: In-app notification center with unread badge, grouped by type.
- FR-NOTIF-02: Email notifications (via Nodemailer) for: booking requested/approved/declined, pickup/return reminders, late-return alerts, wishlist item available, deposit released, dispute updates.
- FR-NOTIF-03: Notification preferences per user (email on/off per category); in-app never fully disabled for critical alerts (disputes, security).
- FR-NOTIF-04: Notification delivery is queued and retried on failure (see Part 8 background jobs).

### 5.9 QR System (FR-QR)

- FR-QR-01: Each confirmed booking generates two single-use, signed, expiring QR tokens: pickup and return.
- FR-QR-02: QR scan endpoint validates token signature, expiry, booking state transition legality, and actor identity (must be owner scanning borrower's pickup, or vice versa per configured flow) before mutating booking state.
- FR-QR-03: QR tokens are invalidated after use or after booking cancellation.

### 5.10 Damage Reporting & Disputes (FR-DMG)

- FR-DMG-01: Either party can file a damage/dispute report within 24h of return, attaching photos and a description.
- FR-DMG-02: Filing a report freezes the deposit release.
- FR-DMG-03: Community Admin reviews report, evidence, and both parties' history; can approve full/partial deposit deduction or dismiss.
- FR-DMG-04: All dispute actions are written to an immutable audit log (actor, timestamp, decision, reason).

### 5.11 Wishlist (FR-WISH)

- FR-WISH-01: Resident can bookmark an item/category even if currently unavailable.
- FR-WISH-02: When a wishlisted item becomes available (new listing in category, or existing item's calendar opens), the user is notified.

### 5.12 Ratings & Trust Score (FR-RATE)

- FR-RATE-01: After a completed booking, both parties are prompted to rate each other (communication, condition/care, overall) and the borrower rates the item.
- FR-RATE-02: Ratings are 1–5 stars with optional comment; visible on public profile/listing (aggregate, not per-transaction identity beyond the two parties).
- FR-RATE-03: Trust Score (0–100) computed from: successful return rate, average rating, complaint count, damage incidents, late-return count, total completed transactions — weighted formula documented in Part 7.
- FR-RATE-04: Trust badges (e.g., "Trusted Lender", "Community Star") awarded at score thresholds, displayed on profile.

### 5.13 Community Feed (FR-FEED)

- FR-FEED-01: Feed shows recently added items, recent (anonymized where appropriate) borrow activity, community announcements (admin-posted), popular categories, top contributors — scoped to active community.

### 5.14 Analytics (FR-ANALYTICS)

- FR-ANALYTICS-01 (Resident): items borrowed, items lent, estimated money saved, borrow frequency over time — personal dashboard.
- FR-ANALYTICS-02 (Community, Admin-only): most borrowed items, popular categories, most active residents, average borrow duration, estimated community money saved, estimated CO₂ saved.
- FR-ANALYTICS-03: Analytics computed via scheduled aggregation jobs (not fully real-time) for performance; dashboards show "as of [timestamp]".

### 5.15 Admin Panel (FR-ADMIN)

- FR-ADMIN-01 (Community Admin): manage member approvals, manage/remove listings, manage bookings (view/intervene), review reports/disputes, view community analytics, edit community settings (join policy, branding).
- FR-ADMIN-02 (Super Admin): approve/reject new community applications, manage all users platform-wide, manage all communities, global analytics, platform settings, audit log viewer.

### 5.16 Reports (FR-REPORT)

- FR-REPORT-01: Admins can generate downloadable PDF reports: inventory snapshot, bookings in date range, transactions/deposits ledger, community statistics summary.
- FR-REPORT-02: Report generation is an async job; user is notified when the PDF is ready for download.

### 5.17 Background Jobs (FR-JOB)

- FR-JOB-01: Scheduled job sends return reminders at T-24h and T-2h before `expectedReturnDate`, and escalating late alerts every 24h after.
- FR-JOB-02: Scheduled job auto-releases held deposits 24h post-completion if no dispute filed.
- FR-JOB-03: Email delivery queue with retry/backoff; failures logged.
- FR-JOB-04: Scheduled job auto-declines booking requests unactioned past the approval window.

---

## 6. Non-Functional Requirements (FR → NFR, tagged `NFR-<category>-<number>`)

### 6.1 Performance

- NFR-PERF-01: p95 API response time < 300ms for read endpoints under nominal load (excluding image upload/report generation).
- NFR-PERF-02: Frontend initial contentful paint < 2s on 4G mobile.
- NFR-PERF-03: All list views (items, bookings, notifications) are paginated (cursor or page-based, max 20 items/page default) — never unbounded queries.
- NFR-PERF-04: Images lazy-loaded and served via Cloudinary responsive transformations (never full-resolution originals to the browser).

### 6.2 Scalability

- NFR-SCALE-01: Backend is stateless (JWT + externalized session/refresh-token store) so it can horizontally scale behind Nginx/ALB.
- NFR-SCALE-02: MongoDB collections indexed for the query patterns defined in Part 4; compound indexes on (`communityId`, `status`, `createdAt`) for hot paths.
- NFR-SCALE-03: Socket.IO configured with a Redis adapter to support multi-instance real-time chat.

### 6.3 Reliability & Availability

- NFR-REL-01: Target 99.5% uptime for MVP (single-region deployment acceptable at this stage).
- NFR-REL-02: Health-check endpoint (`/health`) used by Docker/Nginx/CI for deploy verification.
- NFR-REL-03: Idempotent QR scan and webhook-style handlers (safe to retry without double state transitions).

### 6.4 Security

- NFR-SEC-01: All traffic over HTTPS (TLS terminated at Nginx).
- NFR-SEC-02: Helmet middleware, strict CORS allow-list, rate limiting per IP+route (esp. auth, OTP, QR scan endpoints).
- NFR-SEC-03: All user input validated/sanitized server-side (schema validation, e.g., Joi/Zod) regardless of client-side validation.
- NFR-SEC-04: File uploads validated by MIME type + size limit (max 5MB/image, max 8 images/listing) before forwarding to Cloudinary.
- NFR-SEC-05: Audit log for all admin actions and dispute decisions, immutable/append-only.
- NFR-SEC-06: Secrets managed via environment variables / AWS Secrets Manager, never committed to source control.

### 6.5 Usability & Accessibility

- NFR-UX-01: WCAG 2.1 AA color contrast targets; keyboard-navigable forms and modals.
- NFR-UX-02: Every async action has a loading state; every empty list has a designed empty state (not a blank screen).
- NFR-UX-03: Dark mode is a first-class theme, not an afterthought — all components themed via design tokens (Part 9).

### 6.6 Maintainability

- NFR-MAINT-01: Backend follows a layered architecture (routes → controllers → services → repositories/models) with no business logic in route handlers.
- NFR-MAINT-02: Frontend follows a feature-based folder structure (Part 5) with shared/reusable component library.
- NFR-MAINT-03: ESLint + Prettier enforced via pre-commit hook and CI gate; PRs cannot merge on lint/test failure.

### 6.7 Observability

- NFR-OBS-01: Structured JSON logging (e.g., pino/winston) with request IDs for traceability across services.
- NFR-OBS-02: Centralized error handling middleware; no unhandled promise rejections reach the client as raw stack traces.
- NFR-OBS-03: Key business events (booking confirmed, dispute filed, deposit released) logged as discrete audit/analytics events.

### 6.8 Compliance & Data

- NFR-DATA-01: User can request account/data deletion; PII scrubbed while preserving anonymized transaction history needed for community trust integrity.
- NFR-DATA-02: Deposits are tracked as ledger entries, not real payment processing, in MVP scope (see Future Enhancements, Part 11) — clearly labeled as a "protection deposit record," not a live payment gateway, unless a gateway is explicitly integrated later.

---

*Continue to Part 3: Information Architecture, Page Hierarchy & User Journeys.*
