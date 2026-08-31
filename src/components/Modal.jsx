import React, { useCallback, useEffect, useId, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * A dialog that behaves like one: Escape closes it, focus moves inside and is
 * trapped while it is open, the page behind stops scrolling, and focus returns
 * to whatever opened it.
 */
export const Modal = ({ open, onClose, title, description, children, className = '' }) => {
    const panelRef = useRef(null);
    const openerRef = useRef(null);
    // Callers pass an inline arrow, so keep the latest handler in a ref: the
    // open/close effect below must not tear down and re-run on every render.
    const onCloseRef = useRef(onClose);
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);
    const titleId = useId();
    const descId = useId();

    // Tab handling stays on the panel; Escape is handled at the window level
    // below so it works even when focus has not landed inside yet.
    const handleKeyDown = useCallback((e) => {
        if (e.key !== 'Tab' || !panelRef.current) return;

        const items = Array.from(panelRef.current.querySelectorAll(FOCUSABLE)).filter(
            (el) => el.offsetParent !== null
        );
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }, []);

    useEffect(() => {
        if (!open) return;

        const onEscape = (e) => {
            if (e.key === 'Escape') onCloseRef.current();
        };
        window.addEventListener('keydown', onEscape);

        openerRef.current = document.activeElement;
        const { overflow } = document.body.style;
        document.body.style.overflow = 'hidden';

        const focusTimer = requestAnimationFrame(() => {
            const target = panelRef.current?.querySelector(FOCUSABLE);
            (target || panelRef.current)?.focus();
        });

        return () => {
            window.removeEventListener('keydown', onEscape);
            cancelAnimationFrame(focusTimer);
            document.body.style.overflow = overflow;
            if (openerRef.current instanceof HTMLElement) openerRef.current.focus();
        };
    }, [open]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    key="backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-ink/40 p-4"
                    onClick={onClose}
                    onKeyDown={handleKeyDown}
                >
                    <motion.div
                        ref={panelRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={title ? titleId : undefined}
                        aria-describedby={description ? descId : undefined}
                        tabIndex={-1}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className={`panel relative my-auto w-full max-w-lg p-8 shadow-lg focus:outline-none ${className}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close dialog"
                            className="absolute right-3 top-3 z-10 p-2 text-neutral-600 transition-colors hover:text-ink"
                        >
                            <X className="h-5 w-5" aria-hidden="true" />
                        </button>

                        {title && (
                            <h2 id={titleId} className="mb-2 pr-10 text-[26px]">
                                {title}
                            </h2>
                        )}
                        {description && (
                            <p id={descId} className="mb-6 text-neutral-700">
                                {description}
                            </p>
                        )}
                        {children}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
