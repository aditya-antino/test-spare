
export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
    error?: string;
}

export interface PaginationMeta {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    meta: PaginationMeta;
}

export interface Pagination {
    current_page: number;
    total_pages: number;
    total_records: number;
    records_per_page: number;
    has_next: boolean;
    has_previous: boolean;
}

export interface GeoPoint {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
    crs?: {
        type: string;
        properties: {
            name: string;
        };
    };
}

export interface City {
    id: number;
    name: string;
    state: string;
}

export interface DdlData {
    id: number;
    name: string;
}

export interface Item {
    id: number | string;
    name: string;
    [key: string]: any;
}
