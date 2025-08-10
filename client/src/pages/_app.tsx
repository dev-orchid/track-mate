// src/pages/_app.tsx
import '../styles/globals.css';
import '../styles/sb-admin-2.css';
import '../styles/layout.css';
import type { AppProps } from 'next/app';
import { AuthProvider } from '../contexts/AuthContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
