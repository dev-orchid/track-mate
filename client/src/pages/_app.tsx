// src/pages/_app.tsx
import '../styles/globals.css';
import '../styles/sb-admin-2.css';
import '../styles/layout.css';
import '../styles/auth.css';
import '../styles/dashboard.css';
import '../styles/sidebar.css';
import '../styles/profile.css';
import '../styles/profiles.css';
import '../styles/profile-details.css';
import '../styles/klaviyo-profile.css';
import '../styles/webhook-logs.css';
import '../styles/marketing.css';
import type { AppProps} from 'next/app';
import { AuthProvider } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

// List of public pages that don't require authentication
const publicPages = ['/login', '/register'];

function MyApp({ Component, pageProps, router }: AppProps) {
  const isPublicPage = publicPages.includes(router.pathname);

  if (isPublicPage) {
    // Render public pages without ProtectedRoute
    return (
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    );
  }

  // All other pages are protected
  return (
    <ProtectedRoute>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </ProtectedRoute>
  );
}

export default MyApp;
