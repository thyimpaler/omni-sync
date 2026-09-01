import React, { useId } from 'react';
import type { ComponentType, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface FieldCommon {
    label: string;
    error?: string | undefined;
    hint?: string | undefined;
    /** Lucide icons and anything else taking a className. Input only. */
    icon?: ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
    className?: string;
}

type FieldProps = FieldCommon &
    (
        | ({ as?: 'input' } & Omit<InputHTMLAttributes<HTMLInputElement>, 'className'>)
        | ({ as: 'textarea' } & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'>)
        | ({ as: 'select' } & Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'>)
    );

/**
 * A labelled form control. Every input on the site goes through here so that
 * labels, error text and validation state stay wired together for screen
 * readers instead of relying on placeholders.
 */
export const Field = ({ label, error, hint, icon: Icon, className = '', ...rest }: FieldProps) => {
    const id = useId();
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;
    const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined;

    const { as = 'input', ...controlProps } = rest as { as?: 'input' | 'textarea' | 'select' } & Record<
        string,
        unknown
    >;

    const controlClasses = `input ${Icon ? 'pl-10' : ''} ${error ? 'border-accent-800' : ''} ${
        as === 'textarea' ? 'resize-none' : ''
    } ${className}`;

    const shared = {
        id,
        'aria-invalid': error ? ('true' as const) : undefined,
        'aria-describedby': describedBy,
        className: controlClasses,
    };

    return (
        <div>
            <label htmlFor={id} className="label mb-2 block">
                {label}
                {'required' in controlProps && controlProps.required ? (
                    <span className="ml-1 text-accent-600" aria-hidden="true">
                        *
                    </span>
                ) : null}
            </label>
            <div className="relative">
                {Icon && (
                    <Icon
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500"
                        aria-hidden="true"
                    />
                )}
                {as === 'textarea' ? (
                    <textarea
                        {...(controlProps as TextareaHTMLAttributes<HTMLTextAreaElement>)}
                        {...shared}
                    />
                ) : as === 'select' ? (
                    <select {...(controlProps as SelectHTMLAttributes<HTMLSelectElement>)} {...shared} />
                ) : (
                    <input {...(controlProps as InputHTMLAttributes<HTMLInputElement>)} {...shared} />
                )}
            </div>
            {hint && !error && (
                <p id={hintId} className="mt-1.5 text-[12px] text-neutral-600">
                    {hint}
                </p>
            )}
            {error && (
                <p id={errorId} className="mt-1.5 text-[12px] font-medium text-accent-800">
                    {error}
                </p>
            )}
        </div>
    );
};
