import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Layout/Header';
import Sidebar from '../components/Layout/Sidebar';
import Footer from '../components/Layout/Footer';
import type { NextPage } from 'next';
import { useCampaigns, deleteCampaign, sendCampaign } from '../hooks/useCampaigns';

const Campaigns: NextPage = () => {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const { campaigns, loading, error, refetch, stats } = useCampaigns(100, statusFilter);

  const handleDelete = async (campaignId: string, status: string) => {
    if (status !== 'draft') {
      alert('Only draft campaigns can be deleted');
      return;
    }
    if (confirm('Are you sure you want to delete this campaign?')) {
      try {
        await deleteCampaign(campaignId);
        refetch();
      } catch (err: any) {
        alert(err.response?.data?.message || 'An error occurred');
      }
    }
  };

  const handleSendNow = async (campaignId: string, status: string) => {
    if (status !== 'draft' && status !== 'scheduled') {
      alert('Only draft or scheduled campaigns can be sent');
      return;
    }
    if (confirm('Are you sure you want to send this campaign now?')) {
      try {
        await sendCampaign(campaignId, 'now');
        alert('Campaign sending started!');
        refetch();
      } catch (err: any) {
        alert(err.response?.data?.message || 'An error occurred');
      }
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'sent':
        return 'status-success';
      case 'sending':
        return 'status-info';
      case 'scheduled':
        return 'method-post';
      case 'draft':
        return 'status-client-error';
      case 'failed':
        return 'status-server-error';
      case 'paused':
        return 'status-client-error';
      default:
        return 'status-info';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
          <div className="webhook-logs-page">
            {/* Page Header */}
            <div className="page-header">
              <div>
                <h1 className="page-title">Campaigns</h1>
                <p className="page-subtitle">Create and manage email marketing campaigns</p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={refetch} className="btn-refresh">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 4V10H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M23 20V14H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M20.49 9C19.9828 7.56678 19.1209 6.28542 17.9845 5.27542C16.8482 4.26541 15.4745 3.55976 13.9917 3.22426C12.5089 2.88875 10.9652 2.93434 9.50481 3.35677C8.04437 3.77921 6.71475 4.56471 5.64 5.64L1 10M23 14L18.36 18.36C17.2853 19.4353 15.9556 20.2208 14.4952 20.6432C13.0348 21.0657 11.4911 21.1112 10.0083 20.7757C8.52547 20.4402 7.1518 19.7346 6.01547 18.7246C4.87913 17.7146 4.01717 16.4332 3.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Refresh
                </button>
                <button
                  onClick={() => router.push('/campaigns/new')}
                  className="btn-refresh"
                  style={{ background: '#4e73df', color: 'white' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Create Campaign
                </button>
              </div>
            </div>

            {/* Statistics Cards */}
            {stats && (
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon stat-icon-blue">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{stats.total}</div>
                    <div className="stat-label">Total Campaigns</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon stat-icon-green">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{stats.sent}</div>
                    <div className="stat-label">Sent</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon stat-icon-orange">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 2H15L21 8V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V4C3 3.46957 3.21071 2.96086 3.58579 2.58579C3.96086 2.21071 4.46957 2 5 2H9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{stats.drafts}</div>
                    <div className="stat-label">Drafts</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon stat-icon-blue">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{stats.scheduled}</div>
                    <div className="stat-label">Scheduled</div>
                  </div>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="filters-card">
              <div className="filters-row">
                <div className="filter-group">
                  <label>Filter by Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">All Statuses</option>
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="sending">Sending</option>
                    <option value="sent">Sent</option>
                    <option value="failed">Failed</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
                {statusFilter && (
                  <button
                    onClick={() => setStatusFilter('')}
                    className="btn-clear-filters"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            </div>

            {/* Campaigns Table */}
            <div className="logs-card">
              {loading && (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading campaigns...</p>
                </div>
              )}

              {error && (
                <div className="error-state">
                  <p>Error: {error}</p>
                </div>
              )}

              {!loading && !error && campaigns.length === 0 && (
                <div className="empty-state">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p>No campaigns found</p>
                  <span>Create your first campaign to get started</span>
                </div>
              )}

              {!loading && !error && campaigns.length > 0 && (
                <div className="logs-table-wrapper">
                  <table className="logs-table">
                    <thead>
                      <tr>
                        <th>Campaign Name</th>
                        <th>List</th>
                        <th>Subject</th>
                        <th>Status</th>
                        <th>Sent / Total</th>
                        <th>Opens</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns.map((campaign) => (
                        <tr key={campaign._id}>
                          <td>
                            <div>
                              <div style={{ fontWeight: 600, marginBottom: '4px' }}>{campaign.name}</div>
                              {campaign.description && (
                                <div style={{ fontSize: '13px', color: '#6c757d' }}>{campaign.description}</div>
                              )}
                            </div>
                          </td>
                          <td>
                            {campaign.list_id ? (
                              <div>
                                <code style={{
                                  background: '#f8f9fa',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  color: '#4e73df',
                                  display: 'block',
                                  marginBottom: '4px'
                                }}>
                                  {campaign.list_id.list_id}
                                </code>
                                <div style={{ fontSize: '13px' }}>{campaign.list_id.name}</div>
                              </div>
                            ) : (
                              <span style={{ color: '#6c757d' }}>-</span>
                            )}
                          </td>
                          <td style={{ maxWidth: '200px' }}>
                            <div style={{ fontSize: '13px' }}>{campaign.subject}</div>
                          </td>
                          <td>
                            <span className={`status-badge ${getStatusBadgeClass(campaign.status)}`}>
                              {campaign.status}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>
                              {campaign.sent_count || 0} / {campaign.list_id?.profile_count || 0}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>
                              {campaign.opened_count || 0}
                            </div>
                          </td>
                          <td style={{ fontSize: '13px' }}>{formatDate(campaign.created_at)}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              {campaign.status === 'draft' && (
                                <button
                                  onClick={() => router.push(`/campaigns/${campaign._id}/edit`)}
                                  className="tag-action-btn"
                                  title="Edit"
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.43741 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </button>
                              )}
                              {(campaign.status === 'draft' || campaign.status === 'scheduled') && (
                                <button
                                  onClick={() => handleSendNow(campaign._id, campaign.status)}
                                  className="tag-action-btn"
                                  title="Send Now"
                                  style={{ background: '#1cc88a', color: 'white' }}
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </button>
                              )}
                              {campaign.status === 'draft' && (
                                <button
                                  onClick={() => handleDelete(campaign._id, campaign.status)}
                                  className="tag-action-btn tag-action-delete"
                                  title="Delete"
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          <Footer />
        </section>
      </div>
    </div>
  );
};

export default Campaigns;
