import type { BaseSyntheticEvent, ReactNode } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { TASK_PRIORITIES, TASK_STATUSES } from '../../schemas/taskSchemas'
import type { TaskPriority, TaskStatus } from '../../types/task'

type TaskFormSubmitHandler = (event?: BaseSyntheticEvent) => Promise<void>

interface TaskFormErrors {
    name?: string
    priority?: string
    status?: string
}

interface TaskFormProps {
    onSubmit: TaskFormSubmitHandler
    nameRegistration: UseFormRegisterReturn<'name'>
    priorityRegistration: UseFormRegisterReturn<'priority'>
    statusRegistration?: UseFormRegisterReturn<'status'>
    errors: TaskFormErrors
    isPending: boolean
    submitLabel: string
    pendingSubmitLabel: string
    clearLabel?: string
    backTo: string
    backLabel: string
    onClear: () => void
    childrenBeforeFields?: ReactNode
    childrenAfterFields?: ReactNode
}

export function TaskForm({
                             onSubmit,
                             nameRegistration,
                             priorityRegistration,
                             statusRegistration,
                             errors,
                             isPending,
                             submitLabel,
                             pendingSubmitLabel,
                             clearLabel = 'Clear',
                             backTo,
                             backLabel,
                             onClear,
                             childrenBeforeFields,
                             childrenAfterFields,
                         }: TaskFormProps) {
    return (
        <form className="form" onSubmit={onSubmit} noValidate>
            {childrenBeforeFields}

            <div className="form-field">
                <label htmlFor="name">Name</label>
                <input
                    id="name"
                    type="text"
                    disabled={isPending}
                    {...nameRegistration}
                />
                {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="form-field">
                <label htmlFor="priority">Priority</label>
                <select
                    id="priority"
                    disabled={isPending}
                    {...priorityRegistration}
                >
                    {TASK_PRIORITIES.map((priority: TaskPriority) => (
                        <option key={priority} value={priority}>
                            {priority}
                        </option>
                    ))}
                </select>
                {errors.priority && <span className="field-error">{errors.priority}</span>}
            </div>

            {statusRegistration && (
                <div className="form-field">
                    <label htmlFor="status">Status</label>
                    <select
                        id="status"
                        disabled={isPending}
                        {...statusRegistration}
                    >
                        {TASK_STATUSES.map((status: TaskStatus) => (
                            <option key={status} value={status}>
                                {formatEnumValue(status)}
                            </option>
                        ))}
                    </select>
                    {errors.status && <span className="field-error">{errors.status}</span>}
                </div>
            )}

            {childrenAfterFields}

            <div className="form-actions">
                <button
                    className="button primary"
                    type="submit"
                    disabled={isPending}
                >
                    {isPending ? pendingSubmitLabel : submitLabel}
                </button>

                <button
                    className="button"
                    type="button"
                    disabled={isPending}
                    onClick={onClear}
                >
                    {clearLabel}
                </button>

                <Link className="button" to={backTo}>
                    {backLabel}
                </Link>
            </div>
        </form>
    )
}

function formatEnumValue(value: string): string {
    return value.replace(/_/g, ' ')
}