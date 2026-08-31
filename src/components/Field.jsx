import React, { useId } from 'react';

/**
 * A labelled form control. Every input on the site goes through here so that
 * labels, error text and validation state stay wired together for screen
 * readers instead of relying on placeholders.
 */
export const Field = ({
    label,
    type = 'text',
    as = 'input',
    error,
    hint,
    icon: Icon,
    className = '',
    ...props
}) => {
    const id = useId();
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;
    const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined;

    const Control = as;
    const controlClasses = `input ${Icon ? 'pl-10' : ''} ${
        error ? 'border-accent-800' : ''
    } ${as === 'textarea' ? 'resize-none' : ''} ${className}`;

    return (
        <div>
            <label htmlFor={id} className="label mb-2 block">
                {label}
                {props.required && <span className="ml-1 text-accent-600" aria-hidden="true">*</span>}
            </label>
            <div className="relative">
                {Icon && (
                    <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" aria-hidden="true" />
                )}
                <Control
                    id={id}
                    type={as === 'input' ? type : undefined}
                    aria-invalid={error ? 'true' : undefined}
                    aria-describedby={describedBy}
                    className={controlClasses}
                    {...props}
                />
            </div>
            {hint && !error && (
                <p id={hintId} className="mt-1.5 text-[12px] text-neutral-600">{hint}</p>
            )}
            {error && (
                <p id={errorId} className="mt-1.5 text-[12px] font-medium text-accent-800">{error}</p>
            )}
        </div>
    );
};
