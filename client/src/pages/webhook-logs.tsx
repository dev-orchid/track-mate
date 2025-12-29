import React, { useState } from 'react';
import Header from '../components/Layout/Header';
import Sidebar from '../components/Layout/Sidebar';
import Footer from '../components/Layout/Footer';
import type { NextPage } from 'next';
import useWebhookLogs, { WebhookLogFilters } from '../hooks/useWebhookLogs';

const WebhookLogs: NextPage = () => {
  const [filters, setFilters] = useState<WebhookLogFilters>({
    page: 1,
    limit: 20,
    status_code: null,
    startDate: null,
    endDate: null
  });

  const { logs, stats, pagination, loading, error, refetch } = useWebhookLogs(filters);
  const [selectedLog, setSelectedLog] = useState<string | null>(null);

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleFilterChange = (key: keyof WebhookLogFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const getStatusBadgeClass = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return 'status-success';
    if (statusCode >= 400 && statusCode < 500) return 'status-client-error';
    if (statusCode >= 500) return 'status-server-error';
    return 'status-info';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
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
                <h1 className="page-title">Webhook Logs</h1>
                <p className="page-subtitle">Monitor and debug webhook requests</p>
              </div>
              <button onClick={refetch} className="btn-refresh">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 4V10H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M23 20V14H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20.49 9C19.9828 7.56678 19.1209 6.28542 17.9845 5.27542C16.8482 4.26541 15.4745 3.55976 13.9917 3.22426C12.5089 2.88875 10.9652 2.93434 9.50481 3.35677C8.04437 3.77921 6.71475 4.56471 5.64 5.64L1 10M23 14L18.36 18.36C17.2853 19.4353 15.9556 20.2208 14.4952 20.6432C13.0348 21.0657 11.4911 21.1112 10.0083 20.7757C8.52547 20.4402 7.1518 19.7346 6.01547 18.7246C4.87913 17.7146 4.01717 16.4332 3.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Refresh
              </button>
            </div>

            {/* Statistics Cards */}
            {stats && (
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon stat-icon-blue">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{stats.total_requests}</div>
                    <div className="stat-label">Total Requests</div>
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
                    <div className="stat-value">{stats.successful_requests}</div>
                    <div className="stat-label">Successful</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon stat-icon-red">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{stats.failed_requests}</div>
                    <div className="stat-label">Failed</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon stat-icon-orange">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{Math.round(stats.avg_processing_time || 0)}ms</div>
                    <div className="stat-label">Avg Response Time</div>
                  </div>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="filters-card">
              <div className="filters-row">
                <div className="filter-group">
                  <label>Status Code</label>
                  <select
                    value={filters.status_code || ''}
                    onChange={(e) => handleFilterChange('status_code', e.target.value ? parseInt(e.target.value) : null)}
                    className="filter-select"
                  >
                    <option value="">All Statuses</option>
                    <option value="200">200 - Success</option>
                    <option value="201">201 - Created</option>
                    <option value="400">400 - Bad Request</option>
                    <option value="401">401 - Unauthorized</option>
                    <option value="429">429 - Rate Limited</option>
                    <option value="500">500 - Server Error</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Start Date</label>
                  <input
                    type="datetime-local"
                    value={filters.startDate || ''}
                    onChange={(e) => handleFilterChange('startDate', e.target.value || null)}
                    className="filter-input"
                  />
                </div>

                <div className="filter-group">
                  <label>End Date</label>
                  <input
                    type="datetime-local"
                    value={filters.endDate || ''}
                    onChange={(e) => handleFilterChange('endDate', e.target.value || null)}
                    className="filter-input"
                  />
                </div>

                <button
                  onClick={() => setFilters({ page: 1, limit: 20, status_code: null, startDate: null, endDate: null })}
                  className="btn-clear-filters"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Logs Table */}
            <div className="logs-card">
              {loading && (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading webhook logs...</p>
                </div>
              )}

              {error && (
                <div className="error-state">
                  <p>Error: {error}</p>
                </div>
              )}

              {!loading && !error && logs.length === 0 && (
                <div className="empty-state">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 2H15L21 8V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V4C3 3.46957 3.21071 2.96086 3.58579 2.58579C3.96086 2.21071 4.46957 2 5 2H9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p>No webhook logs found</p>
                  <span>Webhook requests will appear here</span>
                </div>
              )}

              {!loading && !error && logs.length > 0 && (
                <>
                  <div className="logs-table-wrapper">
                    <table className="logs-table">
                      <thead>
                        <tr>
                          <th>Timestamp</th>
                          <th>Method</th>
                          <th>Endpoint</th>
                          <th>Status</th>
                          <th>Response Time</th>
                          <th>IP Address</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logs.map((log) => (
                          <tr
                            key={log._id}
                            onClick={() => setSelectedLog(log._id === selectedLog ? null : log._id)}
                            className={selectedLog === log._id ? 'expanded' : ''}
                          >
                            <td>{formatDate(log.created_at)}</td>
                            <td>
                              <span className={`method-badge method-${log.method.toLowerCase()}`}>
                                {log.method}
                              </span>
                            </td>
                            <td className="endpoint-cell">{log.endpoint}</td>
                            <td>
                              <span className={`status-badge ${getStatusBadgeClass(log.status_code)}`}>
                                {log.status_code}
                              </span>
                            </td>
                            <td>{log.processing_time_ms ? `${log.processing_time_ms}ms` : '-'}</td>
                            <td className="ip-cell">{log.ip_address || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {pagination && pagination.totalPages > 1 && (
                    <div className="pagination">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="btn-pagination"
                      >
                        Previous
                      </button>
                      <span className="pagination-info">
                        Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                      </span>
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        className="btn-pagination"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          <Footer />
        </section>
      </div>
    </div>
  );
};

export default WebhookLogs;
