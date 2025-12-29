import React from 'react';
import Header from '../components/Layout/Header';
import Sidebar from '../components/Layout/Sidebar';
import Footer from '../components/Layout/Footer';
import type { NextPage } from 'next';
import useProfiles from '../hooks/useProfile';
import useAnonymousStats from '../hooks/useAnonymousStats';

const Reports: NextPage = () => {
  const { profiles, loading } = useProfiles();
  const { stats: anonymousStats, loading: anonymousLoading } = useAnonymousStats();

  // Calculate stats from profiles
  const totalProfiles = profiles?.length || 0;
  const profilesWithEmail = profiles?.filter((p: any) => p.email)?.length || 0;
  const profilesWithPhone = profiles?.filter((p: any) => p.phone)?.length || 0;

  // Get profiles by source
  const sourceStats = profiles?.reduce((acc: any, p: any) => {
    const source = p.source || 'unknown';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {}) || {};

  // Get recent activity (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentProfiles = profiles?.filter((p: any) =>
    new Date(p.created_at || p.createdAt) > sevenDaysAgo
  )?.length || 0;

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
          <div style={{ padding: '24px' }}>
            {/* Page Header */}
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 600, color: '#1a1a2e', marginBottom: '8px' }}>
                Reports
              </h1>
              <p style={{ color: '#6c757d', fontSize: '14px' }}>
                Analytics and insights for your tracked profiles
              </p>
            </div>

            {(loading || anonymousLoading) ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading reports...</p>
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '20px',
                  marginBottom: '32px'
                }}>
                  {/* Total Profiles */}
                  <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    borderLeft: '4px solid #4e73df'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <p style={{ color: '#4e73df', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                          Total Profiles
                        </p>
                        <p style={{ fontSize: '28px', fontWeight: 700, color: '#1a1a2e' }}>
                          {totalProfiles}
                        </p>
                      </div>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: '#e8f0fe',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21" stroke="#4e73df" strokeWidth="2" strokeLinecap="round"/>
                          <circle cx="9" cy="7" r="4" stroke="#4e73df" strokeWidth="2"/>
                          <path d="M23 21V19C23 17.1362 21.7252 15.5701 20 15.126" stroke="#4e73df" strokeWidth="2" strokeLinecap="round"/>
                          <path d="M16 3.12598C17.7252 3.56983 19 5.13616 19 6.99998C19 8.8638 17.7252 10.4301 16 10.874" stroke="#4e73df" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* New This Week */}
                  <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    borderLeft: '4px solid #1cc88a'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <p style={{ color: '#1cc88a', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                          New This Week
                        </p>
                        <p style={{ fontSize: '28px', fontWeight: 700, color: '#1a1a2e' }}>
                          {recentProfiles}
                        </p>
                      </div>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: '#e6f9f1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 8V12L15 15" stroke="#1cc88a" strokeWidth="2" strokeLinecap="round"/>
                          <circle cx="12" cy="12" r="9" stroke="#1cc88a" strokeWidth="2"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* With Email */}
                  <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    borderLeft: '4px solid #36b9cc'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <p style={{ color: '#36b9cc', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                          With Email
                        </p>
                        <p style={{ fontSize: '28px', fontWeight: 700, color: '#1a1a2e' }}>
                          {profilesWithEmail}
                        </p>
                        <p style={{ fontSize: '12px', color: '#858796', marginTop: '4px' }}>
                          {totalProfiles > 0 ? Math.round((profilesWithEmail / totalProfiles) * 100) : 0}% of total
                        </p>
                      </div>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: '#e3f6f8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="2" y="4" width="20" height="16" rx="2" stroke="#36b9cc" strokeWidth="2"/>
                          <path d="M22 6L12 13L2 6" stroke="#36b9cc" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* With Phone */}
                  <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    borderLeft: '4px solid #f6c23e'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <p style={{ color: '#f6c23e', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                          With Phone
                        </p>
                        <p style={{ fontSize: '28px', fontWeight: 700, color: '#1a1a2e' }}>
                          {profilesWithPhone}
                        </p>
                        <p style={{ fontSize: '12px', color: '#858796', marginTop: '4px' }}>
                          {totalProfiles > 0 ? Math.round((profilesWithPhone / totalProfiles) * 100) : 0}% of total
                        </p>
                      </div>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: '#fef6e6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22 16.92V19.92C22 20.48 21.56 20.93 21 20.97C20.84 20.99 20.67 21 20.5 21C10.29 21 2 12.71 2 2.5C2 2.33 2.01 2.16 2.03 2C2.07 1.44 2.52 1 3.08 1H6.08C6.54 1 6.93 1.34 7.01 1.79C7.14 2.6 7.37 3.38 7.68 4.11C7.83 4.45 7.74 4.85 7.47 5.11L5.79 6.79C7.06 9.62 9.38 11.94 12.21 13.21L13.89 11.53C14.15 11.26 14.55 11.17 14.89 11.32C15.62 11.63 16.4 11.86 17.21 11.99C17.66 12.07 18 12.46 18 12.92V15.92C18 16.48 17.56 16.93 17 16.97" stroke="#f6c23e" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Anonymous vs Identified Visitors */}
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  marginBottom: '24px'
                }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a2e', marginBottom: '20px' }}>
                    Visitor Funnel
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    {/* Anonymous Visitors */}
                    <div style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '12px',
                      padding: '24px',
                      color: 'white'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', opacity: 0.9 }}>
                            Anonymous Visitors
                          </p>
                          <p style={{ fontSize: '36px', fontWeight: 700 }}>
                            {anonymousStats?.totalAnonymous || 0}
                          </p>
                          <p style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
                            {anonymousStats?.recentAnonymous || 0} new this week
                          </p>
                        </div>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          background: 'rgba(255,255,255,0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="8" r="4" stroke="white" strokeWidth="2"/>
                            <path d="M6 21V19C6 16.7909 7.79086 15 10 15H14C16.2091 15 18 16.7909 18 19V21" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M12 4V2M8 5L6.5 3.5M16 5L17.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Identified Profiles */}
                    <div style={{
                      background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                      borderRadius: '12px',
                      padding: '24px',
                      color: 'white'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', opacity: 0.9 }}>
                            Identified Profiles
                          </p>
                          <p style={{ fontSize: '36px', fontWeight: 700 }}>
                            {totalProfiles}
                          </p>
                          <p style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
                            {recentProfiles} new this week
                          </p>
                        </div>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          background: 'rgba(255,255,255,0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                            <circle cx="9" cy="7" r="4" stroke="white" strokeWidth="2"/>
                            <path d="M23 21V19C23 17.1362 21.7252 15.5701 20 15.126" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M16 3.12598C17.7252 3.56983 19 5.13616 19 6.99998C19 8.8638 17.7252 10.4301 16 10.874" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Conversion Rate */}
                    <div style={{
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      borderRadius: '12px',
                      padding: '24px',
                      color: 'white'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', opacity: 0.9 }}>
                            Conversion Rate
                          </p>
                          <p style={{ fontSize: '36px', fontWeight: 700 }}>
                            {((anonymousStats?.totalAnonymous || 0) + totalProfiles) > 0
                              ? Math.round((totalProfiles / ((anonymousStats?.totalAnonymous || 0) + totalProfiles)) * 100)
                              : 0}%
                          </p>
                          <p style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
                            Visitors to profiles
                          </p>
                        </div>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          background: 'rgba(255,255,255,0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22 12H18L15 21L9 3L6 12H2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Source Breakdown */}
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  marginBottom: '24px'
                }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a2e', marginBottom: '20px' }}>
                    Profiles by Source
                  </h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                    {Object.entries(sourceStats).map(([source, count]) => (
                      <div key={source} style={{
                        background: '#f8f9fc',
                        borderRadius: '8px',
                        padding: '16px 24px',
                        minWidth: '140px'
                      }}>
                        <p style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a2e' }}>
                          {count as number}
                        </p>
                        <p style={{ fontSize: '13px', color: '#858796', textTransform: 'capitalize' }}>
                          {source}
                        </p>
                      </div>
                    ))}
                    {Object.keys(sourceStats).length === 0 && (
                      <p style={{ color: '#858796', fontSize: '14px' }}>No source data available</p>
                    )}
                  </div>
                </div>

                {/* Info Note */}
                <div style={{
                  background: '#e8f4fd',
                  border: '1px solid #bee5eb',
                  borderRadius: '8px',
                  padding: '16px',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, marginTop: '2px' }}>
                    <circle cx="12" cy="12" r="10" stroke="#17a2b8" strokeWidth="2"/>
                    <path d="M12 16V12M12 8H12.01" stroke="#17a2b8" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <div style={{ fontSize: '13px', color: '#0c5460' }}>
                    <strong>Tip:</strong> More detailed reports including event analytics, conversion tracking, and custom date ranges will be available in future updates.
                  </div>
                </div>
              </>
            )}
          </div>
          <Footer />
        </section>
      </div>
    </div>
  );
};

export default Reports;
