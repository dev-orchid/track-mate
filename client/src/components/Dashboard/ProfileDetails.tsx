// src/components/Dashboard/ProfileDetails.tsx

import React, { useState } from "react";
import { useRouter } from "next/router";
import useProfileDetails from "../../hooks/useProfileDetails";

export default function ProfileDetails() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const { profile, loading, error } = useProfileDetails(id);
  const [activeTab, setActiveTab] = useState("details");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  if (!id || loading) {
    return (
      <div className="text-center py-5">
        <p>Loading profile…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-5 text-danger">
        <p>Error loading profile: {error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-5 text-muted">
        <p>Profile not found</p>
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

  return (
    <div>
      <div id="content-wrapper" className="d-flex flex-column w-100">
        {/* Main Content */}
        <div id="content">
          {/* Begin Page Content */}
          <div className="container-fluid">
            {/* Page Heading */}
            <button
              className="btn btn-link mb-4"
              onClick={() => router.back()}
            >
              ← All Profiles
            </button>
            
            {/* Development Approach */}
            <div className="row">
              <div className="col-lg-9 mb-4">
                <div className="card shadow mb-4">
                  <div className="card-body">
                    <ul className="nav nav-tabs">
                      <li className="nav-item">
                        <a
                          className={`nav-link ${
                            activeTab === "details" ? "active" : ""
                          }`}
                          onClick={() => setActiveTab("details")}
                         
                        >
                          Details
                        </a>
                      </li>
                      <li className="nav-item" onClick={() => toggle(0)}>
                        <a
                          className={`nav-link ${
                            activeTab === "metrics" ? "active" : ""
                          }`}
                          onClick={() => setActiveTab("metrics")}
                         
                        >
                          Metrics and Insights
                        </a>
                      </li>
                      <li className="nav-item">
                        <a
                          className={`nav-link ${
                            activeTab === "segments" ? "active" : ""
                          }`}
                          onClick={() => setActiveTab("segments")}
                         
                        >
                          List and Segments
                        </a>
                      </li>
                      <li className="nav-item">
                        <a
                          className={`nav-link ${
                            activeTab === "objects" ? "active" : ""
                          }`}
                          onClick={() => setActiveTab("objects")}
                         
                        >
                          Objects
                        </a>
                      </li>
                    </ul>

                    <div className="tab-content mt-3">
                      {/* Details Tab */}
                      <div
                        className={`tab-pane fade ${
                          activeTab === "details" ? "show active" : ""
                        }`}
                      >
                        <div className="mb-4">
                          <h5 className="mb-3">User: {profile.email}</h5>
                          
                          {/* Profile Info */}
                          <div className="row mb-4">
                            <div className="col-md-6">
                              <p><strong>Name:</strong> {profile.name}</p>
                              <p><strong>Email:</strong> {profile.email}</p>
                            </div>
                            <div className="col-md-6">
                              <p><strong>Phone:</strong> {profile.phone}</p>
                              <p>
                                <strong>Last Active:</strong>{" "}
                                {new Date(profile.lastActive).toLocaleString()}
                              </p>
                            </div>
                          </div>

                          {profile.events.map((session, si) => (
                            <div key={si} className="mt-3">
                              <h6>Session ID: {session.sessionId}</h6>

                              <table className="table50 table border mt-2">
                                <thead>
                                  <tr>
                                    <th>Event Type</th>
                                    <th>Timestamp</th>
                                    <th>Address</th>
                                    <th>Products</th>
                                  </tr>
                                </thead>

                                <tbody>
                                  {session.events.map((ev, ei) => (
                                    <tr key={ei}>
                                      <td>{ev.eventType}</td>
                                      <td>
                                        {new Date(
                                          ev.timestamp
                                        ).toLocaleString()}
                                      </td>
                                      <td>
                                        {ev.eventData?.address || "—"}
                                      </td>
                                      <td>
                                        {ev.eventData?.productInfos
                                          ?.length > 0 ? (
                                          <ul className="mb-0 pl-3">
                                            {ev.eventData.productInfos.map(
                                              (prod, pi2) => (
                                                <li key={pi2}>
                                                  {prod.productName} — ₹
                                                  {prod.price} (ID:{" "}
                                                  {prod.productId})
                                                </li>
                                              )
                                            )}
                                          </ul>
                                        ) : (
                                          "—"
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Metrics and Insights Tab */}
                      <div
                        className={`tab-pane fade ${
                          activeTab === "metrics" ? "show active" : ""
                        }`}
                      >
                        <div className="accordion" id="accordionExample">
                       
                          <div className="card">
                            <div className="card-header" id="heading0">
                              <h2 className="mb-0">
                                <button
                                  className={`btn btn-link btn-block text-left ${
                                    activeIndex === 0 ? "" : "collapsed"
                                  }`}
                                  onClick={() => toggle(0)}
                                  aria-expanded={activeIndex === 0}
                                  aria-controls="collapse0"
                                >
                                  Session Summary
                                </button>
                              </h2>
                            </div>

                            <div
                              id="collapse0"
                              className={`collapse ${
                                activeIndex === 0 ? "show" : ""
                              }`}
                              aria-labelledby="heading0"
                              data-parent="#accordionExample"
                            >
                              <div className="card-body">
                                <div className="table-responsive">
                                  <table className="table table-bordered">
                                    <thead className="thead-light">
                                      <tr>
                                        <th>Total Sessions</th>
                                        <th>Total Events</th>
                                        <th>First Session</th>
                                        <th>Last Session</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr>
                                        <td>{profile.events.length}</td>
                                        <td>{profile.events.reduce((total, session) => total + session.events.length, 0)}</td>
                                        <td>
                                          {profile.events.length > 0
                                            ? new Date(
                                                profile.events[profile.events.length - 1]
                                                  .events[0]?.timestamp
                                              ).toLocaleDateString()
                                            : "N/A"}
                                        </td>
                                        <td>
                                          {profile.events.length > 0
                                            ? new Date(
                                                profile.events[0].events[0]?.timestamp
                                              ).toLocaleDateString()
                                            : "N/A"}
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Event Types */}
                          <div className="card">
                            <div className="card-header" id="heading1">
                              <h2 className="mb-0">
                                <button
                                  className={`btn btn-link btn-block text-left ${
                                    activeIndex === 1 ? "" : "collapsed"
                                  }`}
                                  onClick={() => toggle(1)}
                                  aria-expanded={activeIndex === 1}
                                  aria-controls="collapse1"
                                >
                                  Event Types
                                </button>
                              </h2>
                            </div>

                            <div
                              id="collapse1"
                              className={`collapse ${
                                activeIndex === 1 ? "show" : ""
                              }`}
                              aria-labelledby="heading1"
                              data-parent="#accordionExample"
                            >
                              <div className="card-body">
                                <div className="">
                                  <ul className="list-group">
                                    {Object.entries(eventTypeCounts).map(([eventType, count], index) => (
                                      <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                        <div>
                                          <strong>{eventType}</strong>
                                        </div>
                                        <span className="badge badge-primary badge-pill">
                                          {count}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Product Interactions */}
                          <div className="card">
                            <div className="card-header" id="heading2">
                              <h2 className="mb-0">
                                <button
                                  className={`btn btn-link btn-block text-left ${
                                    activeIndex === 2 ? "" : "collapsed"
                                  }`}
                                  onClick={() => toggle(2)}
                                  aria-expanded={activeIndex === 2}
                                  aria-controls="collapse2"
                                >
                                  Product Interactions
                                </button>
                              </h2>
                            </div>

                            <div
                              id="collapse2"
                              className={`collapse ${
                                activeIndex === 2 ? "show" : ""
                              }`}
                              aria-labelledby="heading2"
                              data-parent="#accordionExample"
                            >
                              <div className="card-body">
                                {allProducts.length > 0 ? (
                                  <table className="table table-bordered">
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
                                          <td>{product.productName}</td>
                                          <td>{product.productId}</td>
                                          <td>₹{product.price}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                ) : (
                                  <p>No product interactions found.</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* List and Segments Tab */}
                      <div
                        className={`tab-pane fade ${
                          activeTab === "segments" ? "show active" : ""
                        }`}
                      >
                        <div className="activity-log-container">
                          <div className="timeline">
                            {allEvents.map((event, index) => (
                              <div key={index} className="timeline-item">
                                <div className={`timeline-dot ${
                                  event.eventType === 'Purchase' ? 'success' : 
                                  event.eventType === 'Cart Update' ? 'info' :
                                  event.eventType === 'add_to_cart' ? 'warning' : 'gray'
                                }`}></div>
                                <div className="timeline-content">
                                  <h6>{event.eventType}</h6>
                                  <p>Session: {event.sessionId}</p>
                                  {event.eventData?.address && (
                                    <p>Location: {event.eventData.address}</p>
                                  )}
                                  <span className="timestamp">
                                    {new Date(event.timestamp).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Objects Tab */}
                      <div
                        className={`tab-pane fade ${
                          activeTab === "objects" ? "show active" : ""
                        }`}
                      >
                        <h4>Products Viewed</h4>
                        {allProducts.length > 0 ? (
                          <div className="row">
                            {allProducts.map((product, index) => (
                              <div key={index} className="col-md-4 mb-3">
                                <div className="card">
                                  <div className="card-body">
                                    <h5 className="card-title">{product.productName}</h5>
                                    <p className="card-text">
                                      Product ID: {product.productId}
                                      <br />
                                      Price: ₹{product.price}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p>No products found.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Log Sidebar */}
              <div className="col-lg-3 mb-4">
                <div className="card shadow mb-4">
                  <div className="card-header py-3">
                    <h6 className="m-0 font-weight-bold text-primary">
                      Activity Log
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="activity-log-container">
                      <div className="timeline">
                        {allEvents.slice(0, 5).map((event, index) => (
                          <div key={index} className="timeline-item">
                            <div className={`timeline-dot ${
                              event.eventType === 'purchase' ? 'success' : 
                              event.eventType === 'view' ? 'info' :
                              event.eventType === 'add_to_cart' ? 'warning' : 'gray'
                            }`}></div>
                            <div className="timeline-content">
                              <h6>{event.eventType}</h6>
                              <span className="timestamp">
                                {new Date(event.timestamp).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Summary Card */}
                <div className="card shadow mb-4">
                  <div className="card-header py-3">
                    <h6 className="m-0 font-weight-bold text-primary">
                      Profile Summary
                    </h6>
                  </div>
                  <div className="card-body">
                    <p><strong>Name:</strong> {profile.name}</p>
                    <p><strong>Email:</strong> {profile.email}</p>
                    <p><strong>Phone:</strong> {profile.phone}</p>
                    <p>
                      <strong>Last Active:</strong><br />
                      {new Date(profile.lastActive).toLocaleString()}
                    </p>
                    <p>
                      <strong>Total Sessions:</strong> {profile.events.length}
                    </p>
                    <p>
                      <strong>Total Events:</strong>{" "}
                      {profile.events.reduce((total, session) => total + session.events.length, 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* /.container-fluid */}
        </div>
        {/* End of Main Content */}
      </div>
    </div>
  );
}