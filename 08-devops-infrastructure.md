# apt.share — Part 8: Docker Architecture, CI/CD, AWS Deployment, Security, Error Handling & Logging

---

## 20. Docker Architecture

### 20.1 Services

```
docker-compose.yml
├── frontend        (nginx-served static build of the React app)
├── backend          (Node.js/Express API + Socket.IO)
├── mongo            (MongoDB, dev/local only — production uses MongoDB Atlas)
├── redis            (Socket.IO adapter + refresh-token/session cache)
└── nginx             (reverse proxy in front of frontend+backend, prod only)
```

### 20.2 Backend Dockerfile (multi-stage)

```dockerfile
# Stage 1: install & build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev=false
COPY . .

# Stage 2: production image
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/src ./src
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://localhost:5000/health || exit 1
CMD ["node", "src/server.js"]
```

### 20.3 Frontend Dockerfile (multi-stage, build → static nginx serve)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://localhost/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
```

### 20.4 docker-compose.yml (development)

```yaml
version: "3.9"
services:
  backend:
    build: ./apt-share-backend
    ports: ["5000:5000"]
    env_file: ./apt-share-backend/.env
    depends_on: [mongo, redis]
    volumes: ["./apt-share-backend/src:/app/src"]

  frontend:
    build: ./apt-share-frontend
    ports: ["3000:80"]
    depends_on: [backend]

  mongo:
    image: mongo:7
    ports: ["27017:27017"]
    volumes: ["mongo_data:/data/db"]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

volumes:
  mongo_data:
```

Production compose swaps `mongo` for an Atlas connection string in `.env`, adds the `nginx` reverse-proxy service in front of `frontend`/`backend`, and removes bind-mount volumes (immutable images only).

### 20.5 Environment variables (`.env.example`, backend)

```
NODE_ENV=production
PORT=5000
MONGO_URI=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
REDIS_URL=
CORS_ALLOWED_ORIGINS=
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

---

## 21. GitHub Actions CI/CD Pipeline

```yaml
# .github/workflows/ci-cd.yml (conceptual stages)
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    strategy:
      matrix: { workspace: [apt-share-backend, apt-share-frontend] }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
        working-directory: ${{ matrix.workspace }}
      - run: npm run lint
        working-directory: ${{ matrix.workspace }}
      - run: npm test -- --ci --coverage
        working-directory: ${{ matrix.workspace }}

  docker-build-push:
    needs: lint-and-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with: { registry: ghcr.io, username: ${{ github.actor }}, password: ${{ secrets.GITHUB_TOKEN }} }
      - uses: docker/build-push-action@v5
        with:
          context: ./apt-share-backend
          push: true
          tags: ghcr.io/${{ github.repository }}/backend:${{ github.sha }},ghcr.io/${{ github.repository }}/backend:latest
      - uses: docker/build-push-action@v5
        with:
          context: ./apt-share-frontend
          push: true
          tags: ghcr.io/${{ github.repository }}/frontend:${{ github.sha }},ghcr.io/${{ github.repository }}/frontend:latest

  deploy-ec2:
    needs: docker-build-push
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: SSH deploy
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd /opt/apt-share
            docker compose pull
            docker compose up -d --remove-orphans
            docker image prune -f

  health-check:
    needs: deploy-ec2
    runs-on: ubuntu-latest
    steps:
      - name: Verify deployment
        run: |
          curl --fail https://api.aptshare.app/health || exit 1
```

**Pipeline gates:** PRs to `main` cannot merge unless `lint-and-test` passes for both workspaces (branch protection rule). Only pushes to `main` trigger build/push/deploy. `develop` branch runs lint+test only (staging deploy can be added identically, pointed at a staging EC2 host/compose stack).

---

## 22. AWS Deployment Architecture

```
                         ┌─────────────────────┐
                         │   Route 53 (DNS)      │
                         └──────────┬───────────┘
                                    │
                         ┌──────────▼───────────┐
                         │  Nginx (EC2, :443)    │  ← TLS via Let's Encrypt/Certbot
                         │  reverse proxy         │
                         └───┬───────────────┬───┘
                              │                │
                 /api/*      │                │  /*
                              ▼                ▼
                  ┌───────────────────┐  ┌──────────────────┐
                  │ backend container │  │ frontend container│
                  │ (Node/Express,    │  │ (static build,     │
                  │  Socket.IO :5000) │  │  served by its own  │
                  └─────────┬──────────┘  │  nginx, :80)        │
                             │             └──────────────────┘
              ┌──────────────┼───────────────┐
              ▼                              ▼
   ┌─────────────────────┐        ┌──────────────────┐
   │ MongoDB Atlas         │        │ Redis (EC2 or      │
   │ (managed, separate     │        │ ElastiCache)        │
   │ VPC peering/IP allow)  │        └──────────────────┘
   └─────────────────────┘
              │
              ▼
   ┌─────────────────────┐
   │ Cloudinary (external) │  ← all image storage/CDN, not on AWS
   └─────────────────────┘
```

- **EC2**: single t3.small/medium instance for MVP running Docker Compose (backend + frontend + nginx + redis containers); scale path documented in Part 11.
- **Nginx**: terminates TLS, routes `/api/*` and `/socket.io/*` to the backend container, everything else to the frontend container; gzip + static asset caching headers configured for the frontend.
- **MongoDB Atlas**: managed cluster (not self-hosted on EC2) for production — automated backups, IP allow-list restricted to the EC2 instance's Elastic IP.
- **Secrets**: injected into the EC2 host via a `.env` file pulled from AWS Secrets Manager during deploy (never baked into the Docker image).
- **Elastic IP** attached to the EC2 instance so DNS (Route 53 A record) remains stable across instance restarts.

---

## 23. Security Design

- **Transport:** HTTPS everywhere (Nginx-terminated TLS, HTTP→HTTPS redirect, HSTS header).
- **Headers:** Helmet middleware sets CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy.
- **CORS:** explicit allow-list of frontend origin(s) from `CORS_ALLOWED_ORIGINS`; credentials-enabled only for that origin.
- **Rate limiting:** tiered — strict on `/auth/*` and `/bookings/:id/*-scan` (prevent brute force / QR guessing), moderate on general API, generous on read-only `GET` endpoints.
- **Input validation:** every mutating endpoint validated server-side against a Zod/Joi schema before touching the service layer; rejects unknown fields (whitelist, not blacklist).
- **Password security:** bcrypt with cost factor ≥12; no password ever logged, returned in a response, or included in JWT payload.
- **JWT security:** short-lived access tokens, rotated refresh tokens, `tokenVersion` claim allows immediate global invalidation (e.g., on password reset or suspected compromise) without waiting for token expiry.
- **File upload security:** MIME-type allow-list, size caps, files streamed directly to Cloudinary (never written to local disk on the API server) to avoid path-traversal/storage exhaustion risks.
- **Protected routes:** every non-public route passes through `authenticate` + `authorize`; community-scoped data additionally filtered by the requester's active `communityId` membership at the query level (never trust a client-supplied `communityId` alone).
- **Audit logs:** immutable, append-only `auditLogs` collection for all admin/dispute/community-approval actions, including actor, IP, and before/after metadata.
- **QR token security:** signed, single-use, short-expiry tokens (see Part 7 §17.1); scan endpoints are rate-limited and require the caller to be an authenticated booking participant.

---

## 24. Error Handling Strategy

- **Centralized `ApiError` class** (`utils/ApiError.js`): `{ statusCode, code, message, details }`, thrown from services/controllers.
- **`asyncHandler` wrapper** around every controller to funnel rejected promises into Express's error pipeline instead of requiring try/catch boilerplate everywhere.
- **Centralized `errorHandler` middleware** (last in the pipeline): maps known `ApiError` instances to the standard error envelope (§15); maps unexpected errors to a generic `500 INTERNAL_ERROR` with the raw error logged server-side but never leaked to the client (no stack traces in production responses).
- **Validation errors** return `400 VALIDATION_ERROR` with a field-level `details` array so the frontend can highlight specific inputs.
- **Frontend:** a top-level `ErrorBoundary` component catches render errors; API errors are surfaced via the toast system with the server-provided `message`, falling back to a generic "Something went wrong" for unmapped codes; 401 responses trigger a silent refresh-token attempt before falling back to a forced re-login.

---

## 25. Logging Strategy

- **Structured JSON logs** (winston or pino) with a consistent shape: `{ timestamp, level, requestId, userId?, route, message, meta }`.
- **`requestId` middleware** generates/propagates a correlation ID (from an inbound `X-Request-Id` header if present) attached to every log line and returned in the response header, enabling end-to-end tracing of a single request across async job hand-offs (e.g., an API request that enqueues an email job can be traced by `requestId` through both).
- **Log levels:** `error` (unhandled exceptions, failed payment/deposit operations), `warn` (rate-limit hits, auth lockouts, retried jobs), `info` (business events: booking state transitions, dispute filed/resolved), `debug` (verbose, dev-only).
- **Business/audit events** are additionally persisted to the `auditLogs` collection (durable, queryable) separately from ephemeral application logs (which may be shipped to CloudWatch or a log-aggregation service and rotated).
- **No PII in logs** beyond `userId`/`email` where operationally necessary; never log passwords, tokens, or full card/deposit numbers (N/A at MVP scope since no live payment gateway is integrated).

*Continue to Part 9: Testing Strategy, UI Component Hierarchy, State Management & Coding Standards.*
