import React, { useState } from 'react';
import Header from '../../../components/Layout/Header';
import Sidebar from '../../../components/Layout/Sidebar';
import Footer from '../../../components/Layout/Footer';
import type { NextPage } from 'next';
import useAccountDetails from '../../../hooks/useAccountDetails';
import useAccountUpdate from '../../../hooks/useAccountUpdate';
import axiosInstance from '../../../utils/axiosInstance';

const Personal: NextPage = () => {
  const { accountDetails, loading, error } = useAccountDetails();
  const { updateAccount, loading: updating, error: updateError, success } = useAccountUpdate();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company_name: '',
  });

  // API Key state
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [regenerateError, setRegenerateError] = useState<string | null>(null);

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

  // API Key handlers
  const copyToClipboard = async () => {
    if (accountDetails?.api_key) {
      try {
        await navigator.clipboard.writeText(accountDetails.api_key);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handleRegenerateApiKey = async () => {
    setRegenerating(true);
    setRegenerateError(null);
    try {
      const response = await axiosInstance.post('/auth/regenerate-api-key');
      if (response.data.success) {
        // Refresh account details to get new API key
        window.location.reload();
      }
    } catch (err: any) {
      setRegenerateError(err.response?.data?.message || 'Failed to regenerate API key');
    } finally {
      setRegenerating(false);
      setShowRegenerateModal(false);
    }
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
                  <h2 className="card-title">Personal Settings</h2>
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

              {/* API Key Card */}
              <div className="profile-details-card">
                <div className="card-header">
                  <h2 className="card-title">API Key for Webhooks</h2>
                  <p className="card-subtitle">Use this API key to authenticate webhook requests from your server</p>
                </div>

                <div className="api-key-section">
                  <div className="api-key-info">
                    <p className="api-key-description">
                      Your API key allows your server to send events to TrackMate via webhooks.
                      Include it in the <code>X-TrackMate-API-Key</code> header when making requests to
                      <code>/api/webhooks/events</code>.
                    </p>
                  </div>

                  <div className="api-key-display">
                    <label>API Key</label>
                    <div className="api-key-input-group">
                      <input
                        type={showApiKey ? "text" : "password"}
                        value={accountDetails?.api_key || 'No API key generated'}
                        readOnly
                        className="input-profile api-key-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="btn-toggle-visibility"
                        title={showApiKey ? "Hide API key" : "Show API key"}
                      >
                        {showApiKey ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13.73 4.00001C13.49 3.96001 13.25 3.93001 13 3.93001C8.31 3.93001 4.41 7.09001 2.23 11.99C3.66 15.29 5.95 17.99 8.89 19.59" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12 16C13.0609 16 14.0783 15.5786 14.8284 14.8284C15.5786 14.0783 16 13.0609 16 12C16 10.9391 15.5786 9.92172 14.8284 9.17157C14.0783 8.42143 13.0609 8 12 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M20 20L4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M9.88 9.88L14.12 14.12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={copyToClipboard}
                        className="btn-copy"
                        title="Copy to clipboard"
                      >
                        {copied ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 6L9 17L4 12" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M5 15H4C3.46957 15 2.96086 14.7893 2.58579 14.4142C2.21071 14.0391 2 13.5304 2 13V4C2 3.46957 2.21071 2.96086 2.58579 2.58579C2.96086 2.21071 3.46957 2 4 2H13C13.5304 2 14.0391 2.21071 14.4142 2.58579C14.7893 2.96086 15 3.46957 15 4V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </button>
                    </div>
                    {accountDetails?.api_key_created_at && (
                      <p className="api-key-created">
                        Created on {new Date(accountDetails.api_key_created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    )}
                  </div>

                  <div className="api-key-actions">
                    <button
                      type="button"
                      onClick={() => setShowRegenerateModal(true)}
                      className="btn-regenerate"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 4V10H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M23 20V14H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M20.49 9C19.9828 7.56678 19.1209 6.28542 17.9845 5.27542C16.8482 4.26541 15.4745 3.55976 13.9917 3.22426C12.5089 2.88875 10.9652 2.93434 9.50481 3.35677C8.04437 3.77921 6.71475 4.56471 5.64 5.64L1 10M23 14L18.36 18.36C17.2853 19.4353 15.9556 20.2208 14.4952 20.6432C13.0348 21.0657 11.4911 21.1112 10.0083 20.7757C8.52547 20.4402 7.1518 19.7346 6.01547 18.7246C4.87913 17.7146 4.01717 16.4332 3.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Regenerate API Key
                    </button>
                    <p className="api-key-warning">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.29 3.86001L1.82002 18C1.64539 18.3024 1.55299 18.6453 1.55201 18.9945C1.55103 19.3437 1.64151 19.6871 1.81445 19.9905C1.98738 20.2939 2.23675 20.5467 2.53773 20.7239C2.83871 20.9011 3.18082 20.9962 3.53002 21H20.47C20.8192 20.9962 21.1613 20.9011 21.4623 20.7239C21.7633 20.5467 22.0126 20.2939 22.1856 19.9905C22.3585 19.6871 22.449 19.3437 22.448 18.9945C22.447 18.6453 22.3546 18.3024 22.18 18L13.71 3.86001C13.5318 3.56611 13.2807 3.32313 12.9812 3.15449C12.6817 2.98585 12.3438 2.89726 12 2.89726C11.6562 2.89726 11.3184 2.98585 11.0188 3.15449C10.7193 3.32313 10.4683 3.56611 10.29 3.86001V3.86001Z" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 9V13" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="17" r="1" fill="#f59e0b"/>
                      </svg>
                      Warning: Regenerating will invalidate your current API key. Update your server code before regenerating.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </section>
      </div>

      {/* Regenerate API Key Modal */}
      {showRegenerateModal && (
        <div className="modal-overlay" onClick={() => setShowRegenerateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Regenerate API Key?</h3>
              <button
                className="modal-close"
                onClick={() => setShowRegenerateModal(false)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-warning-box">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.29 3.86001L1.82002 18C1.64539 18.3024 1.55299 18.6453 1.55201 18.9945C1.55103 19.3437 1.64151 19.6871 1.81445 19.9905C1.98738 20.2939 2.23675 20.5467 2.53773 20.7239C2.83871 20.9011 3.18082 20.9962 3.53002 21H20.47C20.8192 20.9962 21.1613 20.9011 21.4623 20.7239C21.7633 20.5467 22.0126 20.2939 22.1856 19.9905C22.3585 19.6871 22.449 19.3437 22.448 18.9945C22.447 18.6453 22.3546 18.3024 22.18 18L13.71 3.86001C13.5318 3.56611 13.2807 3.32313 12.9812 3.15449C12.6817 2.98585 12.3438 2.89726 12 2.89726C11.6562 2.89726 11.3184 2.98585 11.0188 3.15449C10.7193 3.32313 10.4683 3.56611 10.29 3.86001V3.86001Z" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 9V13" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="17" r="1" fill="#f59e0b"/>
                </svg>
              </div>
              <p className="modal-text">
                This action will invalidate your current API key immediately. Any webhooks using the old key will fail.
              </p>
              <p className="modal-text-bold">
                Are you sure you want to continue?
              </p>
              {regenerateError && (
                <div className="alert-error modal-error">
                  {regenerateError}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setShowRegenerateModal(false)}
                className="btn-modal-cancel"
                disabled={regenerating}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRegenerateApiKey}
                className="btn-modal-confirm"
                disabled={regenerating}
              >
                {regenerating ? 'Regenerating...' : 'Yes, Regenerate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Personal;