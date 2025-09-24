# Project Structure

## Root Directory

```
mbelyco-promo-2.0/
├── .vscode/
├── .env.example
├── .eslintrc.json
├── .gitignore
├── .prettierrc
├── components/
├── constants/
├── Docs/
│   ├── Implementation.md
│   ├── project_structure.md
│   └── UI_UX_doc.md
├── jobs/
├── lib/
├── modules/
├── next.config.mjs
├── package.json
├── postcss.config.js
├── public/
├── README.md
├── styles/
├── tailwind.config.ts
├── tsconfig.json
└── types/
```

## Detailed Structure

### Root Level

-   **`.vscode/`**: VSCode editor settings.
-   **`.env.example`**: Example environment variables. A `.env.local` file should be created based on this for local development, referencing variables from `.legacy/.env`.
-   **`.eslintrc.json`**: ESLint configuration for code linting.
-   **`.gitignore`**: Specifies intentionally untracked files to ignore.
-   **`.prettierrc`**: Prettier configuration for code formatting.
-   **`components/`**: Shared UI components used across different modules (e.g., layouts, buttons, inputs).
-   **`constants/`**: Application-wide constants (e.g., permission keys, route paths).
-   **`Docs/`**: Project documentation.
-   **`jobs/`**: BullMQ job definitions for background processing (e.g., promo code generation, CSV import).
-   **`lib/`**: Shared libraries and utility functions (e.g., database connection, auth utilities, Drizzle ORM instance).
-   **`modules/`**: The core of the Modular Monolith. Each sub-directory represents a distinct business domain or feature.
-   **`next.config.mjs`**: Next.js configuration file.
-   **`package.json`**: Project dependencies and scripts.
-   **`postcss.config.js`**: PostCSS configuration, used by Tailwind CSS.
-   **`public/`**: Static assets (e.g., images, fonts).
-   **`README.md`**: Project overview and setup instructions.
-   **`styles/`**: Global styles. The contents of `.legacy/index.css` will be adapted and placed here.
-   **`tailwind.config.ts`**: Tailwind CSS configuration.
-   **`tsconfig.json`**: TypeScript configuration.
-   **`types/`**: Global TypeScript type definitions.

### Modules Directory (`modules/`)

Each module within this directory is self-contained and represents a specific feature or domain of the application. This promotes separation of concerns and makes the codebase easier to maintain and scale.

```
modules/
├── admin/
│   ├── components/
│   ├── dashboard/
│   └── settings/
├── auth/
│   ├── components/
│   ├── lib/
│   └── services/
├── batch/
│   ├── components/
│   ├── lib/
│   └── services/
├── customer/
│   ├── components/
│   ├── lib/
│   └── services/
├── promocode/
│   ├── components/
│   ├── lib/
│   └── services/
└── redemption/
    ├── components/
    ├── lib/
    └── services/
```

-   **`admin/`**: Handles the main administrative panel, dashboard, and system settings.
-   **`auth/`**: Manages user authentication, authorization, roles, and permissions, integrating with Better Auth.
-   **`batch/`**: Responsible for batch management.
-   **`customer/`**: Manages customer data.
-   **`promocode/`**: Handles the creation, management, and validation of promo codes.
-   **`redemption/`**: Manages the redemption process.

### Inside a Module (e.g., `modules/promocode/`)

-   **`components/`**: React components specific to this module.
-   **`lib/`**: Module-specific utility functions and logic.
-   **`services/`**: Backend services, API route handlers, and business logic for the module.