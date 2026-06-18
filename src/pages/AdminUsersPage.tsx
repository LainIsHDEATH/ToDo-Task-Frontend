import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchAdminUsers, removeAdminUser } from '../api/adminUsersApi'
import { resolveApiErrorMessage } from '../api/httpClient'
import { PaginationControls } from '../components/pagination/PaginationControls'
import { ROUTES } from '../config/routes'
import type { UserResponse, UserRole } from '../types/user'

type UserRoleFilter = 'ALL' | UserRole

export function AdminUsersPage() {
    const queryClient = useQueryClient()

    const [page, setPage] = useState(0)
    const [size, setSize] = useState(20)
    const [searchValue, setSearchValue] = useState('')
    const [roleFilter, setRoleFilter] = useState<UserRoleFilter>('ALL')

    const pageRequest = useMemo(
        () => ({
            page,
            size,
            sort: 'id,asc',
        }),
        [page, size],
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
    const filteredUsers = users.filter((user) => {
        const search = searchValue.trim().toLowerCase()
        const fullName = getFullName(user).toLowerCase()
        const email = user.email.toLowerCase()
        const matchesSearch = !search || fullName.includes(search) || email.includes(search)
        const matchesRole = roleFilter === 'ALL' || user.role === roleFilter

        return matchesSearch && matchesRole
    })

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

    function handleSearchChange(value: string) {
        setSearchValue(value)
        setPage(0)
    }

    function handleRoleFilterChange(value: UserRoleFilter) {
        setRoleFilter(value)
        setPage(0)
    }

    function handleClearFilters() {
        setSearchValue('')
        setRoleFilter('ALL')
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
                    <label htmlFor="userSearch">Search</label>
                    <input
                        id="userSearch"
                        type="text"
                        value={searchValue}
                        placeholder="Search by name or email"
                        onChange={(event) => handleSearchChange(event.target.value)}
                    />
                </div>

                <div className="form-field">
                    <label htmlFor="roleFilter">Role</label>
                    <select
                        id="roleFilter"
                        value={roleFilter}
                        onChange={(event) =>
                            handleRoleFilterChange(event.target.value as UserRoleFilter)
                        }
                    >
                        <option value="ALL">All roles</option>
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                    </select>
                </div>

                <div className="form-actions">
                    <button className="button" type="button" onClick={handleClearFilters}>
                        Clear Filters
                    </button>
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

            {!isLoading && users.length > 0 && filteredUsers.length === 0 && (
                <div className="empty-state">No users match selected filters.</div>
            )}

            {!isLoading && filteredUsers.length > 0 && (
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
                    {filteredUsers.map((user: UserResponse, index: number) => (
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