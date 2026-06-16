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
} as const

export interface NavItem {
    label: string
    path: string
    requiresAuth?: boolean
    requiresAdmin?: boolean
}

export const NAV_ITEMS: NavItem[] = [
    {
        label: 'Home',
        path: ROUTES.home,
    },
    {
        label: 'My Tasks',
        path: ROUTES.myTasks,
        requiresAuth: true,
    },
    {
        label: 'Profile',
        path: ROUTES.profile,
        requiresAuth: true,
    },
    {
        label: 'Admin Users',
        path: ROUTES.adminUsers,
        requiresAuth: true,
        requiresAdmin: true,
    },
]