# apt.share — Complete Product & Engineering Specification

**Tagline:** Borrow More. Buy Less.
**Renamed from:** ShareNest → **apt.share**

This is the master index for the full specification set, designed to be handed to an AI coding agent (Antigravity) or an engineering team in sequential parts. Each part is self-contained but builds on the decisions made in earlier parts — build in order.

## How to use this with Antigravity

Feed the parts in **this order**, one at a time, as context for generating the actual codebase. Each part maps cleanly to a phase in the roadmap (Part 10 §35), so you can literally say *"build Phase 1 using Part 1, 2, 3, 6"* etc.

| # | File | Covers (original spec sections) |
|---|---|---|
| 1 | `01-product-vision-personas.md` | Executive Summary, Product Vision, Problem Statement, User Personas |
| 2 | `02-requirements.md` | Functional Requirements (FR-*), Non-Functional Requirements (NFR-*) |
| 3 | `03-information-architecture.md` | Complete Page Hierarchy, Navigation Flow, User Journeys, Information Architecture |
| 4 | `04-database-design.md` | Complete Database Schema, MongoDB Collections, ER Diagram Description |
| 5 | `05-folder-structure.md` | Backend Folder Structure, Frontend Folder Structure |
| 6 | `06-api-specification.md` | REST API Design, Authentication Flow |
| 7 | `07-workflows-and-dsa.md` | Booking Workflow, Notification Workflow, Recommendation Engine Design, DSA Usage Explanation |
| 8 | `08-devops-infrastructure.md` | Docker Architecture, GitHub Actions CI/CD, AWS Deployment Architecture, Security Design, Error Handling Strategy, Logging Strategy |
| 9 | `09-testing-frontend-standards.md` | Testing Strategy, UI Component Hierarchy, State Management Plan, Coding Standards, Naming Conventions, Reusable Component Strategy, Mobile Responsiveness Guidelines |
| 10 | `10-roadmap.md` | Design Tokens, Future Enhancements, Phased Development Roadmap, Implementation Milestones |

## Quick facts

- **Product:** community-gated resource-sharing platform (apartments, societies, hostels, campuses, coworking spaces).
- **Stack:** React + Tailwind (frontend) / Node.js + Express + MongoDB (backend) / JWT auth / Cloudinary / Socket.IO / Docker + GitHub Actions + AWS EC2 + Nginx.
- **Core loop:** List → Discover → Request → Approve → QR Pickup → Use → QR Return → Rate → Trust Score updates.
- **Differentiator vs. Marketplace apps:** hard community boundary + QR-verified handoff + deposit ledger + trust score, not an open classifieds board.

## Suggested next step

Start with Part 1 + Part 2 + Part 4 (vision, requirements, schema) as the first Antigravity prompt to scaffold models and core auth — this matches Phase 0–1 of the roadmap in Part 10.
