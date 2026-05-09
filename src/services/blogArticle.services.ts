import { Get } from './api';
import { endpoints } from './endPoints';
import { ApiResponse } from '@/types/common.types';

export const getBlogs = async () => {
    try {
        const response = await Get<ApiResponse<any>>(endpoints.GET_BLOGS);
        return response;
    } catch (error) {
        throw error;
    }
};

export const getBlogDetails = async (slug: string) => {
    try {
        const response = await Get<ApiResponse<any>>(endpoints.GET_BLOG_DETAILS(slug));
        return response;
    } catch (error) {
        throw error;
    }
};

export const getArticles = async (articleType: string): Promise<any> => {
    try {
        const response = await Get<any>(endpoints.GET_ARTICLES(articleType));
        return response;
    } catch (error) {
        throw error;
    }
};

export const getArticleDetails = async (slug: string): Promise<any> => {
    try {
        const response = await Get<any>(endpoints.GET_ARTICLE_DETAILS(slug));
        return response;
    } catch (error) {
        throw error;
    }
}