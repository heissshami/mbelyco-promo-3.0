# Implementation Plan for MBELYCO Promo 2.0

## Feature Analysis

### Identified Features:
- **Authentication & Authorization:** Comprehensive role-based access control (RBAC) system.
- **Admin Panel:** Centralized interface for managing the entire promo code system.
- **Administrative Dashboard:** Real-time visibility into system operations.
- **Batch Management:** Lifecycle management of promo code batches.
- **Promo Code Management:** Lifecycle management for individual promo codes.
- **Promo Code Generation:** Bulk generation of unique promo codes.
- **Promo Code Download:** Download batches of promo codes in PDF or CSV format.
- **Promo Code Verification:** Verify the validity of a promo code.
- **Promo Codes Import:** Import a list of promo codes from a CSV file.
- **System Notifications:** Real-time notification system for fraud reporting.
- **System Configuration:** Manage system settings for branding, security, notifications, and maintenance.
- **User Management:** Manage user accounts, roles, and permissions.
- **Customers Management:** Manage customer data.
- **Redemption Management:** Track and manage promo code redemptions.

### Feature Categorization:
- **Should-be-improved Features:** All listed features are to be built from the ground up based on the PRD.
- **Functioning Features:** None, this is a new implementation.
- **Third-party-integrated Features:**
    - Neon Database with Drizzle ORM
    - Better Auth for authentication
    - BullMQ with Upstash Redis for queue management

## Recommended Tech Stack
### Frontend:
- **Framework:** [Next.js](https://nextjs.org/docs) (with App Router) - A powerful React framework for building full-stack web applications.
- **Language:** [TypeScript](https://www.typescriptlang.org/) - A superset of JavaScript that adds static typing.
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework.
- **Component Library:** [Shadcn/ui](https://ui.shadcn.com/docs/) - A collection of accessible and composable UI components.
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs) - A minimal, hook-based state management library for React.
- **Forms:** [React Hook Form](https://react-hook-form.com/) - A performant, flexible, and extensible forms library for React.

### Backend:
- **Framework:** [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction) - Serverless API endpoints optimized for Vercel.
- **Database:** [Neon](https://neon.tech/docs) - A fully managed, serverless PostgreSQL database.
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/docs) - A lightweight and performant TypeScript ORM.
- **Authentication:** [Better Auth](https://www.better-auth.com/docs) - A framework-agnostic authentication and authorization library.
- **Queue Management:** [BullMQ](https://docs.bullmq.io/) with [Upstash Redis](https://upstash.com/docs/redis) - For background job processing.

### Testing:
- **Framework:** [Jest](https://jestjs.io/docs/getting-started) - A JavaScript testing framework for unit and integration testing.

## Implementation Stages
### Stage 1: Foundation & Setup
**Dependencies:** None
#### Sub-steps:
- [ ] Set up Next.js project with TypeScript and Tailwind CSS.
- [ ] Initialize Drizzle ORM and connect to the Neon database.
- [ ] Configure environment variables based on `.legacy/.env`.
- [ ] Set up Better Auth for authentication.
- [ ] Implement basic user registration and login.
- [ ] Set up BullMQ with Upstash Redis.
- [ ] Create basic project structure for the Modular Monolith.

### Stage 2: Core Features
**Dependencies:** Stage 1 completion
#### Sub-steps:
- [ ] Implement the database schema from the PRD.
- [ ] Implement User Management (CRUD for users and roles).
- [ ] Implement Batch Management (CRUD for batches).
- [ ] Implement Promo Code Generation as a background job using BullMQ.
- [ ] Implement Promo Code Management (CRUD for promo codes).
- [ ] Implement the Administrative Dashboard with basic metrics.

### Stage 3: Advanced Features
**Dependencies:** Stage 2 completion
#### Sub-steps:
- [ ] Implement Promo Code Verification and Redemption.
- [ ] Implement Customer Management.
- [ ] Implement Redemption Management.
- [ ] Implement Promo Code Import from CSV as a background job.
- [ ] Implement Promo Code Download in PDF and CSV formats.
- [ ] Implement the System Notifications for fraud reporting.

### Stage 4: Polish & Optimization
**Dependencies:** Stage 3 completion
#### Sub-steps:
- [ ] Implement the full System Configuration management.
- [ ] Write unit and integration tests with Jest.
- [ ] Refine UI/UX using Shadcn/ui and global styles from `.legacy/index.css`.
- [ ] Conduct comprehensive testing and bug fixing.
- [ ] Optimize performance and prepare for deployment.

## Resource Links
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Shadcn/ui Documentation](https://ui.shadcn.com/docs)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [React Hook Form Documentation](https://react-hook-form.com/get-started)
- [Neon Documentation](https://neon.tech/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs)
- [Better Auth Documentation](https://www.better-auth.com/docs)
- [BullMQ Documentation](https://docs.bullmq.io/)
- [Upstash Redis Documentation](https://upstash.com/docs/redis)
- [Jest Documentation](https://jestjs.io/docs/getting-started)