# apt.share — Part 3: Information Architecture, Page Hierarchy & User Journeys

---

## 7. Complete Page Hierarchy

```
apt.share
│
├── PUBLIC (unauthenticated)
│   ├── / .......................... Landing Page
│   ├── /features
│   ├── /how-it-works
│   ├── /communities/find ......... "Find my community" search
│   ├── /communities/request ...... Request new community onboarding
│   ├── /pricing (future-flagged, hidden at MVP)
│   ├── /faq
│   ├── /contact
│   ├── /login
│   ├── /register
│   ├── /verify-email
│   ├── /forgot-password
│   ├── /reset-password/:token
│   ├── /terms
│   └── /privacy
│
├── ONBOARDING (authenticated, profile incomplete)
│   ├── /onboarding/profile ....... name, photo, unit/block
│   ├── /onboarding/community ..... join existing / request new
│   └── /onboarding/complete
│
├── APP (authenticated, resident role, community-scoped)
│   ├── /app/dashboard ............ Resident Dashboard (home)
│   ├── /app/browse ............... Item discovery / search+filter grid
│   ├── /app/items/:itemId ........ Item detail page
│   ├── /app/items/new ............ Create listing (multi-step form)
│   ├── /app/items/:itemId/edit
│   ├── /app/my-listings .......... Owner's listings management
│   ├── /app/bookings ............. Booking history (tabs: Borrowed / Lent)
│   ├── /app/bookings/:bookingId .. Booking detail (status, QR, chat link)
│   ├── /app/bookings/:bookingId/pickup-scan
│   ├── /app/bookings/:bookingId/return-scan
│   ├── /app/wishlist
│   ├── /app/chat ................. Conversation list
│   ├── /app/chat/:threadId ....... Conversation detail
│   ├── /app/notifications
│   ├── /app/feed ................. Community feed
│   ├── /app/profile/:userId ...... Public profile (ratings, badges, trust score)
│   ├── /app/settings/profile
│   ├── /app/settings/account
│   ├── /app/settings/notifications
│   ├── /app/settings/communities . Manage/switch multiple communities
│   ├── /app/analytics ............ Personal analytics dashboard
│   └── /app/disputes/:bookingId .. File / track a damage report
│
├── COMMUNITY ADMIN (role: community_admin, nested under /admin)
│   ├── /admin/overview ............ Admin dashboard overview cards
│   ├── /admin/members ............. Approve/manage residents
│   ├── /admin/listings ............ Moderate all listings
│   ├── /admin/bookings ............ All bookings in community
│   ├── /admin/disputes ............ Dispute queue
│   ├── /admin/disputes/:id
│   ├── /admin/announcements ....... Post community announcements
│   ├── /admin/analytics ........... Community analytics dashboard
│   ├── /admin/reports ............. Generate/download PDF reports
│   └── /admin/settings ............ Community settings (join policy, branding)
│
└── SUPER ADMIN (role: super_admin, nested under /platform)
    ├── /platform/overview
    ├── /platform/communities ...... Approve/manage all communities
    ├── /platform/communities/:id
    ├── /platform/users ............ Global user management
    ├── /platform/analytics ........ Platform-wide analytics
    ├── /platform/audit-log
    └── /platform/settings
```

---

## 8. Navigation Flow

### 8.1 Top-level shells

- **Public Shell:** marketing nav (Features, How it Works, FAQ, Contact) + Login/Register CTAs. No sidebar.
- **App Shell (Resident):** left sidebar (Dashboard, Browse, My Listings, Bookings, Wishlist, Chat, Feed, Analytics) + top bar (community switcher, search, notifications bell, profile menu, dark-mode toggle).
- **Admin Shell:** left sidebar scoped to admin sections, top bar shows "Admin view — [Community Name]" with a clear "Exit to resident view" affordance (admins are still residents and can toggle context).
- **Platform Shell:** distinct visual treatment (e.g., different accent color) to make it unmistakable this is a super-admin surface, reducing accidental cross-context actions.

### 8.2 Route guarding rules

| Route group | Guard |
|---|---|
| `/app/*` | requires valid JWT + `profileComplete = true` + at least one active community membership |
| `/onboarding/*` | requires valid JWT; redirects to `/app/dashboard` if already onboarded |
| `/admin/*` | requires role `community_admin` (or `super_admin`) AND active membership in the community being administered |
| `/platform/*` | requires role `super_admin` only |
| public auth pages | redirect to `/app/dashboard` if already authenticated & onboarded |

---

## 9. User Journeys

### 9.1 Journey: First-time Borrower (Anjali)

1. Lands on `/` → clicks "Find my community" → searches "Green Valley Apartments" → found → clicks "Join".
2. Redirected to `/register` → fills form → OTP sent → `/verify-email` → verified.
3. `/onboarding/profile` → uploads photo, enters Flat B-402.
4. `/onboarding/community` → community pre-selected from step 1 → submits join request.
5. Sees "Pending Admin Approval" holding screen (or is auto-approved if community allows domain-based auto-join) → receives email once approved.
6. Lands on `/app/dashboard` for the first time → empty-state prompts: "Borrow something" / "List something".
7. `/app/browse` → filters "Available Today" → finds a pressure washer → `/app/items/:id`.
8. Selects date range on the calendar (system blocks unavailable dates) → clicks "Request to Borrow".
9. Booking created with status `pending` → notified when owner approves.
10. On approval, receives pickup instructions + a QR code appears on `/app/bookings/:id`.
11. At pickup, owner scans borrower's QR (or vice versa, per configured flow) → booking → `active`.
12. On return day, reminder email fires at T-24h. Anjali returns item; QR scan → booking → `completed`.
13. Rating prompt appears → she rates the owner/item.
14. 24h later, deposit auto-releases (no dispute filed) → notification sent.

### 9.2 Journey: First-time Lender (Rakesh)

1. Already onboarded → `/app/items/new`.
2. Multi-step form: Basic Info → Photos → Deposit/Fee → Availability rules → Pickup Instructions → Review → Publish.
3. Listing goes live instantly (no admin pre-approval required by default; admin can moderate post-hoc) → appears in `/app/browse` and community feed.
4. Receives a booking request notification → reviews requester's profile (trust score, ratings) on `/app/profile/:userId` → Approves.
5. Coordinates pickup via in-app chat if needed.
6. Confirms pickup via QR scan, optionally attaches pre-condition photos.
7. Item returned; confirms return via QR scan.
8. If item came back damaged: within 24h, files a damage report on `/app/disputes/:bookingId` with photos → deposit release freezes → Community Admin reviews.

### 9.3 Journey: Community Admin resolving a dispute (Meera)

1. Notified of a new dispute → `/admin/disputes`.
2. Opens `/admin/disputes/:id` → sees booking details, both parties' trust scores/history, pre/post condition photos, damage description.
3. Chooses: Approve full deduction / Approve partial deduction / Dismiss report.
4. Decision logged to audit trail; both parties notified; deposit ledger updated accordingly.

### 9.4 Journey: Super Admin onboarding a new community

1. Community request submitted via public `/communities/request` form.
2. Appears in `/platform/communities` as `pending`.
3. Super Admin reviews submitted verification info (name, address, admin contact) → Approves → community becomes `active`, and the requesting user is auto-assigned as its first `community_admin`.
4. Community now discoverable in `/communities/find`.

---

## 10. Information Architecture — Content Model Summary

| Entity | Owned by | Scoped to | Key relationships |
|---|---|---|---|
| User | self | 1..N Communities | → Memberships, Listings, Bookings, Ratings, Notifications |
| Community | Super Admin (approval) | — | → Members, Listings, Announcements |
| Membership | User + Community | Community | join User ↔ Community with role + status |
| Listing (Item) | User (owner) | Community | → Bookings, Wishlist entries, Ratings (item-level) |
| Booking | Borrower + Owner | Community (via item) | → QR tokens, Chat thread, Damage report, Ratings |
| ChatThread / Message | Participants | Booking (or pre-booking inquiry) | — |
| Notification | User | Community context | — |
| DamageReport | Reporter | Booking | → Admin decision, Audit log entries |
| TrustScore | User | Community-relative or global (decision in Part 4) | derived, recomputed on events |
| Announcement | Community Admin | Community | — |
| Report (PDF) | Admin | Community | async-generated artifact |
| AuditLog entry | System/Admin action | Community or Platform | immutable |

*Continue to Part 4: Database Design, Collections & ER Diagram.*
