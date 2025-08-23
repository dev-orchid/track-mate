import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Header from "../components/Layout/Header";
import Sidebar from "../components/Layout/Sidebar";
import Footer from "../components/Layout/Footer";
import EventData from "../components/Dashboard/EventData";
import useEventsfrom from "../hooks/useEvents";
import { getValidToken } from "../utils/authHelper";

const Dashboard = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const eventData = useEventsfrom();

  useEffect(() => {
    if (!getValidToken()) {
      alert(getValidToken());
      router.replace("/login");
      return;
    }
    setLoading(false);
  }, []);

  if (loading) return <p>Loading...</p>;

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

export default Dashboard;
