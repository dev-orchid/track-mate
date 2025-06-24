// src/components/Dashboard/EventData.tsx
import React from 'react';



interface profileData {
  userId: {
    name: string;
    phone: number;
    email: string;
  };
}

interface profileDataProps {
  profileData: profileData[];
}

const EventData: React.FC<profileDataProps> = ({ profileData }) => {
  console.log('Tracking Data in EventData:', profileData); // Debug log

  return (




    <div>


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
              <h1 className="h3 mb-0 text-gray-800">Profile</h1>

            </div>





            {/* Development Approach */}
            <div className="row">
              <div className="col-lg-12 mb-4">
                <div className="card shadow mb-4">
                  <div className="card-header py-3">
                    <h6 className="m-0 font-weight-bold text-primary">Profile Details</h6>
                  </div>
                  <div className="card-body">


                    {profileData && profileData.length > 0 ? (
                      <div   >
                        {profileData.map((item, index) => (
                          <table className=" table50 table border mt-3" key={index}>

                            <thead>
                              <tr>
                                <th scope="col">Name</th>
                                <th scope="col">Email</th>
                              </tr>
                            </thead>


                            <tbody>

                              <tr>
                                <td>
                                  {item.name}
                                </td>
                                <td>
                                  {item.email}
                                </td>
                              </tr>


                            </tbody>


                          </table>
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
          {/* /.container-fluid */}
        </div>
        {/* End of Main Content */}

        {/* Footer */}





      </div >






    </div>

  );
};

export default EventData;
