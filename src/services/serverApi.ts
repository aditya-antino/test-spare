import axios from 'axios';
import { decryptResponse } from '@/utils/encryption';

const ENABLE_ENCRYPTION = process.env.NEXT_PUBLIC_ENABLE_ENCRYPTION === 'true';

const serverApi = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL + '/api/v1',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
    },
});

export const ServerGet = async <T = unknown>(url: string, config = {}): Promise<T> => {
    try {
        const response = await serverApi.get<T>(url, config);

        let data = response.data;
        if (ENABLE_ENCRYPTION && data) {
            data = decryptResponse(data);
        }

        return data as T;
    } catch (error) {
        console.error(`[ServerGet] Error fetching ${url}:`, error);
        throw error;
    }
};
