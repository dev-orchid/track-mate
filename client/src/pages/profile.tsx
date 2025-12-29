// src/pages/profile.tsx
import Header from '../components/Layout/Header';
import Sidebar from '../components/Layout/Sidebar';
import Footer from '../components/Layout/Footer';
import ProfileData from '../components/Dashboard/ProfileData';
import useProfiles from '../hooks/useProfile';
import type { NextPage } from 'next';

const Profile: NextPage = () => {
  const { profiles, loading, error } = useProfiles();

  return (
    <div className="dashboard">
      <aside className="dashboard-sidebar">
        <Sidebar />
      </aside>
      <div className="dashboard-main">
        <header className="dashboard-header">
          <Header />
        </header>
        <section className="dashboard-content">
          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading profiles...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p>Error: {error}</p>
            </div>
          )}

          {!loading && !error && (
            <ProfileData profileData={profiles} />
          )}
          <Footer />
        </section>
      </div>
    </div>
  );
};

export default Profile;
