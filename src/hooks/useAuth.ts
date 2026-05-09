import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

export const useAuth = () => {
    const { isAuth, user, accessToken } = useSelector((state: RootState) => state.auth);
    return { isAuth, user, accessToken };
};
