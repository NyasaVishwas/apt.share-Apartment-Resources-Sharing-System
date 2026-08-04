# apt.share — Part 5: Backend & Frontend Folder Structure

---

## 13. Backend Folder Structure (Node.js + Express + MongoDB)

```
apt-share-backend/
├── src/
│   ├── config/
│   │   ├── env.js                    # centralized env var loading + validation (Zod/Joi schema)
│   │   ├── db.js                     # Mongoose connection setup
│   │   ├── cloudinary.js
│   │   ├── socket.js                 # Socket.IO server setup + Redis adapter
│   │   └── logger.js                 # winston/pino instance
│   │
│   ├── models/
│   │   ├── User.model.js
│   │   ├── Community.model.js
│   │   ├── Membership.model.js
│   │   ├── Listing.model.js
│   │   ├── Booking.model.js
│   │   ├── ChatThread.model.js
│   │   ├── ChatMessage.model.js
│   │   ├── Notification.model.js
│   │   ├── Wishlist.model.js
│   │   ├── Rating.model.js
│   │   ├── TrustScoreEvent.model.js
│   │   ├── DamageReport.model.js
│   │   ├── Announcement.model.js
│   │   ├── AuditLog.model.js
│   │   ├── Report.model.js
│   │   └── AnalyticsSnapshot.model.js
│   │
│   ├── modules/                      # feature-first: each module = routes + controller + service + validation
│   │   ├── auth/
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   ├── auth.validation.js
│   │   │   └── auth.test.js
│   │   ├── users/
│   │   ├── communities/
│   │   ├── memberships/
│   │   ├── listings/
│   │   ├── bookings/
│   │   │   ├── bookings.routes.js
│   │   │   ├── bookings.controller.js
│   │   │   ├── bookings.service.js   # overlap-check, state machine logic lives here
│   │   │   ├── bookings.validation.js
│   │   │   └── bookings.test.js
│   │   ├── qr/                       # QR generation + scan validation
│   │   ├── chat/
│   │   ├── notifications/
│   │   ├── wishlist/
│   │   ├── ratings/
│   │   ├── trustScore/
│   │   ├── damageReports/
│   │   ├── announcements/
│   │   ├── analytics/
│   │   ├── reports/                  # PDF generation
│   │   └── admin/                    # community_admin + super_admin scoped endpoints
│   │
│   ├── middlewares/
│   │   ├── authenticate.js           # JWT verification
│   │   ├── authorize.js              # RBAC role/membership guard
│   │   ├── validateRequest.js        # generic schema-validation wrapper
│   │   ├── rateLimiter.js
│   │   ├── errorHandler.js           # centralized error → JSON response
│   │   ├── requestId.js              # attaches request ID for log tracing
│   │   └── notFound.js
│   │
│   ├── jobs/                         # scheduled/background tasks
│   │   ├── scheduler.js              # cron/agenda bootstrap
│   │   ├── returnReminder.job.js
│   │   ├── autoDeclineBooking.job.js
│   │   ├── autoReleaseDeposit.job.js
│   │   ├── lateReturnSweep.job.js
│   │   ├── analyticsAggregation.job.js
│   │   └── emailQueueProcessor.job.js
│   │
│   ├── utils/
│   │   ├── ApiError.js
│   │   ├── ApiResponse.js
│   │   ├── asyncHandler.js
│   │   ├── tokenUtils.js             # JWT sign/verify helpers
│   │   ├── otpUtils.js
│   │   ├── qrTokenUtils.js
│   │   ├── intervalOverlap.js        # DSA: interval scheduling helper
│   │   ├── priorityQueue.js          # DSA: notification scheduling
│   │   ├── heap.js                   # DSA: trending/top-rated computation
│   │   └── graph.js                  # DSA: recommendation engine
│   │
│   ├── emails/
│   │   ├── templates/                # HTML email templates (handlebars/ejs)
│   │   │   ├── otpVerification.html
│   │   │   ├── bookingApproved.html
│   │   │   ├── returnReminder.html
│   │   │   └── ...
│   │   └── mailer.js                 # Nodemailer transport wrapper
│   │
│   ├── sockets/
│   │   ├── chat.socket.js
│   │   └── presence.socket.js
│   │
│   ├── app.js                        # Express app assembly (middleware pipeline, route mounting)
│   └── server.js                     # HTTP server bootstrap, Socket.IO attach, graceful shutdown
│
├── tests/
│   ├── integration/
│   ├── unit/
│   └── setup/
│       └── testDb.js                 # in-memory Mongo for Jest
│
├── scripts/
│   ├── seed.js                       # seed demo communities/users/listings
│   └── migrate.js
│
├── .env.example
├── .eslintrc.js
├── .prettierrc
├── Dockerfile
├── docker-compose.yml (backend service definition, referenced by root compose)
├── jest.config.js
├── package.json
└── README.md
```

**Layering rule (enforced by convention + code review, referenced in NFR-MAINT-01):**
`routes → controller (HTTP concerns only) → service (business logic, DSA, state machines) → model (persistence)`.
Controllers never talk to Mongoose models directly.

---

## 14. Frontend Folder Structure (React + Tailwind)

```
apt-share-frontend/
├── public/
│   ├── favicon.svg
│   └── manifest.json
│
├── src/
│   ├── app/
│   │   ├── App.jsx                   # root component, router outlet
│   │   ├── routes.jsx                # centralized route config w/ guards
│   │   └── providers/
│   │       ├── AuthProvider.jsx
│   │       ├── ThemeProvider.jsx     # dark/light mode context
│   │       ├── CommunityProvider.jsx # active community context/switcher
│   │       ├── SocketProvider.jsx
│   │       └── ToastProvider.jsx
│   │
│   ├── pages/                        # route-level components, organized by IA (Part 3)
│   │   ├── public/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── FaqPage.jsx
│   │   │   └── ...
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── VerifyEmailPage.jsx
│   │   │   ├── ForgotPasswordPage.jsx
│   │   │   └── ResetPasswordPage.jsx
│   │   ├── onboarding/
│   │   ├── app/
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── BrowsePage.jsx
│   │   │   ├── ItemDetailPage.jsx
│   │   │   ├── ItemFormPage.jsx      # create/edit shared
│   │   │   ├── MyListingsPage.jsx
│   │   │   ├── BookingsPage.jsx
│   │   │   ├── BookingDetailPage.jsx
│   │   │   ├── QrScanPage.jsx
│   │   │   ├── WishlistPage.jsx
│   │   │   ├── ChatListPage.jsx
│   │   │   ├── ChatThreadPage.jsx
│   │   │   ├── NotificationsPage.jsx
│   │   │   ├── FeedPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── AnalyticsPage.jsx
│   │   │   ├── DisputePage.jsx
│   │   │   └── settings/
│   │   ├── admin/
│   │   └── platform/
│   │
│   ├── features/                     # feature-scoped logic: hooks, api calls, slices
│   │   ├── auth/
│   │   │   ├── api.js                # axios calls for this feature
│   │   │   ├── hooks.js              # useLogin, useRegister, etc.
│   │   │   └── types.js
│   │   ├── listings/
│   │   ├── bookings/
│   │   ├── chat/
│   │   ├── notifications/
│   │   ├── wishlist/
│   │   ├── ratings/
│   │   ├── analytics/
│   │   └── admin/
│   │
│   ├── components/                   # shared/reusable UI component library
│   │   ├── ui/                       # primitives: Button, Input, Card, Modal, Badge, Skeleton, Toast
│   │   ├── layout/                   # AppShell, Sidebar, Topbar, AdminShell, PublicShell
│   │   ├── data-display/             # DataTable, EmptyState, StatCard, Calendar
│   │   ├── forms/                    # form field wrappers, multi-step form scaffold
│   │   └── feedback/                 # LoadingSpinner, SkeletonList, ErrorBoundary
│   │
│   ├── lib/
│   │   ├── axiosClient.js            # axios instance with interceptors (auth header, refresh)
│   │   ├── socketClient.js
│   │   ├── queryClient.js            # React Query client config (recommended for server state)
│   │   ├── constants.js
│   │   └── validators.js             # shared client-side schema validators
│   │
│   ├── store/                        # global UI/client state (see Part 9 state mgmt plan)
│   │   ├── uiStore.js
│   │   └── authStore.js
│   │
│   ├── hooks/                        # cross-cutting hooks: useDebounce, usePagination, useMediaQuery
│   │
│   ├── styles/
│   │   ├── index.css                 # Tailwind directives + design tokens (CSS variables)
│   │   └── theme.js
│   │
│   ├── utils/
│   │   ├── formatCurrency.js
│   │   ├── formatDate.js
│   │   └── trustBadgeUtils.js
│   │
│   └── main.jsx
│
├── .env.example
├── .eslintrc.js
├── .prettierrc
├── Dockerfile
├── tailwind.config.js
├── vite.config.js                    # (Vite recommended over CRA for a modern SPA build)
├── package.json
└── README.md
```

**Component strategy pointer:** see Part 9 §31–35 for the full UI component hierarchy, state management plan, and reusable-component strategy.

*Continue to Part 6: REST API Design & Authentication Flow.*
