# Frontend Architecture

## Frontend Architecture

The selected frontend approach is:

```text
React + TypeScript
```

## Planned structure

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

| Directory               | Responsibility                                                 |
| ----------------------- | -------------------------------------------------------------- |
| `docs/frontend`         | Frontend planning and architecture documentation.              |
| `src/api`               | Backend API client functions and centralized request handling. |
| `src/components`        | Reusable UI components.                                        |
| `src/components/layout` | Shared application layout, menu, and page shell.               |
| `src/config`            | Route constants and frontend configuration.                    |
| `src/pages`             | Page-level components.                                         |
| `src/types`             | Shared TypeScript types used by frontend code.                 |

### Structure rules

The structure should stay simple. No unnecessary abstractions should be introduced before they are needed.

Recommended early structure:

```text
src/
├── api/
├── components/
├── config/
├── pages/
└── types/
```

## Aligned Frontend Choice with Backend Security

The selected frontend approach is React, so the frontend communicates with the backend through REST API calls.

### The selected authentication strategy is:

```text
JWT Bearer authentication
```

Header format:

```text
Authorization: Bearer <token>
```

### Token storage

Initial planned token storage:

```text
localStorage
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

### Backend security impact

For the React frontend, the backend should support:

* public login endpoint;
* public registration endpoint if registration remains open;
* protected user/task endpoints;
* JWT Bearer token authentication;
* CORS configuration for the frontend origin.

## Confirm Required Frontend Pages

The required frontend pages are listed below.

| Page                      | Planned route              | Purpose                                               |
| ------------------------- | -------------------------- | ----------------------------------------------------- |
| Home page                 | `/`                        | Landing page with application title, text, and image. |
| Users page                | `/users`                   | Display registered users in a table.                  |
| Create New User page      | `/users/new`               | Create a new user.                                    |
| Update Existing User page | `/users/:userId/edit`      | Update an existing user.                              |
| User Tasks page           | `/users/:userId/tasks`     | Display tasks owned by a selected user.               |
| Create New Task page      | `/users/:userId/tasks/new` | Create a task for a selected user.                    |
| Update Task page          | `/tasks/:taskId/edit`      | Update an existing task.                              |

### Additional page

| Page       | Planned route | Purpose                                  |
| ---------- | ------------- | ---------------------------------------- |
| Login page | `/login`      | Authenticate user and receive JWT token. |

### Required shared UI elements

The frontend must include:

* menu on all pages;
* logo link to Home;
* Home link to Home.

### Planned navigation

Initial menu items:

| Menu item | Route    |
| --------- | -------- |
| Logo      | `/`      |
| Home      | `/`      |
| Users     | `/users` |
| Login     | `/login` |