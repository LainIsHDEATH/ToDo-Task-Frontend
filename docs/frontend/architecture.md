# Frontend Architecture

This document covers the initial frontend planning tasks:

- FE-TASK-00-01 — Decide Frontend Architecture
- FE-TASK-00-02 — Define Frontend Project Structure
- FE-TASK-00-03 — Align Frontend Choice with Backend Security
- FE-TASK-00-04 — Confirm Required Frontend Pages

## FE-TASK-00-01 — Frontend Architecture Decision

The selected frontend approach is **React**.

The frontend is implemented as a standalone client application rather than server-rendered Thymeleaf templates.

### Decision

Use:

- React
- TypeScript
- Vite

### Reasoning

React is selected because the backend already exposes REST API endpoints and uses stateless JWT authentication. A separate frontend client fits this backend architecture better than Thymeleaf because the UI can communicate with the backend through HTTP API calls and can be developed independently from the Spring Boot application.

TypeScript is selected because the project is already initialized as React + TypeScript and frontend code will work with backend DTO-like request and response objects.

Vite is selected because it provides a simple React development setup with fast local development and minimal configuration.

## FE-TASK-00-02 — Planned Project Structure

The frontend project is located at the repository root because this repository is dedicated to the frontend only.

Planned structure:

```text
.
├── docs/
│   └── frontend/
│       └── architecture.md
├── index.html
├── package.json
├── vite.config.ts
└── src/
    ├── api/
    ├── components/
    │   └── layout/
    ├── config/
    ├── pages/
    ├── types/
    ├── App.tsx
    ├── main.tsx
    └── index.css
```

### Directory responsibilities

| Directory | Responsibility |
| --- | --- |
| `src/api` | Backend API client functions and centralized request handling. |
| `src/components` | Reusable UI components. |
| `src/components/layout` | Shared application layout, menu, and page shell. |
| `src/config` | Route constants and frontend configuration. |
| `src/pages` | Page-level components. |
| `src/types` | Shared TypeScript types used by frontend code. |

This structure should remain simple and should not introduce unnecessary abstractions before the application needs them.

## FE-TASK-00-03 — Backend Security Alignment

The selected frontend approach is React, so the frontend communicates with the backend through REST API calls.

### Authentication strategy

The selected authentication strategy is **JWT Bearer authentication**.

Expected flow:

1. User submits email and password on the frontend login page.
2. Frontend sends credentials to the backend login endpoint.
3. Backend returns a JWT access token.
4. Frontend stores the token on the client side.
5. Frontend sends authenticated requests with the `Authorization` header.

Header format:

```text
Authorization: Bearer <token>
```

### CORS

The backend must allow the frontend development origin.

Expected local frontend origin:

```text
http://localhost:5173
```

Expected local backend origin:

```text
http://localhost:8080
```

### CSRF

CSRF protection is not required for stateless JWT API requests when the backend does not use server-side sessions for authentication.

If the authentication approach changes to cookie-based sessions later, CSRF handling must be reviewed again.

## FE-TASK-00-04 — Required Frontend Pages

Required pages:

| Page | Planned route |
| --- | --- |
| Home page | `/` |
| Users page | `/users` |
| Create New User page | `/users/new` |
| Update Existing User page | `/users/:userId/edit` |
| User Tasks page | `/users/:userId/tasks` |
| Create New Task page | `/users/:userId/tasks/new` |
| Update Task page | `/tasks/:taskId/edit` |

Supporting page:

| Page | Planned route |
| --- | --- |
| Login page | `/login` |

### Required shared UI elements

The frontend must include:

- menu on all pages
- logo link to Home
- Home link to Home

## Scope of this document

This document defines the frontend direction and planned structure only. It does not implement the actual pages, forms, API integration, or styling tasks.
