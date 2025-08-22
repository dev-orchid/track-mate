// src/components/Dashboard/EventData.tsx
import React from "react";
import { useState } from "react";

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

const EventData: React.FC<profileDataProps> = ( { profileData } ) => {
  console.log( "Tracking Data in EventData:", profileData ); // Debug log

  const [ activeTab, setActiveTab ] = useState( "home" );

  const [ activeIndex, setActiveIndex ] = useState( null );

  const toggle = ( index ) => {
    setActiveIndex( activeIndex === index ? null : index );
  };

  return (
    <div>
      <div id="content-wrapper" className="d-flex flex-column w-100">
        {/* Main Content */ }
        <div id="content">
          {/* Begin Page Content */ }
          <div className="container-fluid">
            {/* Page Heading */ }
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
              <h1 className="h3 mb-0 text-gray-800">Profile</h1>
            </div>
            {/* Development Approach */ }
            <div className="row">
              <div className="col-lg-9 mb-4">
                <div className="card shadow mb-4">
                  <div className="card-header py-3">
                    <h6 className="m-0 font-weight-bold text-primary">
                      All Profile Details
                    </h6>
                  </div>
                  <div className="card-body">
                    <ul className="nav nav-tabs">
                      <li className="nav-item">
                        <a
                          className={ `nav-link ${ activeTab === "home"
                            ? "active"
                            : ""
                            }` }
                          onClick={ () =>
                            setActiveTab( "home" )
                          }
                          href="#"
                        >
                          Details
                        </a>
                      </li>
                      <li className="nav-item">
                        <a
                          className={ `nav-link ${ activeTab === "profile"
                            ? "active"
                            : ""
                            }` }
                          onClick={ () =>
                            setActiveTab( "profile" )
                          }
                          href="#"
                        >
                          Metrics and Insights
                        </a>
                      </li>

                      <li className="nav-item">
                        <a
                          className={ `nav-link ${ activeTab === "list"
                            ? "active"
                            : ""
                            }` }
                          onClick={ () =>
                            setActiveTab( "list" )
                          }
                          href="#"
                        >
                          List and Segments
                        </a>
                      </li>

                      <li className="nav-item">
                        <a
                          className={ `nav-link ${ activeTab === "objects"
                            ? "active"
                            : ""
                            }` }
                          onClick={ () =>
                            setActiveTab( "objects" )
                          }
                          href="#"
                        >
                          Objects
                        </a>
                      </li>
                    </ul>

                    <div className="tab-content mt-3">
                      <div
                        className={ `tab-pane fade ${ activeTab === "home"
                          ? "show active"
                          : ""
                          }` }
                      >
                        { profileData &&
                          profileData.length > 0 ? (
                          profileData.map(
                            ( profile, pi ) => (
                              <div
                                key={ pi }
                                className="mb-4"
                              >
                                <h5 className="mb-3">
                                  User:{ " " }
                                  {
                                    profile.email
                                  }
                                </h5>

                                { profile.events.map(
                                  (
                                    session,
                                    si
                                  ) => (
                                    <div
                                      key={
                                        si
                                      }
                                      className="mt-3"
                                    >
                                      <h6>
                                        Session
                                        ID:{ " " }
                                        {
                                          session.sessionId
                                        }
                                      </h6>

                                      <table className="table50 table border mt-2">
                                        <thead>
                                          <tr>
                                            <th>
                                              Event
                                              Type
                                            </th>
                                            <th>
                                              Timestamp
                                            </th>
                                            <th>
                                              Address
                                            </th>
                                            <th>
                                              Products
                                            </th>
                                          </tr>
                                        </thead>

                                        <tbody>
                                          { session.events.map(
                                            (
                                              ev,
                                              ei
                                            ) => (
                                              <tr
                                                key={
                                                  ei
                                                }
                                              >
                                                <td>
                                                  {
                                                    ev.eventType
                                                  }
                                                </td>
                                                <td>
                                                  { new Date(
                                                    ev.timestamp
                                                  ).toLocaleString() }
                                                </td>
                                                <td>
                                                  { ev
                                                    .eventData
                                                    ?.address ||
                                                    "—" }
                                                </td>
                                                <td>
                                                  { ev
                                                    .eventData
                                                    ?.productInfos
                                                    ?.length >
                                                    0 ? (
                                                    <ul className="mb-0 pl-3">
                                                      { ev.eventData.productInfos.map(
                                                        (
                                                          prod,
                                                          pi2
                                                        ) => (
                                                          <li
                                                            key={
                                                              pi2
                                                            }
                                                          >
                                                            {
                                                              prod.productName
                                                            }{ " " }
                                                            —
                                                            ₹
                                                            {
                                                              prod.price
                                                            }{ " " }
                                                            (ID:{ " " }
                                                            {
                                                              prod.productId
                                                            }
                                                            )
                                                          </li>
                                                        )
                                                      ) }
                                                    </ul>
                                                  ) : (
                                                    "—"
                                                  ) }
                                                </td>
                                              </tr>
                                            )
                                          ) }
                                        </tbody>
                                      </table>
                                    </div>
                                  )
                                ) }
                              </div>
                            )
                          )
                        ) : (
                          <p>
                            No tracking data
                            available.
                          </p>
                        ) }
                      </div>
                      <div
                        className={ `tab-pane fade ${ activeTab === "profile"
                          ? "show active"
                          : ""
                          }` }
                      >
                        <div
                          className="accordion"
                          id="accordionExample"
                        >
                          {/* Item 1 */ }
                          <div className="card">
                            <div
                              className="card-header"
                              id="heading0"
                            >
                              <h2 className="mb-0">
                                <button
                                  className={ `btn btn-link btn-block text-left ${ activeIndex ===
                                    0
                                    ? ""
                                    : "collapsed"
                                    }` }
                                  onClick={ () =>
                                    toggle(
                                      0
                                    )
                                  }
                                  aria-expanded={
                                    activeIndex ===
                                    0
                                  }
                                  aria-controls="collapse0"
                                >
                                  Email
                                </button>
                              </h2>
                            </div>

                            <div
                              id="collapse0"
                              className={ `collapse ${ activeIndex ===
                                0
                                ? "show"
                                : ""
                                }` }
                              aria-labelledby="heading0"
                              data-parent="#accordionExample"
                            >
                              <div className="card-body">
                                <div className="  ">
                                  <table className="table table-bordered">
                                    <thead className="thead-light">
                                      <tr>
                                        <th>
                                          #
                                        </th>
                                        <th>
                                          Name
                                        </th>
                                        <th>
                                          Email
                                        </th>
                                        <th>
                                          Role
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      { [
                                        {
                                          id: 1,
                                          name: "Alice Smith",
                                          email: "alice@example.com",
                                          role: "Admin",
                                        },
                                        {
                                          id: 2,
                                          name: "Bob Johnson",
                                          email: "bob@example.com",
                                          role: "User",
                                        },
                                        {
                                          id: 3,
                                          name: "Carol Davis",
                                          email: "carol@example.com",
                                          role: "Editor",
                                        },
                                      ].map(
                                        (
                                          user,
                                          index
                                        ) => (
                                          <tr
                                            key={
                                              user.id
                                            }
                                          >
                                            <td>
                                              { index +
                                                1 }
                                            </td>
                                            <td>
                                              {
                                                user.name
                                              }
                                            </td>
                                            <td>
                                              {
                                                user.email
                                              }
                                            </td>
                                            <td>
                                              {
                                                user.role
                                              }
                                            </td>
                                          </tr>
                                        )
                                      ) }
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Item 2 */ }
                          <div className="card">
                            <div
                              className="card-header"
                              id="heading1"
                            >
                              <h2 className="mb-0">
                                <button
                                  className={ `btn btn-link btn-block text-left ${ activeIndex ===
                                    1
                                    ? ""
                                    : "collapsed"
                                    }` }
                                  onClick={ () =>
                                    toggle(
                                      1
                                    )
                                  }
                                  aria-expanded={
                                    activeIndex ===
                                    1
                                  }
                                  aria-controls="collapse1"
                                >
                                  Log{ " " }
                                  <small className="text-muted">
                                    2025-06-27
                                    09:12 AM
                                  </small>{ " " }
                                  <span className="badge badge-success">
                                    Success
                                  </span>
                                  <i className="fas fa-fw fa-tachometer-alt right_fas"></i>
                                </button>
                              </h2>
                            </div>

                            <div
                              id="collapse1"
                              className={ `collapse ${ activeIndex ===
                                1
                                ? "show"
                                : ""
                                }` }
                              aria-labelledby="heading1"
                              data-parent="#accordionExample"
                            >
                              <div className="card-body">
                                <div className="">
                                  <ul className="list-group">
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                      <div>
                                        <strong>
                                          Login
                                        </strong>{ " " }
                                        —
                                        Alice
                                        Smith
                                        <br />
                                        <small className="text-muted">
                                          2025-06-27
                                          09:12
                                          AM
                                        </small>
                                      </div>
                                      <span className="badge badge-success">
                                        Success
                                      </span>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                      <div>
                                        <strong>
                                          Profile
                                          Updated
                                        </strong>{ " " }
                                        —
                                        Bob
                                        Johnson
                                        <br />
                                        <small className="text-muted">
                                          2025-06-26
                                          05:40
                                          PM
                                        </small>
                                      </div>
                                      <span className="badge badge-primary">
                                        Updated
                                      </span>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                      <div>
                                        <strong>
                                          Password
                                          Changed
                                        </strong>{ " " }
                                        —
                                        Carol
                                        Davis
                                        <br />
                                        <small className="text-muted">
                                          2025-06-25
                                          03:28
                                          PM
                                        </small>
                                      </div>
                                      <span className="badge badge-warning">
                                        Security
                                      </span>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                      <div>
                                        <strong>
                                          Logout
                                        </strong>{ " " }
                                        —
                                        Alice
                                        Smith
                                        <br />
                                        <small className="text-muted">
                                          2025-06-25
                                          01:10
                                          PM
                                        </small>
                                      </div>
                                      <span className="badge badge-secondary">
                                        Info
                                      </span>
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Item 3 */ }
                          <div className="card">
                            <div
                              className="card-header"
                              id="heading2"
                            >
                              <h2 className="mb-0">
                                <button
                                  className={ `btn btn-link btn-block text-left ${ activeIndex ===
                                    2
                                    ? ""
                                    : "collapsed"
                                    }` }
                                  onClick={ () =>
                                    toggle(
                                      2
                                    )
                                  }
                                  aria-expanded={
                                    activeIndex ===
                                    2
                                  }
                                  aria-controls="collapse2"
                                >
                                  Accordion
                                  Item #3
                                </button>
                              </h2>
                            </div>

                            <div
                              id="collapse2"
                              className={ `collapse ${ activeIndex ===
                                2
                                ? "show"
                                : ""
                                }` }
                              aria-labelledby="heading2"
                              data-parent="#accordionExample"
                            >
                              <div className="card-body">
                                This is the
                                content for item
                                3.
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        className={ `tab-pane fade ${ activeTab === "list"
                          ? "show active"
                          : ""
                          }` }
                      >
                        <div className="activity-log-container">
                          <div className="timeline">
                            <div className="timeline-item">
                              <div className="timeline-dot success"></div>
                              <div className="timeline-content">
                                <h6>Login</h6>
                                <p>
                                  Alice Smith
                                  logged in
                                </p>
                                <span className="timestamp">
                                  2025-06-27
                                  09:12 AM
                                </span>
                              </div>
                            </div>

                            <div className="timeline-item">
                              <div className="timeline-dot info"></div>
                              <div className="timeline-content">
                                <h6>
                                  Profile
                                  Updated
                                </h6>
                                <p>
                                  Bob Johnson
                                  changed
                                  email
                                  address
                                </p>
                                <span className="timestamp">
                                  2025-06-26
                                  05:40 PM
                                </span>
                              </div>
                            </div>

                            <div className="timeline-item">
                              <div className="timeline-dot warning"></div>
                              <div className="timeline-content">
                                <h6>
                                  Password
                                  Changed
                                </h6>
                                <p>
                                  Carol Davis
                                  updated
                                  password
                                </p>
                                <span className="timestamp">
                                  2025-06-25
                                  03:28 PM
                                </span>
                              </div>
                            </div>

                            <div className="timeline-item">
                              <div className="timeline-dot gray"></div>
                              <div className="timeline-content">
                                <h6>Logout</h6>
                                <p>
                                  Alice Smith
                                  logged out
                                </p>
                                <span className="timestamp">
                                  2025-06-25
                                  01:10 PM
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        className={ `tab-pane fade ${ activeTab === "objects"
                          ? "show active"
                          : ""
                          }` }
                      >
                        <h4>objects Profile Content</h4>
                        <p>
                          This is the content for the
                          Profile tab.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

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
                        <div className="timeline-item">
                          <div className="timeline-dot success"></div>
                          <div className="timeline-content">
                            <h6>Login</h6>
                            <p>
                              Alice Smith logged
                              in
                            </p>
                            <span className="timestamp">
                              2025-06-27 09:12 AM
                            </span>
                          </div>
                        </div>

                        <div className="timeline-item">
                          <div className="timeline-dot info"></div>
                          <div className="timeline-content">
                            <h6>Profile Updated</h6>
                            <p>
                              Bob Johnson changed
                              email address
                            </p>
                            <span className="timestamp">
                              2025-06-26 05:40 PM
                            </span>
                          </div>
                        </div>

                        <div className="timeline-item">
                          <div className="timeline-dot warning"></div>
                          <div className="timeline-content">
                            <h6>
                              Password Changed
                            </h6>
                            <p>
                              Carol Davis updated
                              password
                            </p>
                            <span className="timestamp">
                              2025-06-25 03:28 PM
                            </span>
                          </div>
                        </div>

                        <div className="timeline-item">
                          <div className="timeline-dot gray"></div>
                          <div className="timeline-content">
                            <h6>Logout</h6>
                            <p>
                              Alice Smith logged
                              out
                            </p>
                            <span className="timestamp">
                              2025-06-25 01:10 PM
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* /.container-fluid */ }
        </div>
        {/* End of Main Content */ }
        {/* Footer */ }
      </div>
    </div>
  );
};

export default EventData;
