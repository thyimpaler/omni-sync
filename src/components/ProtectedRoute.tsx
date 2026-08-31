import React from 'react';
import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
    // Placeholder for real auth logic
    const isAuthenticated = true;

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};
