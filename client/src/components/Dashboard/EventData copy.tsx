// src/components/Dashboard/EventData.tsx
import React from 'react';

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

interface TrackingData {
  userId: {
    name: string;
    email: string;
  };
  events: EventType[];
}

interface EventDataProps {
  trackingData: TrackingData[];
}

const EventData: React.FC<EventDataProps> = ({ trackingData }) => {
  console.log('Tracking Data in EventData:', trackingData); // Debug log

  return (

    <>

      <div id="content-wrapper" className="d-flex flex-column">
        {/* Main Content */}
        <div id="content">
          {/* Topbar */}
          <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
            {/* Sidebar Toggle (Topbar) */}
            <button id="sidebarToggleTop" className="btn btn-link d-md-none rounded-circle mr-3">
              <i className="fa fa-bars"></i>
            </button>

            {/* Topbar Navbar */}
            <ul className="navbar-nav ml-auto">
              {/* Nav Item - Search Dropdown (Visible Only XS) */}
              <li className="nav-item dropdown no-arrow d-sm-none">
                <a className="nav-link dropdown-toggle" href="#" id="searchDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <i className="fas fa-search fa-fw"></i>
                </a>
                {/* Dropdown - Messages */}
                <div className="dropdown-menu dropdown-menu-right p-3 shadow animated--grow-in" aria-labelledby="searchDropdown">
                  <form className="form-inline mr-auto w-100 navbar-search">
                    <div className="input-group">
                      <input type="text" className="form-control bg-light border-0 small" placeholder="Search for..." aria-label="Search" aria-describedby="basic-addon2" />
                      <div className="input-group-append">
                        <button className="btn btn-primary" type="button">
                          <i className="fas fa-search fa-sm"></i>
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </li>

              {/* Nav Item - Alerts */}
              <li className="nav-item dropdown no-arrow mx-1">
                <a className="nav-link dropdown-toggle" href="#" id="alertsDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <i className="fas fa-bell fa-fw"></i>
                  <span className="badge badge-danger badge-counter">3+</span>
                </a>
                {/* Dropdown - Alerts */}
                <div className="dropdown-list dropdown-menu dropdown-menu-right shadow animated--grow-in" aria-labelledby="alertsDropdown">
                  <h6 className="dropdown-header">Alerts Center</h6>
                  {/* Alert Items */}
                  {/* (repeat blocks for each alert) */}
                </div>
              </li>

              {/* Nav Item - Messages */}
              <li className="nav-item dropdown no-arrow mx-1">
                <a className="nav-link dropdown-toggle" href="#" id="messagesDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <i className="fas fa-envelope fa-fw"></i>
                  <span className="badge badge-danger badge-counter">7</span>
                </a>
                <div className="dropdown-list dropdown-menu dropdown-menu-right shadow animated--grow-in" aria-labelledby="messagesDropdown">
                  <h6 className="dropdown-header">Message Center</h6>
                  {/* Message Items */}
                  {/* (repeat blocks for each message) */}
                </div>
              </li>

              <div className="topbar-divider d-none d-sm-block"></div>

              {/* Nav Item - User Info */}
              <li className="nav-item dropdown no-arrow">
                <a className="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <span className="mr-2 d-none d-lg-inline text-gray-600 small">Douglas McGee</span>
                  <img className="img-profile rounded-circle" src="img/undraw_profile.svg" alt="Profile" />
                </a>
                <div className="dropdown-menu dropdown-menu-right shadow animated--grow-in" aria-labelledby="userDropdown">
                  <a className="dropdown-item" href="#"><i className="fas fa-user fa-sm fa-fw mr-2 text-gray-400"></i> Profile</a>
                  <a className="dropdown-item" href="#"><i className="fas fa-cogs fa-sm fa-fw mr-2 text-gray-400"></i> Settings</a>
                  <a className="dropdown-item" href="#"><i className="fas fa-list fa-sm fa-fw mr-2 text-gray-400"></i> Activity Log</a>
                  <div className="dropdown-divider"></div>
                  <a className="dropdown-item" href="#" data-toggle="modal" data-target="#logoutModal">
                    <i className="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400"></i> Logout
                  </a>
                </div>
              </li>
            </ul>
          </nav>

          {/* Begin Page Content */}
          <div className="container-fluid">
            {/* Page Heading */}
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
              <h1 className="h3 mb-0 text-gray-800">Dashboard</h1>
              <a href="#" className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm">
                <i className="fas fa-download fa-sm text-white-50"></i> Generate Report
              </a>
            </div>

            {/* Content Row */}
            <div className="row">
              {/* Earnings Cards */}
              <div className="col-xl-3 col-md-6 mb-4">
                <div className="card border-left-primary shadow h-100 py-2">
                  <div className="card-body">
                    <div className="row no-gutters align-items-center">
                      <div className="col mr-2">
                        <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">Earnings (Monthly)</div>
                        <div className="h5 mb-0 font-weight-bold text-gray-800">$40,000</div>
                      </div>
                      <div className="col-auto">
                        <i className="fas fa-calendar fa-2x text-gray-300"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Other cards... (Annual, Tasks, Requests) */}

              <div className="col-xl-3 col-md-6 mb-4">
                <div className="card border-left-info shadow h-100 py-2">
                  <div className="card-body">
                    <div className="row no-gutters align-items-center">
                      <div className="col mr-2">
                        <div className="text-xs font-weight-bold text-info text-uppercase mb-1">Tasks</div>
                        <div className="row no-gutters align-items-center">
                          <div className="col-auto">
                            <div className="h5 mb-0 mr-3 font-weight-bold text-gray-800">50%</div>
                          </div>
                          <div className="col">
                            <div className="progress progress-sm mr-2">
                              <div
                                className="progress-bar"
                                role="progressbar"
                                style={{ width: "50%" }}
                                aria-valuenow={50}
                                aria-valuemin={0}
                                aria-valuemax={100}
                              />

                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-auto">
                        <i className="fas fa-clipboard-list fa-2x text-gray-300"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Repeat similar structure for other cards */}
            </div>

            {/* Development Approach */}
            <div className="row">
              <div className="col-lg-12 mb-4">
                <div className="card shadow mb-4">
                  <div className="card-header py-3">
                    <h6 className="m-0 font-weight-bold text-primary">Development Approach</h6>
                  </div>
                  <div className="card-body">
                    <p>
                      SB Admin 2 makes extensive use of Bootstrap 4 utility classes in order to reduce CSS bloat and poor page performance. Custom CSS classes are used to create custom components and custom utility classes.
                    </p>
                    <p className="mb-0">
                      Before working with this theme, you should become familiar with the Bootstrap framework, especially the utility classes.
                    </p>



                    <div>
                      {trackingData && trackingData.length > 0 ? (
                        <ul>
                          {trackingData.map((item, index) => (
                            <li key={index}>
                              <p>
                                <strong>Name:</strong> {item.userId.name}
                              </p>
                              <p>
                                <strong>Email:</strong> {item.userId.email}
                              </p>
                              <ul>
                                {item.events.map((event, idx) => (
                                  <li
                                    key={idx}
                                    style={{
                                      marginBottom: "20px",
                                      padding: "10px",
                                      border: "1px solid #ddd",
                                      borderRadius: "5px",
                                    }}
                                  >
                                    <p>
                                      <strong>Event Type:</strong> {event.eventType}
                                    </p>
                                    <p>
                                      <strong>Timestamp:</strong>{" "}
                                      {event.timestamp.toLocaleString()}
                                    </p>

                                    <h4>Event Data</h4>
                                    <p>
                                      <strong>Address:</strong> {event.eventData.address}
                                    </p>

                                    <h4>Products Involved</h4>
                                    <ul>
                                      {event.eventData.productInfos.map((product, idx) => (
                                        <li key={idx}>
                                          <strong>Product:</strong> {product.productName}
                                          <br />
                                          <strong>Price:</strong> ${product.price}
                                          <br />
                                          <strong>Product ID:</strong> {product.productId}
                                        </li>
                                      ))}
                                    </ul>
                                  </li>
                                ))}
                              </ul>
                              <hr />
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>No tracking data available.</p>
                      )}
                    </div>





                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* /.container-fluid */}
        </div>
        {/* End of Main Content */}

        {/* Footer */}
        <footer className="sticky-footer bg-white">
          <div className="container my-auto">
            <div className="copyright text-center my-auto">
              <span>Copyright &copy; Your Website 2021</span>
            </div>
          </div>
        </footer>
      </div>





    </>

  );
};

export default EventData;
