# Installation Guide

This document outlines the dependencies and tools required to run the frontend application.

## Prerequisites

*   **Node.js** (which includes npm) must be installed on your system. You can download it from [https://nodejs.org/](https://nodejs.org/).

## Dependencies

The following libraries are used in this project and will be installed when you run `npm install`:

### Production Dependencies:

*   **@supabase/supabase-js**: JavaScript client for Supabase.
*   **framer-motion**: A production-ready motion library for React.
*   **html2canvas**: A JavaScript library to take "screenshots" of web pages or parts of it.
*   **react**: A JavaScript library for building user interfaces.
*   **react-dom**: Serves as the entry point to the DOM and server renderers for React.
*   **react-router-dom**: DOM bindings for React Router.

### Development Dependencies:

*   **@eslint/js**: The core rules for ESLint.
*   **@types/react**: TypeScript definitions for React.
*   **@types/react-dom**: TypeScript definitions for React DOM.
*   **@vitejs/plugin-react**: The official Vite plugin for React.
*   **autoprefixer**: A PostCSS plugin to parse CSS and add vendor prefixes to CSS rules.
*   **eslint**: A tool for identifying and reporting on patterns found in ECMAScript/JavaScript code.
*   **eslint-plugin-react-hooks**: ESLint rules for React Hooks.
*   **eslint-plugin-react-refresh**: An ESLint plugin for React Refresh.
*   **globals**: Global identifiers for ESLint.
*   **postcss**: A tool for transforming CSS with JavaScript.
*   **tailwindcss**: A utility-first CSS framework for rapidly building custom designs.
*   **vite**: A build tool that aims to provide a faster and leaner development experience for modern web projects.

## Setup

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```

2.  Install the dependencies using npm:
    ```bash
    npm install
    ```

## Available Scripts

In the `frontend` directory, you can run the following scripts:

*   `npm run dev`: Starts the development server.
*   `npm run build`: Builds the application for production.
*   `npm run lint`: Lints the code using ESLint.
*   `npm run preview`: Starts a local server to preview the production build.
