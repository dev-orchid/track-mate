import React from 'react';
import Dashboard from '../components/dashboard';
import useProfiles from '../hooks/useProfile';

const Home = () => {

const profiles = useProfiles();
 console.log(profiles)
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <Dashboard trackingData={profiles} />
    </div>
  );
};

export default Home;
