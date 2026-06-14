# ToDo Tasks Frontend

Frontend client repository for the ToDo Tasks application.

## Selected frontend approach

```text
React + TypeScript
```

This decision is documented in:

```text
docs/frontend/architecture.md
```

## Planned project structure

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

## Planned pages

| Page                      | Planned route              |
| ------------------------- | -------------------------- |
| Home page                 | `/`                        |
| Users page                | `/users`                   |
| Create New User page      | `/users/new`               |
| Update Existing User page | `/users/:userId/edit`      |
| User Tasks page           | `/users/:userId/tasks`     |
| Create New Task page      | `/users/:userId/tasks/new` |
| Update Task page          | `/tasks/:taskId/edit`      |
| Login page                | `/login`                   |

## Security direction

The selected authentication approach is JWT Bearer authentication.

Expected local development origins:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:8080
```

Authenticated requests will use:

```text
Authorization: Bearer <token>
```
