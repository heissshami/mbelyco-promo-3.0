# UI/UX Documentation

## Overview

This document outlines the UI/UX design guidelines for the MBELYCO Promo 2.0 application. Our design system is built upon a combination of **Tailwind CSS** for utility-first styling and **Shadcn/ui** for a set of pre-built, accessible, and customizable components.

## Core Principles

-   **Consistency**: Maintain a consistent look and feel across the application by reusing components and adhering to the defined color palette and typography.
-   **Clarity**: Ensure that the UI is intuitive and easy to navigate for all user roles.
-   **Accessibility**: Follow accessibility best practices to make the application usable for everyone.

## Technology Stack

-   **[Tailwind CSS](https://tailwindcss.com/)**: A utility-first CSS framework for rapid UI development.
-   **[Shadcn/ui](https://ui.shadcn.com/)**: A collection of beautifully designed components that are accessible and customizable.

## Color Palette and Theming

The primary color palette and theme variables are defined in `styles/globals.css`. These variables are derived from the styles originally provided in `.legacy/index.css` and are configured to work with Tailwind CSS and Shadcn/ui's theming system.

### Theme Variables

The following CSS variables are defined in `tailwind.config.ts` and are used throughout the application to ensure a consistent theme. These are based on the values from `.legacy/index.css`.

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    /* ... dark theme variables ... */
  }
}
```

## Component Library: Shadcn/ui

We will use Shadcn/ui for our component library. The components are installed via the CLI and can be customized to fit our specific needs. Key components include:

-   **Button**: For actions in forms, dialogs, etc.
-   **Card**: For displaying content in a structured manner.
-   **Input**: For user input in forms.
-   **Table**: For displaying tabular data.
-   **Dialog**: For modal windows.
-   **DropdownMenu**: For creating dropdown menus.

### Component Implementation

When implementing new UI features, always check if a suitable component exists in Shadcn/ui before creating a new one. Components should be placed in the `components/` directory for shared components or within the `components/` directory of a specific module for module-specific components.

## Best Practices

-   **Responsive Design**: All UI elements must be fully responsive and tested on various screen sizes, from mobile to desktop.
-   **State Management**: Use Zustand for managing UI state where necessary. For form state, use React Hook Form.
-   **Code Style**: Adhere to the project's ESLint and Prettier configurations for consistent code formatting.