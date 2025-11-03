import React, { useState } from 'react';
import Header from '../components/Layout/Header';
import Sidebar from '../components/Layout/Sidebar';
import Footer from '../components/Layout/Footer';
import type { NextPage } from 'next';
import useAccountDetails from '../hooks/useAccountDetails';
import useAccountUpdate from '../hooks/useAccountUpdate';

const AccountDetails: NextPage = () => {
  const { accountDetails, loading, error } = useAccountDetails();
  const { updateAccount, loading: updating, error: updateError, success } = useAccountUpdate();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company_name: '',
  });

  React.useEffect(() => {
    if (accountDetails) {
      setFormData({
        firstName: accountDetails.firstName || '',
        lastName: accountDetails.lastName || '',
        email: accountDetails.email || '',
        company_name: accountDetails.company_name || '',
      });
    }
  }, [accountDetails]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await updateAccount(formData);
    if (result) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    if (accountDetails) {
      setFormData({
        firstName: accountDetails.firstName || '',
        lastName: accountDetails.lastName || '',
        email: accountDetails.email || '',
        company_name: accountDetails.company_name || '',
      });
    }
    setIsEditing(false);
  };

  if (loading) {
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
              <p>Loading account details...</p>
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (error) {
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
            <div className="error-state">
              <p>Error loading account: {error}</p>
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
          <div className="profile-page">
            <div className="profile-container">
              {/* Profile Header */}
              <div className="profile-header-card">
                <div className="profile-avatar-section">
                  <div className="profile-avatar-large">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="8" r="4" fill="currentColor"/>
                      <path d="M6 21C6 17.134 8.686 14 12 14C15.314 14 18 17.134 18 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="profile-header-info">
                    <h1 className="profile-name">
                      {accountDetails?.firstName} {accountDetails?.lastName}
                    </h1>
                    <p className="profile-email">{accountDetails?.email}</p>
                    <div className="profile-badge">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 7L9 18L4 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Active Account
                    </div>
                  </div>
                </div>
                <div className="profile-actions">
                  {!isEditing && (
                    <button
                      className="btn-edit-profile"
                      onClick={() => setIsEditing(true)}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M18.5 2.50023C18.8978 2.1024 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.1024 21.5 2.50023C21.8978 2.89805 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.1024 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>

              {/* Success/Error Messages */}
              {success && (
                <div className="alert-success">
                  Profile updated successfully!
                </div>
              )}
              {updateError && (
                <div className="alert-error">
                  {updateError}
                </div>
              )}

              {/* Profile Details Card */}
              <div className="profile-details-card">
                <div className="card-header">
                  <h2 className="card-title">Account Information</h2>
                  <p className="card-subtitle">Manage your personal information and company details</p>
                </div>

                <form onSubmit={handleSubmit} className="profile-form">
                  <div className="form-row">
                    <div className="form-group-profile">
                      <label htmlFor="firstName">First Name</label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="input-profile"
                        required
                      />
                    </div>

                    <div className="form-group-profile">
                      <label htmlFor="lastName">Last Name</label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="input-profile"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group-profile">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="input-profile"
                      required
                    />
                  </div>

                  <div className="form-group-profile">
                    <label htmlFor="company_name">Company Name</label>
                    <input
                      type="text"
                      id="company_name"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="input-profile"
                      required
                    />
                  </div>

                  <div className="form-group-profile">
                    <label>Company ID</label>
                    <div className="input-readonly">
                      {accountDetails?.company_id}
                      <span className="readonly-badge">Read-only</span>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="form-actions">
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="btn-cancel"
                        disabled={updating}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn-save"
                        disabled={updating}
                      >
                        {updating ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
          <Footer />
        </section>
      </div>
    </div>
  );
};

export default AccountDetails;
