# CodeVault 🔒

A specialized bookmarking app for developers to save, tag, and search code snippets they frequently use. Built with a clean, modern "Cyber-Minimalist" aesthetic.

## Features
- **Full CRUD**: Create, read, update, and delete code snippets.
- **Tagging System**: Organize snippets with multiple tags.
- **Smart Search**: Search through titles, descriptions, and the code itself.
- **Syntax Highlighting**: Beautiful code previews for multiple languages.
- **Responsive Design**: Glassmorphic UI that works on all devices.
- **Copy to Clipboard**: Quick copy functionality with visual feedback.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Lucide Icons, Framer Motion, React Syntax Highlighter.
- **Backend**: Node.js, Express.
- **Database**: PostgreSQL.

## Getting Started

### 1. Database Setup
1. Create a PostgreSQL database named `codevault`.
2. Run the SQL commands in `server/schema.sql` to create the necessary tables.

### 2. Backend Configuration
1. Navigate to the `server` directory.
2. Create a `.env` file based on `.env.example`.
3. Fill in your PostgreSQL credentials.
4. Run `npm install`.
5. Start the server: `npm start` (or `npm run dev` if you have nodemon).

### 3. Frontend Configuration
1. Navigate to the `client` directory.
2. Run `npm install`.
3. Start the development server: `npm run dev`.

## Directory Structure
- `client/`: React + Vite frontend.
- `server/`: Node.js + Express + PostgreSQL backend.
- `server/schema.sql`: Database initialization script.
