export const ROUTES = {
    home: '/',
    login: '/login',
    users: '/users',
    createUser: '/users/new',
    editUser: (userId: number | string) => `/users/${userId}/edit`,
    userTasks: (userId: number | string) => `/users/${userId}/tasks`,
} as const

export const NAV_ITEMS = [
    {
        label: 'Home',
        path: ROUTES.home,
        requiresAuth: false,
    },
    {
        label: 'Users',
        path: ROUTES.users,
        requiresAuth: true,
    },
] as const