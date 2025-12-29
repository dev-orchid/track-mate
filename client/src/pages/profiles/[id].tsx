// src/pages/profiles/[id].tsx
import Header from '../../components/Layout/Header';
import Sidebar from '../../components/Layout/Sidebar';
import Footer from '../../components/Layout/Footer';
import ProfileDetails from '../../components/Dashboard/ProfileDetails';
import type { NextPage } from 'next';

const Profile: NextPage = () => {
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
          <ProfileDetails />
          <Footer />
        </section>
      </div>
    </div>
  );
};

export default Profile;
