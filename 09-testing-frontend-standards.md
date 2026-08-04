# apt.share — Part 9: Testing Strategy, UI Architecture & Coding Standards

---

## 26. Testing Strategy

### 26.1 Backend

- **Unit tests (Jest):** pure service-layer logic — interval overlap detection, trust score computation, QR token generation/validation, deposit release calculation. Target ≥80% coverage on `services/` and `utils/`.
- **Integration tests (Jest + Supertest):** full request→response cycles against an in-memory MongoDB (`mongodb-memory-server`) for critical flows: register→verify→login, create listing, request→approve→pickup→return booking cycle, dispute filing/resolution, RBAC rejection cases (wrong role, wrong community).
- **API contract tests:** every endpoint in Part 6 has at least one happy-path and one error-path (validation, auth, not-found) test.
- **Test data:** `scripts/seed.js` reused as fixture factory for integration tests (consistent, realistic seed communities/users/listings).

### 26.2 Frontend

- **Component tests (Jest + React Testing Library):** shared UI primitives (`Button`, `Modal`, `Calendar`, `DataTable`) tested for accessibility roles, keyboard interaction, and state rendering (loading/empty/error/success).
- **Integration/flow tests:** booking request flow, listing creation multi-step form, QR scan page camera-permission fallback state.
- **E2E (optional, Cypress/Playwright, post-MVP milestone):** critical path — register → join community → browse → book → approve → pickup scan → return scan → rate.

### 26.3 CI enforcement

Both `lint` and `test` (with coverage threshold) run as required GitHub Actions checks (Part 8 §21) before any merge to `main`; coverage regressions below threshold fail the build.

---

## 27. UI Component Hierarchy

```
AppShell
├── Sidebar
│   ├── NavItem (×N)
│   └── CommunitySwitcher
├── Topbar
│   ├── GlobalSearchInput
│   ├── NotificationBell → NotificationDropdown
│   ├── ThemeToggle
│   └── ProfileMenu
└── <Outlet /> (page content)
     │
     ├── DashboardPage
     │   ├── StatCard (×4: Borrowed / Lent / Pending / Upcoming Returns)
     │   ├── ActivityFeed
     │   ├── QuickActions
     │   └── CalendarWidget
     │
     ├── BrowsePage
     │   ├── FilterBar (chips: Available Today, Verified, Top Rated, ...)
     │   ├── SearchInput
     │   ├── ListingGrid
     │   │   └── ListingCard (×N) → image, title, badges, price/free tag, rating
     │   ├── SkeletonGrid (loading state)
     │   └── EmptyState (zero results → suggests wishlist)
     │
     ├── ItemDetailPage
     │   ├── ImageGallery
     │   ├── OwnerCard (avatar, trust badge, rating)
     │   ├── AvailabilityCalendar
     │   ├── BookingRequestForm
     │   └── RatingsList
     │
     ├── ItemFormPage (multi-step)
     │   ├── StepIndicator
     │   ├── StepBasicInfo / StepPhotos / StepPricing / StepAvailability / StepReview
     │
     ├── BookingsPage
     │   ├── Tabs (Borrowed / Lent)
     │   ├── BookingList → BookingRow (status Badge, dates, quick actions)
     │
     ├── BookingDetailPage
     │   ├── StatusTimeline
     │   ├── QrCodeDisplay
     │   ├── ChatLinkCard
     │   └── ActionButtons (context-sensitive: Approve/Decline/Cancel/Rate/Dispute)
     │
     ├── ChatThreadPage
     │   ├── MessageList (virtualized)
     │   ├── TypingIndicator
     │   └── MessageComposer
     │
     └── AdminOverviewPage
         ├── StatCard (×N)
         ├── PendingApprovalsTable
         └── DisputeQueueTable
```

**Shared primitives (`components/ui/`):** `Button`, `IconButton`, `Input`, `Select`, `DatePicker`, `Modal`, `Drawer`, `Card`, `Badge`, `Avatar`, `Tabs`, `Toast`, `Skeleton`, `EmptyState`, `Tooltip`, `Dropdown`, `Pagination`. All theme-aware via CSS variables (dark/light), all keyboard-accessible.

---

## 28. State Management Plan

| State category | Tool | Rationale |
|---|---|---|
| Server state (listings, bookings, users, notifications, chat history) | **React Query (TanStack Query)** | built-in caching, background refetch, pagination, optimistic updates for mutations (e.g., instant "Approved" UI on booking approve, rolled back on failure) |
| Auth/session state | **AuthProvider (React Context) + `authStore`** (lightweight, e.g. Zustand) | needs to be read by route guards outside the React Query cache lifecycle |
| Active community context | **CommunityProvider (Context)** | cross-cutting, read by nearly every data-fetching hook to scope queries |
| Real-time chat/notification events | **SocketProvider (Context) + React Query cache updates** | socket events directly patch the relevant React Query cache entries (e.g., new message pushes into the thread's message list) rather than maintaining a parallel store |
| Ephemeral UI state (modals, drawers, filter chips, theme) | **local component state / `uiStore` (Zustand)** | doesn't need server sync or global auth awareness |
| Form state | **React Hook Form** per form, validated with the shared Zod schemas also used server-side (schema reuse where feasible via a shared `validation` package) | minimizes re-renders on multi-step forms like `ItemFormPage` |

**Rule of thumb:** if the data originates from the API, it lives in React Query. If it's purely client-side ephemeral UI, it lives in local/Zustand state. Global Redux-style stores are deliberately avoided to reduce boilerplate — this is a conscious architecture decision to keep the codebase approachable for a portfolio/interview walkthrough.

---

## 29. Coding Standards

- **Language:** JavaScript (ES2022+) throughout; JSDoc type annotations encouraged on service-layer functions for editor intellisense (TypeScript migration path noted in Future Enhancements).
- **Formatting:** Prettier, 2-space indent, single quotes, trailing commas — enforced via pre-commit hook (`husky` + `lint-staged`) and CI gate, not manually policed in review.
- **Linting:** ESLint with `airbnb-base` (backend) / `airbnb` + `react-hooks` + `jsx-a11y` (frontend) rule sets; no `console.log` in committed backend code (use the logger); no unused variables/imports.
- **Commits:** Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`) to keep history scannable and enable future changelog automation.
- **Branching:** `main` (production, protected) ← `develop` (integration) ← `feature/*` branches; PRs require passing CI + one review approval (even if self-reviewed for a solo portfolio build, structure it as if a team gate exists).
- **No business logic in controllers or React page components** — controllers/pages orchestrate; services/hooks compute.
- **Every exported function** that isn't self-evident gets a one-line JSDoc comment describing intent, not restating the code.

---

## 30. Naming Conventions

| Element | Convention | Example |
|---|---|---|
| MongoDB collections | plural, camelCase | `damageReports` |
| Mongoose model files | PascalCase + `.model.js` | `DamageReport.model.js` |
| Backend route files | kebab/camel + `.routes.js` | `bookings.routes.js` |
| React components | PascalCase, one component per file matching filename | `BookingDetailPage.jsx` |
| React hooks | `use` prefix, camelCase | `useBookingActions.js` |
| CSS/Tailwind design tokens | kebab-case CSS variables | `--color-surface-elevated` |
| Environment variables | SCREAMING_SNAKE_CASE | `JWT_ACCESS_SECRET` |
| API route paths | kebab-case, plural resource nouns | `/damage-reports` |
| Enum-like string fields | snake_case values | `under_maintenance` |
| Boolean fields/vars | `is`/`has`/`can` prefix | `isActiveContext`, `hasDispute` |
| Event names (Socket.IO) | `noun:verb` | `message:new`, `typing:start` |

---

## 31. Reusable Component Strategy

- **Atomic layering:** `components/ui` (primitives, zero business logic) → `components/data-display` and `components/forms` (composed, still business-agnostic) → `features/*` (business-aware hooks/api) → `pages/*` (compose features + components into a route).
- **No page-specific one-off components living outside `pages/`** unless they're proven reusable across ≥2 pages, at which point they're promoted into `components/`.
- **Design tokens over hardcoded values:** every color, spacing, radius, and shadow used in a component references a Tailwind config token or CSS variable (Part 10 design system), never a raw hex/px value inline — this is what makes dark mode a config change, not a rewrite.
- **Every list-rendering component ships with three states by construction:** loading (`Skeleton*` variant), empty (`EmptyState` with a contextual CTA), and populated — a component is not considered done until all three exist.
- **Storybook (optional, recommended)** for the `components/ui` library to visually catalog states, useful both for development velocity and as a portfolio artifact demonstrating design-system thinking.

---

## 32. Mobile Responsiveness Guidelines

- **Breakpoints (Tailwind defaults):** `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px — mobile-first utility ordering (`class="flex-col md:flex-row"`).
- **Sidebar** collapses to a bottom tab bar or slide-out drawer below `md`; `Topbar` search collapses to an icon-triggered overlay.
- **QR scan pages** are mobile-primary by design (camera access), with a "use on your phone" nudge if accessed from a desktop viewport ≥`lg`.
- **Tables** (admin panels, booking lists) convert to stacked card layouts below `md` rather than horizontally scrolling raw tables.
- **Touch targets** minimum 44×44px on all interactive elements at mobile breakpoints.
- **Images** served via Cloudinary responsive `srcset` transformations matched to breakpoint-appropriate container widths, never a single full-resolution asset to all viewports.

*Continue to Part 10: Design System Reference & Part 11: Future Enhancements and Phased Roadmap.*
