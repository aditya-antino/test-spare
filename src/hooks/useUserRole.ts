import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

export const useUserRole = () => {
    const { userRole } = useSelector((state: RootState) => state.auth);

    const isHost = Array.isArray(userRole) && userRole.some((role: string) => role.toLowerCase() === 'host');
    const isUser = Array.isArray(userRole) && userRole.some((role: string) => role.toLowerCase() === 'user');
    const isAdmin = Array.isArray(userRole) && userRole.some((role: string) => role.toLowerCase() === 'admin');

    return { 
        roles: userRole, 
        isHost, 
        isUser, 
        isAdmin 
    };
};
