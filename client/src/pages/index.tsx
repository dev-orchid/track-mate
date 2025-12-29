import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Header from "../components/Layout/Header";
import Sidebar from "../components/Layout/Sidebar";
import Footer from "../components/Layout/Footer";
import EventData from "../components/Dashboard/EventData";
import useProfiles from "../hooks/useProfile";
import { getValidToken } from "../utils/authHelper";

const Dashboard = () => {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);
  const { profiles, loading: profilesLoading } = useProfiles();

  useEffect(() => {
    if (!getValidToken()) {
      router.replace("/login");
      return;
    }
    setAuthLoading(false);
  }, []);

  if (authLoading || profilesLoading) {
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
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading dashboard...</p>
            </div>
          </section>
        </div>
      </div>
    );
  }

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
          <EventData trackingData={profiles} />
          <Footer />
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
