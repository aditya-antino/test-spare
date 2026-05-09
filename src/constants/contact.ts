import { KYCDoc } from '@/constants/enums';

export enum CONTACT {
    SUPPORT_EMAIL = 'support@sparespace.co.in',
    EMAIL = 'info@sparespace.co.in',
    PHONE = '+91 9876543210',
}



export enum ADDRESS {
    ADDRESS = '123, Main Street, Anytown, USA',
    CITY = 'Anytown',
    STATE = 'CA',
    ZIP = '12345',
    COUNTRY = 'USA',
}

export const ID_LABELS: Record<KYCDoc, string> = {
    [KYCDoc.AADHAR]: 'Aadhar Card',
    [KYCDoc.DL]: 'Driving License',
    [KYCDoc.PASSPORT]: 'Passport',
};
