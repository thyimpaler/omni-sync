import React from 'react';

/**
 * The mark from the design file: two inbound channels folding into one
 * outbound line, with the junction called out as a solid accent square.
 * Stroke follows currentColor so it works on light and inverted surfaces.
 */
export const LogoMark = ({ size = 28, framed = true, className = '' }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 28 28"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
        className={className}
    >
        {framed && <rect x="0.75" y="0.75" width="26.5" height="26.5" />}
        <path d="M3.5 9h5.5l5 5h10.5" />
        <path d="M3.5 19h5.5l5-5" />
        <rect x="12.4" y="12.4" width="3.2" height="3.2" fill="currentColor" stroke="none" />
    </svg>
);

/** Mark plus wordmark, the lockup used in the nav and footer. */
export const Logo = ({ size = 26, className = '' }) => (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
        <LogoMark size={size} className="text-accent-600" />
        <span className="font-heading text-[19px] font-semibold uppercase tracking-[0.18em] text-ink">
            Omnisync
        </span>
    </span>
);
