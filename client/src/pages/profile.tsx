// src/pages/admin/dashboard.tsx
import Header from '../components/Layout/Header';
import Sidebar from '../components/Layout/Sidebar';
import Footer from '../components/Layout/Footer';
import ProfileData from '../components/Dashboard/ProfileData';
import useProfiles from '../hooks/useProfile';
import type { NextPage } from 'next';

const Profile: NextPage = () => {
  const profiles = useProfiles();
  //console.log('Profiles from hook:', profiles);
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Header />
        <main style={{ padding: '1rem' }}>
        </main>
        <ProfileData profileData={profiles}/>
        <Footer />
      </div>
    </div>
  );
};

export default Profile;
