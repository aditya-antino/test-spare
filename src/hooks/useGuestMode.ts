import { usePathname } from 'next/navigation';

/**
 * Hook to determine the current user mode based on the URL pathname.
 * After removing the 'guest' prefix from URLs, we determine guest mode
 * by checking if the path is NOT a host or admin route.
 */
export const useGuestMode = () => {
    const pathname = usePathname();

    const isHostMode = pathname?.startsWith('/host');
    const isAdminMode = pathname?.startsWith('/admin');
    
    // Guest mode is the default for all other routes (landing, space listing, details, guest account, etc.)
    const isGuestMode = !isHostMode && !isAdminMode;

    return {
        isGuestMode,
        isHostMode,
        isAdminMode,
        pathname,
    };
};
