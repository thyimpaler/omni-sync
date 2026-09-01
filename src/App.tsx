import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ScrollToTop } from './components/ScrollToTop';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { AboutPage } from './pages/AboutPage';
import { BlogPage } from './pages/BlogPage';
import { CareersPage } from './pages/CareersPage';
import { ContactPage } from './pages/ContactPage';
import { LegalPage } from './pages/LegalPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { OnboardingPage } from './pages/OnboardingPage';

/* The demo workspace is a separate chunk — marketing visitors never download it. */
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));

const RouteFallback = () => (
    <div className="flex min-h-screen items-center justify-center bg-ground text-neutral-600">
        <span
            className="h-7 w-7 animate-spin rounded-full border-2 border-accent-600 border-t-transparent"
            role="status"
            aria-label="Loading"
        />
    </div>
);

function App() {
    return (
        <AuthProvider>
            <Router>
                <ScrollToTop />
                <Suspense fallback={<RouteFallback />}>
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<SignupPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/blog" element={<BlogPage />} />
                        <Route path="/careers" element={<CareersPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/privacy" element={<LegalPage doc="privacy" />} />
                        <Route path="/terms" element={<LegalPage doc="terms" />} />
                        <Route path="/cookies" element={<LegalPage doc="cookies" />} />
                        <Route path="/setup" element={<OnboardingPage />} />
                        <Route path="/example/*" element={<DashboardPage />} />
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </Suspense>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        style: {
                            background: '#ffffff',
                            border: '1px solid color-mix(in srgb, #1d1f20 16%, transparent)',
                            borderRadius: '2px',
                            color: '#1d1f20',
                            fontFamily: '"Barlow", system-ui, sans-serif',
                        },
                    }}
                />
            </Router>
        </AuthProvider>
    );
}

export default App;
