import { Navigate, Route, Routes } from 'react-router-dom'
import { PublicOnlyRoute, RequireAdmin, RequireAuth } from './components/auth/AuthRoutes'
import { AppLayout } from './components/layout/AppLayout'
import { ROUTES } from './config/routes'
import { CreateMyTaskPage } from './pages/CreateMyTaskPage'
import { CreateTaskPage } from './pages/CreateTaskPage'
import { CreateUserPage } from './pages/CreateUserPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { MyTasksPage } from './pages/MyTasksPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProfilePage } from './pages/ProfilePage'
import { UpdateMyTaskPage } from './pages/UpdateMyTaskPage'
import { UpdateTaskPage } from './pages/UpdateTaskPage'
import { UpdateUserPage } from './pages/UpdateUserPage'
import { UsersPage } from './pages/UsersPage'
import { UserTasksPage } from './pages/UserTasksPage'

function App() {
    return (
        <Routes>
            <Route element={<AppLayout />}>
                <Route path={ROUTES.home} element={<HomePage />} />

                <Route element={<PublicOnlyRoute />}>
                    <Route path={ROUTES.login} element={<LoginPage />} />
                </Route>

                <Route path={ROUTES.createUser} element={<CreateUserPage />} />

                <Route element={<RequireAuth />}>
                    <Route path={ROUTES.profile} element={<ProfilePage />} />

                    <Route path={ROUTES.myTasks} element={<MyTasksPage />} />
                    <Route path={ROUTES.createMyTask} element={<CreateMyTaskPage />} />
                    <Route path="/tasks/:taskId/edit" element={<UpdateMyTaskPage />} />
                </Route>

                <Route element={<RequireAdmin />}>
                    <Route path={ROUTES.adminUsers} element={<UsersPage />} />
                    <Route path="/admin/users/:userId/edit" element={<UpdateUserPage />} />
                    <Route path="/admin/users/:userId/tasks" element={<UserTasksPage />} />
                    <Route path="/admin/users/:userId/tasks/new" element={<CreateTaskPage />} />
                    <Route path="/admin/users/:userId/tasks/:taskId/edit" element={<UpdateTaskPage />}/>
                </Route>

                <Route path="/404" element={<NotFoundPage />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
            </Route>
        </Routes>
    )
}

export default App