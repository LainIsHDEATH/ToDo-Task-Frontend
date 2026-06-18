import type { PageResponse } from '../types/user'

export interface PageRequestParams {
    page: number
    size: number
    sort?: string
}

export const DEFAULT_PAGE_REQUEST: PageRequestParams = {
    page: 0,
    size: 20,
    sort: 'id,asc',
}

export function toPageResponse<T>(
    content: T[],
    params: PageRequestParams = DEFAULT_PAGE_REQUEST,
): PageResponse<T> {
    return {
        content,
        page: params.page,
        size: params.size,
        totalElements: content.length,
        totalPages: content.length === 0 ? 0 : 1,
        first: true,
        last: true,
    }
}