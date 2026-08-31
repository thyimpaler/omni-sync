import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Router-level scroll behaviour: a new page starts at the top, and a link with
 * a hash (e.g. /#pricing from a legal page) lands on that section instead.
 */
export const ScrollToTop = () => {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        if (hash) {
            // Wait for the target route to paint before looking for the anchor.
            const id = hash.slice(1);
            const raf = requestAnimationFrame(() => {
                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
            return () => cancelAnimationFrame(raf);
        }
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }, [pathname, hash]);

    return null;
};
