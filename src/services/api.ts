// src/lib/apiClient.ts
import axiosInstance from '@/lib/axiosInstance';

// GET request
export const Get = async <T = unknown>(url: string, config = {}): Promise<T> => {
    const response = await axiosInstance.get<T>(url, config);
    return response.data;
};

// POST request
export const Post = async <T = unknown, D = unknown>(
    url: string,
    data?: D,
    config = {},
): Promise<T> => {
    const response = await axiosInstance.post<T>(url, data, config);
    return response.data;
};

// PUT request
export const Put = async <T = unknown, D = unknown>(
    url: string,
    data: D,
    config = {},
): Promise<T> => {
    const response = await axiosInstance.put<T>(url, data, config);
    return response.data;
};

// PATCH request
export const Patch = async <T = unknown, D = unknown>(
    url: string,
    data: D,
    config = {},
): Promise<T> => {
    const response = await axiosInstance.patch<T>(url, data, config);
    return response.data;
};

// DELETE request
export const Delete = async <T = unknown>(url: string, data?: any, config = {}): Promise<T> => {
    const response = await axiosInstance.delete<T>(url, {
        ...config,
        data, // this is required for DELETE with body
    });
    return response.data;
};
