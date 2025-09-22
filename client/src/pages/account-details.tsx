// src/pages/admin/dashboard.tsx
import Header from '../components/Layout/Header';
import Sidebar from '../components/Layout/Sidebar';
import Footer from '../components/Layout/Footer';
import type { NextPage } from 'next';
import useProfileDetails from '../hooks/useAccountDetails';
const AccountSettings: NextPage = () => {
   const profiles = useProfileDetails();
    console.log('Profiles from hook:', profiles);
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Header />
        <main style={{ padding: '1rem' }}>
         
          <p>Personal Settings</p>
           <AccountSettings profileData={profiles} />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default AccountSettings;
