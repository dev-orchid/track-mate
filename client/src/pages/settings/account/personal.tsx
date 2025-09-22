
import type { NextPage } from "next";
import Header from "../../../components/Layout/Header";
import Sidebar from "../../../components/Layout/Sidebar";
import Footer from "../../../components/Layout/Footer";
import AccountDetails from "../../../components/Dashboard/AccountDetails";
import useAccountDetails from "../../../hooks/useAccountDetails";

const Personal: NextPage = () => {
  const { accountDetails, loading, error } = useAccountDetails();

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Header />
        <main style={{ padding: "1rem" }}>
          {loading && <p>Loading account details…</p>}
          {error && <p className="error">Error: {error}</p>}
          {!loading && !error && <AccountDetails account={accountDetails} />}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Personal;