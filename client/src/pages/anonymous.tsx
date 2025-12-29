import React, { useState } from 'react';
import Header from '../components/Layout/Header';
import Sidebar from '../components/Layout/Sidebar';
import Footer from '../components/Layout/Footer';
import type { NextPage } from 'next';
import useAnonymousSessions from '../hooks/useAnonymousSessions';
import useAnonymousStats from '../hooks/useAnonymousStats';

const Anonymous: NextPage = () => {
  const { sessions, loading, error } = useAnonymousSessions();
  const { stats } = useAnonymousStats();
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'page_view':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="#6c757d" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="12" r="3" stroke="#6c757d" strokeWidth="2"/>
          </svg>
        );
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="#6c757d" strokeWidth="2"/>
            <path d="M12 6V12L16 14" stroke="#6c757d" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
    }
  };

  const extractPageTitle = (event: any) => {
    if (event.eventData?.title) return event.eventData.title;
    if (event.eventData?.address) {
      try {
        const url = new URL(event.eventData.address);
        return url.pathname || '/';
      } catch {
        return event.eventData.address;
      }
    }
    return event.eventType;
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
          <div style={{ padding: '24px' }}>
            {/* Page Header */}
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 600, color: '#1a1a2e', marginBottom: '8px' }}>
                Anonymous Visitors
              </h1>
              <p style={{ color: '#6c757d', fontSize: '14px' }}>
                Visitors who browsed your site but haven't filled out a form yet
              </p>
            </div>

            {/* Stats Summary */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                padding: '20px',
                color: 'white'
              }}>
                <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', opacity: 0.9 }}>
                  Total Anonymous
                </p>
                <p style={{ fontSize: '32px', fontWeight: 700, marginTop: '8px' }}>
                  {stats?.totalAnonymous || 0}
                </p>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                borderRadius: '12px',
                padding: '20px',
                color: 'white'
              }}>
                <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', opacity: 0.9 }}>
                  New This Week
                </p>
                <p style={{ fontSize: '32px', fontWeight: 700, marginTop: '8px' }}>
                  {stats?.recentAnonymous || 0}
                </p>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                borderRadius: '12px',
                padding: '20px',
                color: 'white'
              }}>
                <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', opacity: 0.9 }}>
                  Page Views
                </p>
                <p style={{ fontSize: '32px', fontWeight: 700, marginTop: '8px' }}>
                  {stats?.anonymousPageViews || 0}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading anonymous visitors...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <p>Error: {error}</p>
              </div>
            ) : sessions.length === 0 ? (
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '48px',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: '0 auto 16px', opacity: 0.3 }}>
                  <circle cx="12" cy="8" r="4" stroke="#1a1a2e" strokeWidth="2"/>
                  <path d="M6 21V19C6 16.7909 7.79086 15 10 15H14C16.2091 15 18 16.7909 18 19V21" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M12 4V2M8 5L6.5 3.5M16 5L17.5 3.5" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a2e', marginBottom: '8px' }}>
                  No Anonymous Visitors Yet
                </h3>
                <p style={{ color: '#6c757d', fontSize: '14px' }}>
                  When visitors browse your site without filling a form, they'll appear here.
                </p>
              </div>
            ) : (
              <div style={{
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                overflow: 'hidden'
              }}>
                <div style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #e9ecef',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a2e' }}>
                    Session Activity ({sessions.length})
                  </h2>
                  <span style={{ fontSize: '12px', color: '#6c757d' }}>
                    Click to expand events
                  </span>
                </div>

                {sessions.map((session) => (
                  <div key={session._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    {/* Session Header */}
                    <div
                      onClick={() => setExpandedSession(expandedSession === session._id ? null : session._id)}
                      style={{
                        padding: '16px 20px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: expandedSession === session._id ? '#f8f9fc' : 'white',
                        transition: 'background 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: '#e8f0fe',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="8" r="4" stroke="#4e73df" strokeWidth="2"/>
                            <path d="M6 21V19C6 16.7909 7.79086 15 10 15H14C16.2091 15 18 16.7909 18 19V21" stroke="#4e73df" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </div>
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: 500, color: '#1a1a2e' }}>
                            Anonymous Visitor
                          </p>
                          <p style={{ fontSize: '12px', color: '#6c757d' }}>
                            Session: {session.sessionId.substring(0, 20)}...
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '13px', color: '#1a1a2e' }}>
                            {session.events.length} event{session.events.length !== 1 ? 's' : ''}
                          </p>
                          <p style={{ fontSize: '11px', color: '#6c757d' }}>
                            {formatDate(session.createdAt)}
                          </p>
                        </div>
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          style={{
                            transform: expandedSession === session._id ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s'
                          }}
                        >
                          <path d="M6 9L12 15L18 9" stroke="#6c757d" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </div>
                    </div>

                    {/* Events List (Expandable) */}
                    {expandedSession === session._id && (
                      <div style={{
                        padding: '0 20px 16px 72px',
                        background: '#f8f9fc'
                      }}>
                        <div style={{
                          borderLeft: '2px solid #e9ecef',
                          paddingLeft: '16px'
                        }}>
                          {session.events.map((event, idx) => (
                            <div
                              key={event._id}
                              style={{
                                padding: '12px 0',
                                borderBottom: idx < session.events.length - 1 ? '1px solid #e9ecef' : 'none',
                                display: 'flex',
                                gap: '12px',
                                alignItems: 'flex-start'
                              }}
                            >
                              <div style={{ marginTop: '2px' }}>
                                {getEventIcon(event.eventType)}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <div>
                                    <p style={{ fontSize: '13px', fontWeight: 500, color: '#1a1a2e' }}>
                                      {event.eventType === 'page_view' ? 'Page View' : event.eventType}
                                    </p>
                                    <p style={{ fontSize: '12px', color: '#4e73df', marginTop: '2px' }}>
                                      {extractPageTitle(event)}
                                    </p>
                                  </div>
                                  <span style={{ fontSize: '11px', color: '#858796' }}>
                                    {formatDate(event.timestamp)}
                                  </span>
                                </div>
                                {event.eventData?.address && (
                                  <p style={{
                                    fontSize: '11px',
                                    color: '#6c757d',
                                    marginTop: '4px',
                                    wordBreak: 'break-all'
                                  }}>
                                    {event.eventData.address}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Info Note */}
            <div style={{
              background: '#fff3cd',
              border: '1px solid #ffc107',
              borderRadius: '8px',
              padding: '16px',
              marginTop: '24px',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, marginTop: '2px' }}>
                <path d="M12 9V13M12 17H12.01M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="#856404" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <div style={{ fontSize: '13px', color: '#856404' }}>
                <strong>How it works:</strong> When these visitors fill out a form on your site, their entire browsing history will be linked to their profile automatically. They'll move from this list to your Profiles page.
              </div>
            </div>
          </div>
          <Footer />
        </section>
      </div>
    </div>
  );
};

export default Anonymous;
