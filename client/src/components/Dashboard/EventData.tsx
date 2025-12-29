// src/components/Dashboard/EventData_new.tsx
import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ProductInfo {
  productName: string;
  price: number;
  productId: string;
}

interface EventType {
  eventType: string;
  timestamp: Date;
  eventData: {
    address: string;
    productInfos: ProductInfo[];
  };
}

// Event Document structure (MongoDB Event schema)
interface EventDocument {
  sessionId: string;
  userId?: string;
  events: EventType[]; // Nested array of actual events
}

// Profile structure with populated events
interface ProfileWithEvents {
  _id: string;
  name: string;
  email: string;
  phone?: number;
  company_id: string;
  events?: EventDocument[]; // Array of Event documents
}

interface EventDataProps {
  trackingData: ProfileWithEvents[];
}

const EventData: React.FC<EventDataProps> = ({ trackingData }) => {
  // Calculate real metrics from tracking data
  const metrics = useMemo(() => {
    if (!trackingData || trackingData.length === 0) {
      return {
        totalUsers: 0,
        totalEvents: 0,
        totalRevenue: 0,
        avgEventsPerUser: 0,
        eventTypes: {},
        recentActivity: [],
        dailyEvents: {},
      };
    }

    const totalUsers = trackingData.length;
    let totalEvents = 0;
    let totalRevenue = 0;
    const eventTypes: Record<string, number> = {};
    const recentActivity: any[] = [];
    const dailyEvents: Record<string, number> = {};

    trackingData.forEach((profile) => {
      // Each profile has an 'events' array containing Event documents
      // Each Event document has a nested 'events' array with actual event data
      const eventDocuments = profile.events || [];

      eventDocuments.forEach((eventDoc) => {
        // Get the actual events from the Event document
        const actualEvents = eventDoc.events || [];
        totalEvents += actualEvents.length;

        actualEvents.forEach((event) => {
          // Count event types
          eventTypes[event.eventType] = (eventTypes[event.eventType] || 0) + 1;

          // Calculate revenue - safely handle missing eventData or productInfos
          const productInfos = event.eventData?.productInfos || [];
          productInfos.forEach((product) => {
            totalRevenue += product.price || 0;
          });

          // Track daily events
          const date = new Date(event.timestamp).toLocaleDateString();
          dailyEvents[date] = (dailyEvents[date] || 0) + 1;

          // Collect all events for recent activity processing later
          recentActivity.push({
            user: profile.name || 'Anonymous User',
            email: profile.email,
            profileId: profile._id,
            eventType: event.eventType,
            timestamp: event.timestamp,
            products: event.eventData?.productInfos || [],
          });
        });
      });
    });

    const avgEventsPerUser = totalUsers > 0 ? (totalEvents / totalUsers).toFixed(1) : 0;

    // Group recent activity by user - show each user once with their latest event and event count
    const userActivityMap = new Map<string, any>();

    recentActivity.forEach((activity) => {
      const key = activity.profileId || activity.email || activity.user;
      const existing = userActivityMap.get(key);

      if (!existing) {
        userActivityMap.set(key, {
          ...activity,
          eventCount: 1,
          allEvents: [activity.eventType]
        });
      } else {
        existing.eventCount += 1;
        if (!existing.allEvents.includes(activity.eventType)) {
          existing.allEvents.push(activity.eventType);
        }
        // Keep the most recent timestamp
        if (new Date(activity.timestamp) > new Date(existing.timestamp)) {
          existing.timestamp = activity.timestamp;
          existing.eventType = activity.eventType;
        }
      }
    });

    // Convert to array and sort by latest activity
    const uniqueUserActivity = Array.from(userActivityMap.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    return {
      totalUsers,
      totalEvents,
      totalRevenue,
      avgEventsPerUser,
      eventTypes,
      recentActivity: uniqueUserActivity,
      dailyEvents,
    };
  }, [trackingData]);

  // Prepare chart data
  const eventTrendData = {
    labels: Object.keys(metrics.dailyEvents).slice(-7),
    datasets: [
      {
        label: 'Events',
        data: Object.values(metrics.dailyEvents).slice(-7),
        borderColor: '#FB4C00',
        backgroundColor: 'rgba(251, 76, 0, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const eventTypeData = {
    labels: Object.keys(metrics.eventTypes),
    datasets: [
      {
        data: Object.values(metrics.eventTypes),
        backgroundColor: [
          '#FB4C00',
          '#FF7A3D',
          '#FFA06A',
          '#4F46E5',
          '#7C3AED',
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#f0f0f0',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  return (
    <div id="content-wrapper" className="modern-dashboard">
      <div id="content">
        <div className="container-fluid">
          {/* Page Heading */}
          <div className="dashboard-heading">
            <h1 className="dashboard-title">Analytics Overview</h1>
            <p className="dashboard-subtitle">Track your user engagement and revenue metrics</p>
          </div>

          {/* KPI Cards Row */}
          <div className="kpi-grid">
            <div className="kpi-card kpi-primary">
              <div className="kpi-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20 8V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M23 11H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="kpi-content">
                <div className="kpi-label">Total Users</div>
                <div className="kpi-value">{metrics.totalUsers.toLocaleString()}</div>
                <div className="kpi-change positive">+12% from last month</div>
              </div>
            </div>

            <div className="kpi-card kpi-success">
              <div className="kpi-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="kpi-content">
                <div className="kpi-label">Total Events</div>
                <div className="kpi-value">{metrics.totalEvents.toLocaleString()}</div>
                <div className="kpi-change positive">+8% from last month</div>
              </div>
            </div>

            <div className="kpi-card kpi-warning">
              <div className="kpi-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 18V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4.93 4.93L7.76 7.76" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16.24 16.24L19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4.93 19.07L7.76 16.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16.24 7.76L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="kpi-content">
                <div className="kpi-label">Avg Events/User</div>
                <div className="kpi-value">{metrics.avgEventsPerUser}</div>
                <div className="kpi-change positive">+5% from last month</div>
              </div>
            </div>

            <div className="kpi-card kpi-info">
              <div className="kpi-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="kpi-content">
                <div className="kpi-label">Total Revenue</div>
                <div className="kpi-value">${metrics.totalRevenue.toLocaleString()}</div>
                <div className="kpi-change positive">+18% from last month</div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="charts-grid">
            <div className="chart-card">
              <div className="chart-header">
                <h3 className="chart-title">Event Trends (Last 7 Days)</h3>
              </div>
              <div className="chart-container" style={{ height: '300px' }}>
                <Line data={eventTrendData} options={chartOptions} />
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3 className="chart-title">Events by Type</h3>
              </div>
              <div className="chart-container" style={{ height: '300px' }}>
                <Doughnut data={eventTypeData} options={doughnutOptions} />
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="activity-card">
            <div className="activity-header">
              <h3 className="activity-title">Recent Activity</h3>
            </div>
            <div className="activity-list">
              {metrics.recentActivity.length > 0 ? (
                metrics.recentActivity.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-dot"></div>
                    <div className="activity-content">
                      <div className="activity-main">
                        <span className="activity-user">{activity.user}</span>
                        <span className="activity-event">{activity.eventType}</span>
                        {activity.eventCount > 1 && (
                          <span className="activity-count" style={{
                            marginLeft: '8px',
                            fontSize: '11px',
                            padding: '2px 8px',
                            backgroundColor: '#f0f0f0',
                            borderRadius: '12px',
                            color: '#666'
                          }}>
                            +{activity.eventCount - 1} more
                          </span>
                        )}
                      </div>
                      <div className="activity-time">
                        {new Date(activity.timestamp).toLocaleString()}
                      </div>
                      {activity.products.length > 0 && (
                        <div className="activity-products">
                          {activity.products.map((product: ProductInfo, idx: number) => (
                            <span key={idx} className="product-tag">
                              {product.productName} - ${product.price}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>No recent activity available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventData;
