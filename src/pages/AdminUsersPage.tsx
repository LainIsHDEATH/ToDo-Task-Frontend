import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchAdminUsers, removeAdminUser } from '../api/adminUsersApi'
import { resolveApiErrorMessage } from '../api/httpClient'
import { PaginationControls } from '../components/pagination/PaginationControls'
import { ROUTES } from '../config/routes'
import type { UserResponse } from '../types/user'

const USER_SORT_OPTIONS = [
    { label: 'ID ↑', value: 'id,asc' },
    { label: 'ID ↓', value: 'id,desc' },
    { label: 'First name ↑', value: 'firstName,asc' },
    { label: 'First name ↓', value: 'firstName,desc' },
    { label: 'Last name ↑', value: 'lastName,asc' },
    { label: 'Last name ↓', value: 'lastName,desc' },
    { label: 'Email ↑', value: 'email,asc' },
    { label: 'Email ↓', value: 'email,desc' },
    { label: 'Role ↑', value: 'role,asc' },
    { label: 'Role ↓', value: 'role,desc' },
]

export function AdminUsersPage() {
    const queryClient = useQueryClient()

    const [page, setPage] = useState(0)
    const [size, setSize] = useState(20)
    const [sort, setSort] = useState('id,asc')

    const pageRequest = useMemo(
        () => ({
            page,
            size,
            sort,
        }),
        [page, size, sort],
    )

    const {
        data: usersPage,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['admin', 'users', pageRequest],
        queryFn: () => fetchAdminUsers(pageRequest),
    })

    const users = usersPage?.content ?? []

    const removeUserMutation = useMutation({
        mutationFn: removeAdminUser,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
        },
    })

    function handleSizeChange(nextSize: number) {
        setSize(nextSize)
        setPage(0)
    }

    function handleSortChange(nextSort: string) {
        setSort(nextSort)
        setPage(0)
    }

    return (
        <section>
            <div className="page-header">
                <div>
                    <h1>Admin Users</h1>
                    <p>Manage registered users.</p>
                </div>

                <Link className="button primary" to={ROUTES.createUser}>
                    Create New User
                </Link>
            </div>

            <div className="form">
                <div className="form-field">
                    <label htmlFor="userSort">Sort by</label>
                    <select
                        id="userSort"
                        value={sort}
                        disabled={isLoading}
                        onChange={(event) => handleSortChange(event.target.value)}
                    >
                        {USER_SORT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {error && <div className="error-state">{resolveApiErrorMessage(error)}</div>}

            {removeUserMutation.error && (
                <div className="error-state">
                    {resolveApiErrorMessage(removeUserMutation.error)}
                </div>
            )}

            {isLoading && <div className="loading-state">Loading users...</div>}

            {!isLoading && users.length === 0 && (
                <div className="empty-state">No users were found.</div>
            )}

            {!isLoading && users.length > 0 && (
                <table className="data-table">
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Full name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Operations</th>
                    </tr>
                    </thead>

                    <tbody>
                    {users.map((user: UserResponse, index: number) => (
                        <tr key={user.id}>
                            <td>{page * size + index + 1}</td>
                            <td>{getFullName(user)}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td className="actions-cell">
                                <Link className="button" to={ROUTES.adminUserTasks(user.id)}>
                                    Tasks
                                </Link>

                                <Link className="button" to={ROUTES.adminEditUser(user.id)}>
                                    Edit
                                </Link>

                                <button
                                    className="button danger"
                                    type="button"
                                    disabled={removeUserMutation.isPending}
                                    onClick={() => removeUserMutation.mutate(user.id)}
                                >
                                    Remove
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}

            <PaginationControls
                page={usersPage?.page ?? page}
                size={usersPage?.size ?? size}
                totalElements={usersPage?.totalElements ?? 0}
                totalPages={usersPage?.totalPages ?? 0}
                isLoading={isLoading}
                onPageChange={setPage}
                onSizeChange={handleSizeChange}
            />
        </section>
    )
}

function getFullName(user: UserResponse): string {
    return `${user.firstName} ${user.lastName}`.trim()
}