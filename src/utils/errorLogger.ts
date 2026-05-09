
export const logError = (error: any, context?: string) => {
    // In production, this could send to Sentry or another logging service
    const timestamp = new Date().toISOString();
    console.group(`❌ Error [${context || 'Unknown Context'}] at ${timestamp}`);
    console.error(error);
    if (error.response) {
        console.error('Response Data:', error.response.data);
        console.error('Status:', error.response.status);
    }
    console.groupEnd();
};

export const logInfo = (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
        console.info(`ℹ️ [Info]: ${message}`, data || '');
    }
};
