import axiosInstance from '@/lib/axiosInstance';

const downloadInvoice = async (bookingId: number | string, roleId: string) => {
    const response = await axiosInstance.get(`invoice/${bookingId}?roleId=${roleId}`, {
        responseType: 'blob',
    });
    return response.data;
};

const downloadInvoiceByType = async (
    bookingId: number | string,
    roleId: string,
    subType: 'guest_booking' | 'guest_platform' | 'host',
) => {
    const response = await axiosInstance.get(
        `invoice/${bookingId}?roleId=${roleId}&subType=${subType}`,
        {
            responseType: 'blob',
        },
    );
    return response.data;
};

export { downloadInvoice, downloadInvoiceByType, getInvoices };

const getInvoices = async (bookingId: number | string, roleId: string) => {
    const response = await axiosInstance.get(`invoice/${bookingId}?roleId=${roleId}`);
    return response.data;
};
