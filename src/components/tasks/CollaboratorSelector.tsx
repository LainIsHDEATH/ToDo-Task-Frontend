import type { UserShortResponse } from '../../types/user'

interface CollaboratorSelectorProps {
    availableUsers: UserShortResponse[]
    selectedCollaborators: UserShortResponse[]
    selectedCollaboratorId: string
    excludedUserId?: number | null
    error?: string | null
    isLoading?: boolean
    disabled?: boolean
    onSelectedCollaboratorIdChange: (collaboratorId: string) => void
    onSelectedCollaboratorsChange: (collaborators: UserShortResponse[]) => void
    onErrorChange: (error: string | null) => void
}

export function CollaboratorSelector({
                                         availableUsers,
                                         selectedCollaborators,
                                         selectedCollaboratorId,
                                         excludedUserId,
                                         error,
                                         isLoading = false,
                                         disabled = false,
                                         onSelectedCollaboratorIdChange,
                                         onSelectedCollaboratorsChange,
                                         onErrorChange,
                                     }: CollaboratorSelectorProps) {
    const selectableUsers = availableUsers.filter(
        (user) =>
            user.id !== excludedUserId &&
            !selectedCollaborators.some((collaborator) => collaborator.id === user.id),
    )

    function handleAddCollaborator() {
        const collaboratorId = Number(selectedCollaboratorId)

        if (!Number.isInteger(collaboratorId) || collaboratorId <= 0) {
            onErrorChange('Select collaborator first.')
            return
        }

        if (collaboratorId === excludedUserId) {
            onErrorChange('Task owner cannot be collaborator.')
            return
        }

        if (selectedCollaborators.some((collaborator) => collaborator.id === collaboratorId)) {
            onErrorChange('Collaborator is already selected.')
            return
        }

        const collaborator = availableUsers.find((user) => user.id === collaboratorId)

        if (!collaborator) {
            onErrorChange('Selected collaborator was not found.')
            return
        }

        onSelectedCollaboratorsChange([...selectedCollaborators, collaborator])
        onSelectedCollaboratorIdChange('')
        onErrorChange(null)
    }

    function handleRemoveCollaborator(collaboratorId: number) {
        onSelectedCollaboratorsChange(
            selectedCollaborators.filter((collaborator) => collaborator.id !== collaboratorId),
        )
        onErrorChange(null)
    }

    return (
        <section className="collaborators-section">
            <h2>Collaborators</h2>

            {isLoading && <div className="loading-state">Loading collaborators...</div>}

            {!isLoading && (
                <div className="collaborator-selector">
                    <select
                        aria-label="Collaborator"
                        value={selectedCollaboratorId}
                        disabled={selectableUsers.length === 0 || disabled}
                        onChange={(event) => {
                            onSelectedCollaboratorIdChange(event.target.value)
                            onErrorChange(null)
                        }}
                    >
                        <option value="">Select collaborator</option>

                        {selectableUsers.map((user) => (
                            <option key={user.id} value={user.id}>
                                {formatUserOption(user)}
                            </option>
                        ))}
                    </select>

                    <button
                        className="button"
                        type="button"
                        disabled={!selectedCollaboratorId || disabled}
                        onClick={handleAddCollaborator}
                    >
                        Add Collaborator
                    </button>
                </div>
            )}

            {error && <span className="field-error">{error}</span>}

            {selectedCollaborators.length === 0 && (
                <div className="empty-state">No collaborators selected.</div>
            )}

            {selectedCollaborators.length > 0 && (
                <ul className="collaborator-list">
                    {selectedCollaborators.map((collaborator) => (
                        <li key={collaborator.id} className="collaborator-list-item">
                            <span>{formatUserOption(collaborator)}</span>

                            <button
                                className="button danger"
                                type="button"
                                disabled={disabled}
                                onClick={() => handleRemoveCollaborator(collaborator.id)}
                            >
                                Remove
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}

function formatUserOption(user: UserShortResponse): string {
    const fullName = `${user.firstName} ${user.lastName}`.trim()

    if (!fullName) {
        return user.email
    }

    return `${fullName} (${user.email})`
}