import { useEffect, useState } from "react";

export function useIsMobile(): boolean {
    const query = '(max-width: 767px)';
    const [isMobile, setIsMobile] = useState<boolean>(
        () => typeof window !== 'undefined' && window.matchMedia(query).matches,
    );

    useEffect(() => {
        const mq = window.matchMedia(query);
        const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    return isMobile;
}
