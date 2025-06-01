// src/pages/admin/dashboard.tsx
import Header from '../components/Layout/Header';
import Sidebar from '../components/Layout/Sidebar';
import Footer from '../components/Layout/Footer';
import EventData from '../components/Dashboard/EventData';
import useEventsfrom  from '../hooks/useEvents';
import type { NextPage } from 'next';

const Dashboard: NextPage = () => {
  const eventData = useEventsfrom();
  console.log('Events from hook:', eventData);
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Header />
        <main style={{ padding: '1rem' }}>
          <EventData trackingData={eventData}/>
          {/* Add further dashboard components here */}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Dashboard;
