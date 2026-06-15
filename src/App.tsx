import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute, PublicOnlyRoute } from './components/auth/AuthRoutes'
import { AppLayout } from './components/layout/AppLayout'
import { ROUTES } from './config/routes'
import { CreateTaskPage } from './pages/CreateTaskPage'
import { CreateUserPage } from './pages/CreateUserPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
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

                <Route element={<ProtectedRoute />}>
                    <Route path={ROUTES.users} element={<UsersPage />} />
                    <Route path="/users/:userId/edit" element={<UpdateUserPage />} />
                    <Route path="/users/:userId/tasks" element={<UserTasksPage />} />
                    <Route path="/users/:userId/tasks/new" element={<CreateTaskPage />} />
                    <Route path="/users/:userId/tasks/:taskId/edit" element={<UpdateTaskPage />} />
                </Route>

                <Route path="/404" element={<NotFoundPage />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
            </Route>
        </Routes>
    )
}

export default App