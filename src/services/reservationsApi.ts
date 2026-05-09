import { axiosInstance } from '@/lib/axiosInstance';
import type {
    ApiResponse,
    PaginatedResponse,
    Property,
    Space,
    Reservation,
    ReservationFilters,
    ExportOptions,
    PayoutBreakdown,
} from '@/types/api';

export const reservationsApi = {
    // Properties
    getProperties: async (): Promise<ApiResponse<Property[]>> => {
        const response = await axiosInstance.get('/properties');
        return response.data;
    },

    getProperty: async (id: string): Promise<ApiResponse<Property>> => {
        const response = await axiosInstance.get(`/properties/${id}`);
        return response.data;
    },

    // Spaces
    getSpaces: async (propertyId?: string): Promise<ApiResponse<Space[]>> => {
        const params = propertyId ? { propertyId } : {};
        const response = await axiosInstance.get('/spaces', { params });
        return response.data;
    },

    getSpace: async (id: string): Promise<ApiResponse<Space>> => {
        const response = await axiosInstance.get(`/spaces/${id}`);
        return response.data;
    },

    // Reservations
    getReservations: async (
        filters?: ReservationFilters,
        page: number = 1,
        limit: number = 10,
    ): Promise<PaginatedResponse<Reservation>> => {
        const params = {
            page,
            limit,
            ...filters,
        };
        const response = await axiosInstance.get('/reservations', { params });
        return response.data;
    },

    getReservation: async (id: string): Promise<ApiResponse<Reservation>> => {
        const response = await axiosInstance.get(`/reservations/${id}`);
        return response.data;
    },

    getReservationPayout: async (id: string): Promise<ApiResponse<PayoutBreakdown>> => {
        const response = await axiosInstance.get(`/reservations/${id}/payout`);
        return response.data;
    },

    // Export
    exportReservations: async (options: ExportOptions): Promise<Blob> => {
        const response = await axiosInstance.post('/reservations/export', options, {
            responseType: 'blob',
        });
        return response.data;
    },
};
