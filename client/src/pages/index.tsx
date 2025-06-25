// src/pages/admin/dashboard.tsx
import Header from '../components/Layout/Header';
import Sidebar from '../components/Layout/Sidebar';
import Footer from '../components/Layout/Footer';
import EventData from '../components/Dashboard/EventData';
import useEventsfrom from '../hooks/useEvents';
import { GetServerSideProps, NextPage } from 'next'

//import Cookies from 'js-cookie';
const Dashboard: NextPage = () => {


  const eventData = useEventsfrom();
  //console.log('Events from hook:', eventData);
  return (


    <div style={{ display: 'flex' }}>
    <Header />
      <Sidebar />
      <div style={{ flex: 1 }}>

        <EventData trackingData={eventData} />
        <Footer />
      </div>
    </div>



  );
};
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { authToken } = context.req.cookies;

  // Redirect to login if no authentication token is found
  if (!authToken) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: {}, // Pass authenticated user data if necessary
  };
};
export default Dashboard;
