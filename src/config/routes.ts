export const ROUTES = {
    home: '/',
    login: '/login',

    createUser: '/users/new',

    profile: '/profile',

    myTasks: '/tasks',
    createMyTask: '/tasks/new',
    editMyTask: (taskId: number | string) => `/tasks/${taskId}/edit`,

    adminUsers: '/admin/users',
    adminEditUser: (userId: number | string) => `/admin/users/${userId}/edit`,
    adminUserTasks: (userId: number | string) => `/admin/users/${userId}/tasks`,
    adminCreateUserTask: (userId: number | string) =>
        `/admin/users/${userId}/tasks/new`,
    adminEditUserTask: (userId: number | string, taskId: number | string) =>
        `/admin/users/${userId}/tasks/${taskId}/edit`,

    // Temporary aliases for existing admin-oriented pages.
    // These can be removed after FE-TASK-ROLE-22/23/24.
    users: '/admin/users',
    editUser: (userId: number | string) => `/admin/users/${userId}/edit`,
    userTasks: (userId: number | string) => `/admin/users/${userId}/tasks`,
    createTask: (userId: number | string) => `/admin/users/${userId}/tasks/new`,
    editTask: (userId: number | string, taskId: number | string) =>
        `/admin/users/${userId}/tasks/${taskId}/edit`,
} as const

export const NAV_ITEMS = [
    {
        label: 'Home',
        path: ROUTES.home,
        requiresAuth: false,
    },
    {
        label: 'Users',
        path: ROUTES.adminUsers,
        requiresAuth: true,
        requiresAdmin: true,
    },
] as const