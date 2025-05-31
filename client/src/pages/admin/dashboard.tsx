// src/pages/admin/dashboard.tsx
import Header from '../../components/Layout/Header';
import Sidebar from '../../components/Layout/Sidebar';
import Footer from '../../components/Layout/Footer';
import type { NextPage } from 'next';

const Dashboard: NextPage = () => {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Header />
        <main style={{ padding: '1rem' }}>
          <h1>Dashboard</h1>
          <p>Welcome to the admin dashboard!</p>
          {/* Add further dashboard components here */}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Dashboard;
