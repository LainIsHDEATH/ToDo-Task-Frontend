import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { ROUTES } from './config/routes'
import { CreateUserPage } from './pages/CreateUserPage'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { UpdateUserPage } from './pages/UpdateUserPage'
import { UsersPage } from './pages/UsersPage'

function App() {
    return (
        <Routes>
            <Route element={<AppLayout />}>
                <Route path={ROUTES.home} element={<HomePage />} />
                <Route path={ROUTES.users} element={<UsersPage />} />
                <Route path={ROUTES.createUser} element={<CreateUserPage />} />
                <Route path="/users/:userId/edit" element={<UpdateUserPage />} />
                <Route path="/404" element={<NotFoundPage />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
            </Route>
        </Routes>
    )
}

export default App