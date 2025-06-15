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

      <div id="content-wrapper" className="d-flex flex-column w-100">
        {/* Main Content */}
        <div id="content">
          {/* Topbar */}
          <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
            {/* Sidebar Toggle (Topbar) */}


            {/* Topbar Navbar */}
            <ul className="navbar-nav ml-auto">
              {/* Nav Item - Search Dropdown (Visible Only XS) */}


              {/* Nav Item - User Info */}
              <li className="nav-item dropdown no-arrow">
                <a className="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <span className="mr-2 d-none d-lg-inline text-gray-600 small">Admin</span>

                </a>

              </li>
            </ul>
          </nav>

          {/* Begin Page Content */}
          <div className="container-fluid">
            {/* Page Heading */}
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
              <h1 className="h3 mb-0 text-gray-800">Dashboard</h1>

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






                    <div>
                      {trackingData && trackingData.length > 0 ? (
                        <div>
                          {trackingData.map((item, index) => (
                            <div key={index}>

                              <h6 className='h6  '><b>Name:</b> {item.userId.name}</h6>
                              <h6 className='h6'><b>Email:</b>  {item.userId.email}</h6>




                              {item.events.map((event, idx) => (
                                <table className="table border mt-3" key={idx} >


                                  <thead>
                                    <tr>
                                      <th scope="col">Event Type</th>
                                      <th scope="col">Timestamp</th>
                                      <th scope="col">Event Data</th>
                                      <th scope="col">Products Involved</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr>
                                      <th scope="row"> {event.eventType}</th>
                                      <td>{" "}
                                        {event.timestamp.toLocaleString()}</td>
                                      <td> <strong>Address:</strong> {event.eventData.address}</td>
                                      <td><ul>
                                        {event.eventData.productInfos.map((product, idx) => (
                                          <li key={idx}>
                                            <strong>Product:</strong> {product.productName}
                                            <br />
                                            <strong>Price:</strong> ${product.price}
                                            <br />
                                            <strong>Product ID:</strong> {product.productId}
                                          </li>
                                        ))}
                                      </ul></td>
                                    </tr>

                                  </tbody>








                                </table>
                              ))}



                            </div>
                          ))}
                        </div>
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



      </div >





    </>

  );
};

export default EventData;
