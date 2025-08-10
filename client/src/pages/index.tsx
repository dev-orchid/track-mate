// src/pages/admin/dashboard.tsx
import Header from "../components/Layout/Header";
import Sidebar from "../components/Layout/Sidebar";
import Footer from "../components/Layout/Footer";
import EventData from "../components/Dashboard/EventData";
import useEventsfrom from "../hooks/useEvents";
import { GetServerSideProps, NextPage } from "next";

const Dashboard: NextPage = () => {
  const eventData = useEventsfrom();

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
          <EventData trackingData={eventData} />
          <Footer />
        </section>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { authToken } = ctx.req.cookies;
  if (!authToken) {
    return {
      redirect: { destination: "/login", permanent: false },
    };
  }
  return { props: {} };
};

export default Dashboard;
