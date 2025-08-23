// src/pages/admin/dashboard.tsx
import Header from '../../components/Layout/Header';
import Sidebar from '../../components/Layout/Sidebar';
import Footer from '../../components/Layout/Footer';
import ProfileDetails from '../../components/Dashboard/ProfileDetails';
import useProfileDetails from '../../hooks/useProfileDetails';
import type { NextPage } from 'next';

const Profile: NextPage = () => {
  const profiles = useProfileDetails();
  console.log('Profiles from hook:', profiles);
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
                  <ProfileDetails profileData={profiles} />
          <Footer />
        </section>
      </div>
    </div>
  );
};

export default Profile;
