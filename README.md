# apt.share — Gated Resource-Sharing Engine

> **"Borrow More. Buy Less."**  
> A hyper-local, community-gated resource sharing platform for apartment societies, hostels, campuses, and coworking hubs.

---

## 🌟 Key Features & Architecture Highlights

- **🔒 Hard-Gated Multi-Tenant Architecture:** Strict boundary isolation ensuring items are only visible to verified residents within the same community.
- **⚡ Dynamic Handoff QR State Machine:** Cryptographic SHA-256 tokens generated for pickup and return, expiring every 15 minutes to guarantee physical item handoffs.
- **🛡️ Trust Score Ledger & Damage Disputes:** Denormalized 0–100 resident Trust Score recalculated via append-only event ledgers, security deposit holds/deductions, and immutable audit logs.
- **💬 Real-Time Socket.IO Chat:** Instant neighbor-to-neighbor messaging with typing indicators, read receipts, and in-app activity notifications.
- **🧠 Custom Data Structures & Algorithms (DSA):**
  - **Interval Overlap Check:** $O(N \log N)$ date range interval validation algorithm enforcing non-overlapping bookings per item.
  - **Min-Heap Priority Queue:** Efficient $O(\log N)$ dispatch queue for scheduling background return reminders.
  - **Max-Heap Top Lenders:** Leaderboard extraction for top community contributors.
  - **Category Affinity Graph BFS:** Multi-hop graph traversal algorithm powering item discovery and recommendations.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, TailwindCSS (Vanilla CSS tokens), Lucide React, Axios, Socket.IO Client |
| **Backend** | Node.js, Express, MongoDB & Mongoose, Socket.IO Server, JWT Auth, Helmet, Express-Rate-Limit |
| **DevOps & Infra** | Docker, Docker Compose, Nginx Reverse Proxy, GitHub Actions CI/CD |

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v20+
- MongoDB running locally on `mongodb://localhost:27017` (or Docker)

### Option 1: Running via Node.js

#### 1. Backend Setup
```bash
cd apt-share-backend
npm install
npm run seed  # Seed 8 demo items and 3 test users
npm run dev   # Express & Socket.IO server on http://localhost:5001
```

#### 2. Frontend Setup
```bash
cd apt-share-frontend
npm install
npm run dev   # Vite server on http://localhost:3000
```

---

### Option 2: Running via Docker Compose Stack

```bash
docker compose up --build
```
- Access Frontend SPA: `http://localhost`
- Access Backend API: `http://localhost:5001/health`

---

## 🧪 Test Suite Execution

Run all 6 backend integration test suites (`auth`, `listings`, `bookings`, `disputes`, `chat`, `analytics`):

```bash
cd apt-share-backend
npm test
```

---

## 📜 License

MIT License © 2026 apt.share Team
