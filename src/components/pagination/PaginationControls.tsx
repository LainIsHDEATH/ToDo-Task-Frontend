interface PaginationControlsProps {
    page: number
    size: number
    totalElements: number
    totalPages: number
    isLoading?: boolean
    onPageChange: (page: number) => void
    onSizeChange: (size: number) => void
}

const PAGE_SIZES = [5, 10, 20, 50]

export function PaginationControls({
                                       page,
                                       size,
                                       totalElements,
                                       totalPages,
                                       isLoading = false,
                                       onPageChange,
                                       onSizeChange,
                                   }: PaginationControlsProps) {
    const normalizedTotalPages = Math.max(totalPages, 1)
    const isFirstPage = page <= 0
    const isLastPage = page >= normalizedTotalPages - 1

    return (
        <div className="pagination-controls">
            <div>
                Page {page + 1} of {normalizedTotalPages}. Total: {totalElements}
            </div>

            <div className="form-actions">
                <button
                    className="button"
                    type="button"
                    disabled={isLoading || isFirstPage}
                    onClick={() => onPageChange(page - 1)}
                >
                    Previous
                </button>

                <button
                    className="button"
                    type="button"
                    disabled={isLoading || isLastPage}
                    onClick={() => onPageChange(page + 1)}
                >
                    Next
                </button>

                <select
                    aria-label="Page size"
                    value={size}
                    disabled={isLoading}
                    onChange={(event) => onSizeChange(Number(event.target.value))}
                >
                    {PAGE_SIZES.map((pageSize) => (
                        <option key={pageSize} value={pageSize}>
                            {pageSize} per page
                        </option>
                    ))}
                </select>
            </div>
        </div>
    )
}