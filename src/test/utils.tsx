import React from 'react';
import type { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { WorkspaceProvider } from '../state/WorkspaceProvider';

const Providers = ({ children }: { children: ReactNode }) => (
    <MemoryRouter>
        <WorkspaceProvider>{children}</WorkspaceProvider>
    </MemoryRouter>
);

/** Renders inside the router and workspace state the product screens expect. */
export const renderWithWorkspace = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
    render(ui, { wrapper: Providers, ...options });
