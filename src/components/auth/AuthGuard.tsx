import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { PATHS } from '@/constants/path';
import { useAuth, useUserRole } from '@/hooks';

// Define route permissions
const ROUTE_PERMISSIONS: { [key: string]: string[] } = {
    '/host': ['host'],
    '/admin': ['admin'],
};

// Routes that require authentication
const PROTECTED_PREFIXES = ['/host', '/admin', '/profile'];

// Routes restricted for authenticated users (e.g., login, signup)
const AUTH_RESTRICTED_Routes = ['/login', '/sign-up', '/forgot-password'];

const AuthGuard = () => {
    const pathname = usePathname();
    const router = useRouter();
    const { isAuth, user } = useAuth();
    const { isHost } = useUserRole();   

    useEffect(() => {
        // 1. Check if route requires auth
        const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

        if (isProtectedRoute) {
            if (!isAuth) {
                // Not authenticated -> Redirect to login
                // Using replace to prevent going back to protected route
                router.replace(PATHS.LOGIN);
                return;
            }

            // 2. Check Role Permissions
            if (pathname.startsWith('/host')) {
                if (!isHost) {
                    // Redirect to guest dashboard if they try to access host area without permission
                    router.replace(PATHS.HOME_PAGE || '/');
                    return;
                }
            }
        }

        // 3. Check if route is restricted for authenticated users
        const isAuthRestricted = AUTH_RESTRICTED_Routes.some((route) => pathname.startsWith(route));
        if (isAuth && isAuthRestricted) {
            // Allow users on signup or login page if they haven't completed their profile onboarding
            const isOnboardingRoute = pathname.startsWith('/sign-up') || pathname.startsWith('/login');
            if (isOnboardingRoute) {
                const isOnboarding =
                    user?.isProfileCompleted === false ||
                    user?.firstName === null ||
                    user?.avatar === null ||
                    user?.isEmailVerified === false ||
                    user?.isPhoneVerified === false ||
                    !user?.email; // Phone users who haven't added email yet
                if (isOnboarding) return;
            }
            router.replace(PATHS.HOME_PAGE || '/space-list');
        }
    }, [pathname, isAuth, isHost, router, user]);

    return null;
};

export default AuthGuard;
