// src/components/Dashboard/ProfileDetails.tsx

import React, { useState } from "react";
import { useRouter } from "next/router";
import useProfileDetails from "../../hooks/useProfileDetails";

export default function ProfileDetails() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const { profile, loading, error } = useProfileDetails(id);
  const [activeTab, setActiveTab] = useState("details");

  if (!id || loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading profile…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-5">
        <div className="alert alert-danger" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          Error loading profile: {error}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-5">
        <div className="alert alert-warning" role="alert">
          <i className="fas fa-info-circle me-2"></i>
          Profile not found
        </div>
      </div>
    );
  }

  // Prepare timeline events from all sessions
  const allEvents = profile.events.flatMap(session =>
    session.events.map(event => ({
      ...event,
      sessionId: session.sessionId
    }))
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Prepare unique products from all events
  const allProducts: any[] = [];
  profile.events.forEach(session => {
    session.events.forEach(event => {
      if (event.eventData?.productInfos) {
        event.eventData.productInfos.forEach(product => {
          if (!allProducts.some(p => p.productId === product.productId)) {
            allProducts.push(product);
          }
        });
      }
    });
  });

  // Calculate event type counts
  const eventTypeCounts: Record<string, number> = {};
  profile.events.forEach(session => {
    session.events.forEach(event => {
      eventTypeCounts[event.eventType] =
        (eventTypeCounts[event.eventType] || 0) + 1;
    });
  });

  // Calculate total revenue
  const totalRevenue = allEvents.reduce((sum, event) => {
    const productRevenue = event.eventData?.productInfos?.reduce((prodSum, prod) =>
      prodSum + (prod.price || 0), 0) || 0;
    return sum + productRevenue;
  }, 0);

  return (
    <div className="klaviyo-profile-page">
      <div className="container-fluid">
        {/* Back Button */}
        <button className="back-button" onClick={() => router.back()}>
          <i className="fas fa-arrow-left"></i>
          Back to All Profiles
        </button>

        {/* Profile Header - Persistent across all tabs */}
        <div className="profile-header-card">
          <div className="profile-header-content">
            <div className="profile-avatar">
              <i className="fas fa-user"></i>
            </div>
            <div className="profile-header-info">
              <h2 className="profile-name">{profile.name}</h2>
              <div className="profile-contact-badges">
                <span className="contact-badge">
                  <i className="fas fa-envelope"></i>
                  {profile.email}
                </span>
                {profile.phone && (
                  <span className="contact-badge">
                    <i className="fas fa-phone"></i>
                    {profile.phone}
                  </span>
                )}
              </div>
            </div>
            <div className="profile-header-meta">
              <div className="meta-item">
                <span className="meta-label">Last Active</span>
                <span className="meta-value">{new Date(profile.lastActive).toLocaleString()}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Total Events</span>
                <span className="meta-value">{allEvents.length}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Total Revenue</span>
                <span className="meta-value">₹{totalRevenue.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Layout: Tabs + Sidebar */}
        <div className="row">
          {/* Left Column - Tabs Content */}
          <div className="col-lg-9">
            <div className="profile-tabs-card">
              {/* Tab Navigation */}
              <ul className="klaviyo-tabs">
                <li className={activeTab === "details" ? "active" : ""}>
                  <button onClick={() => setActiveTab("details")}>
                    <i className="fas fa-info-circle"></i>
                    Details
                  </button>
                </li>
                <li className={activeTab === "metrics" ? "active" : ""}>
                  <button onClick={() => setActiveTab("metrics")}>
                    <i className="fas fa-chart-line"></i>
                    Metrics and Insights
                  </button>
                </li>
                <li className={activeTab === "segments" ? "active" : ""}>
                  <button onClick={() => setActiveTab("segments")}>
                    <i className="fas fa-layer-group"></i>
                    Lists and Segments
                  </button>
                </li>
                <li className={activeTab === "objects" ? "active" : ""}>
                  <button onClick={() => setActiveTab("objects")}>
                    <i className="fas fa-cube"></i>
                    Objects
                  </button>
                </li>
              </ul>

              {/* Tab Content */}
              <div className="tab-content-area">
                {/* Details Tab */}
                {activeTab === "details" && (
                  <div className="tab-panel">
                    <div className="tab-section">
                      <h3 className="section-title">Profile Information</h3>
                      <div className="info-grid">
                        <div className="info-item">
                          <label>Full Name</label>
                          <div className="info-value">{profile.name}</div>
                        </div>
                        <div className="info-item">
                          <label>Email Address</label>
                          <div className="info-value">{profile.email}</div>
                        </div>
                        <div className="info-item">
                          <label>Phone Number</label>
                          <div className="info-value">{profile.phone || 'Not provided'}</div>
                        </div>
                        <div className="info-item">
                          <label>Last Active</label>
                          <div className="info-value">{new Date(profile.lastActive).toLocaleString()}</div>
                        </div>
                        <div className="info-item">
                          <label>Profile ID</label>
                          <div className="info-value">{profile._id}</div>
                        </div>
                        <div className="info-item">
                          <label>Company ID</label>
                          <div className="info-value">{profile.company_id}</div>
                        </div>
                      </div>
                    </div>

                    <div className="tab-section">
                      <h3 className="section-title">Recent Activity</h3>
                      <div className="activity-list">
                        {allEvents.slice(0, 10).map((event, index) => (
                          <div key={index} className="activity-item">
                            <div className="activity-icon">
                              <i className={`fas ${
                                event.eventType === 'page_view' ? 'fa-eye' :
                                event.eventType === 'add_to_cart' ? 'fa-shopping-cart' :
                                event.eventType === 'purchase' ? 'fa-credit-card' :
                                event.eventType === 'button_click' ? 'fa-mouse-pointer' :
                                'fa-circle'
                              }`}></i>
                            </div>
                            <div className="activity-content">
                              <div className="activity-header">
                                <span className="activity-type">{event.eventType}</span>
                                <span className="activity-time">{new Date(event.timestamp).toLocaleString()}</span>
                              </div>
                              <div className="activity-description">
                                {event.eventData?.address && (
                                  <span className="activity-url">
                                    <i className="fas fa-link"></i>
                                    {event.eventData.address}
                                  </span>
                                )}
                              </div>
                              {event.eventData?.productInfos && event.eventData.productInfos.length > 0 && (
                                <div className="activity-products">
                                  <i className="fas fa-box"></i>
                                  {event.eventData.productInfos.length} product(s)
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Metrics and Insights Tab */}
                {activeTab === "metrics" && (
                  <div className="tab-panel">
                    <div className="metrics-grid">
                      <div className="metric-card">
                        <div className="metric-icon">
                          <i className="fas fa-mouse-pointer"></i>
                        </div>
                        <div className="metric-content">
                          <div className="metric-label">Total Sessions</div>
                          <div className="metric-value">{profile.events.length}</div>
                        </div>
                      </div>
                      <div className="metric-card">
                        <div className="metric-icon">
                          <i className="fas fa-chart-bar"></i>
                        </div>
                        <div className="metric-content">
                          <div className="metric-label">Total Events</div>
                          <div className="metric-value">{allEvents.length}</div>
                        </div>
                      </div>
                      <div className="metric-card">
                        <div className="metric-icon">
                          <i className="fas fa-dollar-sign"></i>
                        </div>
                        <div className="metric-content">
                          <div className="metric-label">Total Revenue</div>
                          <div className="metric-value">₹{totalRevenue.toFixed(2)}</div>
                        </div>
                      </div>
                      <div className="metric-card">
                        <div className="metric-icon">
                          <i className="fas fa-shopping-bag"></i>
                        </div>
                        <div className="metric-content">
                          <div className="metric-label">Products Viewed</div>
                          <div className="metric-value">{allProducts.length}</div>
                        </div>
                      </div>
                    </div>

                    <div className="tab-section">
                      <h3 className="section-title">Event Breakdown</h3>
                      <div className="event-breakdown-list">
                        {Object.entries(eventTypeCounts).map(([eventType, count], index) => (
                          <div key={index} className="breakdown-item">
                            <div className="breakdown-label">
                              <i className="fas fa-circle"></i>
                              {eventType}
                            </div>
                            <div className="breakdown-value">{count} events</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="tab-section">
                      <h3 className="section-title">Product Interactions</h3>
                      {allProducts.length > 0 ? (
                        <div className="products-table-container">
                          <table className="modern-table">
                            <thead>
                              <tr>
                                <th>Product Name</th>
                                <th>Product ID</th>
                                <th>Price</th>
                              </tr>
                            </thead>
                            <tbody>
                              {allProducts.map((product, index) => (
                                <tr key={index}>
                                  <td>
                                    <div className="product-name">
                                      <i className="fas fa-box"></i>
                                      {product.productName}
                                    </div>
                                  </td>
                                  <td><code>{product.productId}</code></td>
                                  <td><strong>₹{product.price}</strong></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="empty-state">
                          <i className="fas fa-inbox"></i>
                          <p>No product interactions found</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Lists and Segments Tab */}
                {activeTab === "segments" && (
                  <div className="tab-panel">
                    <div className="tab-section">
                      <h3 className="section-title">Activity Timeline</h3>
                      <div className="timeline-container">
                        {allEvents.map((event, index) => (
                          <div key={index} className="timeline-event">
                            <div className={`timeline-marker ${
                              event.eventType === 'purchase' ? 'success' :
                              event.eventType === 'add_to_cart' ? 'warning' :
                              event.eventType === 'page_view' ? 'info' : 'default'
                            }`}>
                              <i className={`fas ${
                                event.eventType === 'purchase' ? 'fa-check' :
                                event.eventType === 'add_to_cart' ? 'fa-shopping-cart' :
                                event.eventType === 'page_view' ? 'fa-eye' :
                                event.eventType === 'button_click' ? 'fa-mouse-pointer' : 'fa-circle'
                              }`}></i>
                            </div>
                            <div className="timeline-event-content">
                              <div className="timeline-event-header">
                                <span className="timeline-event-type">{event.eventType}</span>
                                <span className="timeline-event-time">
                                  {new Date(event.timestamp).toLocaleString()}
                                </span>
                              </div>
                              {event.eventData?.address && (
                                <div className="timeline-event-url">
                                  <i className="fas fa-link"></i>
                                  {event.eventData.address}
                                </div>
                              )}
                              {event.eventData?.productInfos && event.eventData.productInfos.length > 0 && (
                                <div className="timeline-event-products">
                                  <strong>Products:</strong>
                                  <ul>
                                    {event.eventData.productInfos.map((prod, pi) => (
                                      <li key={pi}>
                                        {prod.productName} — ₹{prod.price}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              <div className="timeline-event-meta">
                                <span className="session-badge">
                                  <i className="fas fa-fingerprint"></i>
                                  Session: {event.sessionId.substring(0, 12)}...
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Objects Tab */}
                {activeTab === "objects" && (
                  <div className="tab-panel">
                    <div className="tab-section">
                      <h3 className="section-title">Products Viewed</h3>
                      {allProducts.length > 0 ? (
                        <div className="products-grid">
                          {allProducts.map((product, index) => (
                            <div key={index} className="product-card-modern">
                              <div className="product-card-icon">
                                <i className="fas fa-box"></i>
                              </div>
                              <div className="product-card-content">
                                <h4>{product.productName}</h4>
                                <div className="product-meta">
                                  <span className="product-id">
                                    <i className="fas fa-barcode"></i>
                                    ID: {product.productId}
                                  </span>
                                  <span className="product-price">
                                    <i className="fas fa-tag"></i>
                                    ₹{product.price}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="empty-state">
                          <i className="fas fa-inbox"></i>
                          <p>No products found</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Activity Log (persistent) */}
          <div className="col-lg-3">
            <div className="sidebar-sticky">
              <div className="activity-sidebar-card">
                <div className="sidebar-header">
                  <h4>
                    <i className="fas fa-stream"></i>
                    Activity Feed
                  </h4>
                </div>
                <div className="sidebar-activity-list">
                  {allEvents.slice(0, 15).map((event, index) => (
                    <div key={index} className="sidebar-activity-item">
                      <div className={`sidebar-activity-dot ${
                        event.eventType === 'purchase' ? 'success' :
                        event.eventType === 'add_to_cart' ? 'warning' :
                        event.eventType === 'page_view' ? 'info' : 'default'
                      }`}></div>
                      <div className="sidebar-activity-content">
                        <div className="sidebar-activity-type">{event.eventType}</div>
                        <div className="sidebar-activity-time">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="quick-stats-card">
                <div className="sidebar-header">
                  <h4>
                    <i className="fas fa-chart-pie"></i>
                    Quick Stats
                  </h4>
                </div>
                <div className="quick-stats-list">
                  <div className="quick-stat-item">
                    <span className="stat-label">Sessions</span>
                    <span className="stat-value">{profile.events.length}</span>
                  </div>
                  <div className="quick-stat-item">
                    <span className="stat-label">Events</span>
                    <span className="stat-value">{allEvents.length}</span>
                  </div>
                  <div className="quick-stat-item">
                    <span className="stat-label">Revenue</span>
                    <span className="stat-value">₹{totalRevenue.toFixed(2)}</span>
                  </div>
                  <div className="quick-stat-item">
                    <span className="stat-label">Products</span>
                    <span className="stat-value">{allProducts.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
