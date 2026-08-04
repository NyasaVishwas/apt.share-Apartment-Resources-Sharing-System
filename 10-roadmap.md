# apt.share — Part 10: Design Tokens, Future Enhancements & Phased Roadmap

---

## 33. Design Tokens Quick Reference

Premium-SaaS visual direction inspired by Stripe/Linear/Notion/Airbnb/Vercel — no Bootstrap, no default Tailwind "gray card with shadow" look. Define these as CSS variables in `styles/index.css` and mirror them in `tailwind.config.js` `theme.extend`:

```css
:root {
  --color-bg:            #ffffff;
  --color-bg-elevated:   #f7f7f8;
  --color-surface:       #ffffff;
  --color-surface-elevated: #fafafa;
  --color-border:        #e5e7eb;
  --color-text-primary:  #0a0a0a;
  --color-text-secondary:#6b7280;
  --color-accent:        #5b5bd6;   /* primary brand accent — indigo/violet, distinct from generic Tailwind blue */
  --color-accent-hover:  #4c4cc4;
  --color-success:       #16a34a;
  --color-warning:       #d97706;
  --color-danger:        #dc2626;
  --radius-sm: 6px; --radius-md: 10px; --radius-lg: 16px;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.06);
  --font-sans: 'Inter', system-ui, sans-serif;
}
[data-theme="dark"] {
  --color-bg:            #0a0a0b;
  --color-bg-elevated:   #131316;
  --color-surface:       #131316;
  --color-surface-elevated: #1c1c20;
  --color-border:        #27272a;
  --color-text-primary:  #f4f4f5;
  --color-text-secondary:#a1a1aa;
  --color-accent:        #7c7cf0;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.4);
}
```

Typography scale: `text-xs (12px) / sm (14px) / base (16px) / lg (18px) / xl (20px) / 2xl (24px) / 3xl (30px) / 4xl (36px)`, `Inter` for UI text, tabular numerals for currency/stat figures. Motion: subtle 150–200ms ease-out transitions on hover/press/modal-open (Framer Motion optional, reserved for page-transition and card-hover polish — never on data-heavy tables, to preserve perceived performance).

---

## 34. Future Enhancements (explicitly out of MVP scope)

| Enhancement | Rationale for deferral |
|---|---|
| Live payment gateway integration (Razorpay/Stripe) for real deposit holds & rental fee capture | MVP tracks deposits as a ledger record only; real money movement adds PCI/compliance scope best tackled once core lending loop is validated |
| ML-based recommendation ranking (beyond graph/heap heuristics) | Requires meaningful usage data volume to be worth the complexity |
| Native mobile apps (React Native) | Web-responsive covers MVP; native wraps the same API once traction justifies it |
| Multi-language / i18n support | Prioritize after core-market validation |
| SMS notifications (Twilio) | Email + in-app sufficient for MVP; add once phone-verification adoption is high |
| Neo4j-backed recommendation graph | Only needed if `$graphLookup` traversal performance degrades at scale |
| Insurance-backed deposit protection partnership | Business-development track, not an engineering MVP concern |
| Community marketplace analytics benchmarking (compare your community to similar ones) | Requires critical mass of communities on-platform |
| TypeScript migration (backend + frontend) | JSDoc-typed JS is sufficient for MVP velocity; TS migration is a natural post-MVP hardening milestone |
| Admin-configurable custom item categories per community | Fixed taxonomy (Part 4 §11.4) is sufficient at MVP; make configurable once real usage reveals gaps |
| Offline-capable PWA mode for QR scanning in poor connectivity | Nice-to-have hardening once core flow is stable |

---

## 35. Phased Development Roadmap

### Phase 0 — Foundations (Week 1)
- Repo scaffolding (backend + frontend + Docker Compose skeleton), env config, DB connection, base Express app with health check, base React app shell with routing skeleton, CI pipeline skeleton (lint+test only, no deploy yet), design tokens + Tailwind config.

### Phase 1 — Auth & Onboarding (Weeks 2–3)
- Full auth module (register/OTP/login/refresh/forgot-reset password), RBAC middleware, community search/request, membership join/approve flow, profile completion onboarding, public landing/marketing pages.
- **Milestone gate:** a user can register, verify, join or request a community, and land on an empty dashboard.

### Phase 2 — Listings & Discovery (Weeks 4–5)
- Listing CRUD + Cloudinary image upload, availability calendar computation, browse/search/filter, item detail page, wishlist.
- **Milestone gate:** a user can create a listing and another user can find it via search/filter.

### Phase 3 — Booking Core (Weeks 6–7)
- Booking request/approve/decline/cancel state machine, interval-overlap enforcement, QR token generation + pickup/return scan endpoints and pages, booking history views.
- **Milestone gate:** full request→approve→pickup-scan→return-scan cycle works end-to-end between two seeded test users.

### Phase 4 — Trust, Ratings & Disputes (Weeks 8–9)
- Ratings submission + aggregation, trust score event ledger + denormalized rollup + badges, damage report filing + admin resolution flow, deposit hold/release/deduction logic, audit log.
- **Milestone gate:** a disputed booking can be filed, reviewed by an admin, and resolved with a correctly adjusted deposit ledger entry.

### Phase 5 — Real-time & Notifications (Weeks 10–11)
- Socket.IO chat (threads, typing, read receipts, image sharing), in-app + email notification pipeline, background job scheduler (reminders, auto-decline, auto-release, late-return sweep).
- **Milestone gate:** a return reminder fires on schedule and a chat message delivers in real time between two open sessions.

### Phase 6 — Feed, Analytics & Admin Panels (Weeks 12–13)
- Community feed aggregation, resident + community analytics dashboards (with scheduled aggregation job), Community Admin panel (members/listings/bookings/disputes/announcements/reports), Super Admin platform panel (community approval, global users, platform analytics, audit log).
- **Milestone gate:** an admin can approve a pending community, and analytics dashboards render non-trivial seeded data.

### Phase 7 — Polish, Reports, DevOps Hardening (Weeks 14–15)
- PDF report generation (async job), skeleton/empty/error states audit across every list view, dark mode QA pass, mobile responsiveness QA pass, accessibility pass, full Dockerization + docker-compose production profile, GitHub Actions full CI/CD (build/push/deploy/health-check), AWS EC2 + Nginx + MongoDB Atlas production deployment, security hardening pass (rate limits, Helmet, audit logging review).
- **Milestone gate:** `main` branch pushes auto-deploy to a live AWS URL passing the `/health` check, with HTTPS and a custom domain.

### Phase 8 — Portfolio Readiness (Week 16)
- Seed a realistic demo community with varied data (multiple item categories, in-flight and completed bookings, a resolved dispute, populated analytics) for interview walkthroughs; record a short product demo; finalize README with architecture diagram, setup instructions, and a "what I'd build next" section referencing Part 10 §34.

---

## 36–37. Implementation Roadmap Summary Table

| Milestone | Deliverable | Depends on |
|---|---|---|
| M1 | Auth + onboarding functional | Phase 0 |
| M2 | Listings discoverable | M1 |
| M3 | End-to-end booking cycle via QR | M2 |
| M4 | Trust/rating/dispute system live | M3 |
| M5 | Real-time chat + notification pipeline | M3 |
| M6 | Admin + Super Admin panels + analytics | M4, M5 |
| M7 | Production deployment (Docker/CI-CD/AWS) live | M1–M6 |
| M8 | Portfolio-ready demo + documentation | M7 |

This phased structure is intentionally sequential-dependency-aware so that an AI coding agent (Antigravity) or a human engineer can execute Parts 1–10 of this specification set milestone-by-milestone without needing to backtrack architecture decisions mid-build.

---

*This concludes the apt.share specification set (Parts 1–10). See `00-master-index.md` for the full document map.*
