import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DocumentPage } from './pages/DocumentPage';


const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } }
});

function App() {
    return (
        <QueryClientProvider client={queryClient}>
        <AuthProvider>
            <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                                <Route path="/about" element={<DocumentPage title="About Us" />} />
                <Route path="/blog" element={<DocumentPage title="OmniSync Blog" />} />
                <Route path="/careers" element={<DocumentPage title="Careers" />} />
                <Route path="/contact" element={<DocumentPage title="Contact Support" />} />
                <Route path="/privacy" element={<DocumentPage title="Privacy Policy" />} />
                <Route path="/terms" element={<DocumentPage title="Terms of Service" />} />
                <Route path="/cookies" element={<DocumentPage title="Cookie Policy" />} />
                <Route path="/example/*" element={<DashboardPage />} />
            </Routes>
            <Toaster position="top-right" toastOptions={{ className: 'glass-card text-white', style: { background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff' } }} />
        </Router>
        </AuthProvider>
    </QueryClientProvider>
    );
}
export default App;
