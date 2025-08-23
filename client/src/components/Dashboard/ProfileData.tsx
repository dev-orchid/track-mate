import React, { useState, useMemo } from "react";
import Link from "next/link";

interface Profile {
  _id:string;
  name: string;
  email: string;
  lastActive: string;
  phone: string | number;
}

interface EventDataProps {
  profileData: Profile[];
}

const EventData: React.FC<EventDataProps> = ({ profileData }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  // Filter profiles by searchTerm
  const filteredProfiles = useMemo(() => {
    if (!searchTerm) return profileData;
    const lower = searchTerm.toLowerCase();
    return profileData.filter((p) =>
      [p.name, p.email, String(p.phone)]
        .some((field) => field.toLowerCase().includes(lower))
    );
  }, [profileData, searchTerm]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredProfiles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProfiles = filteredProfiles.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Counts (unchanged)
  const { totalProfiles, emailActiveCount, emailSuppressedCount } =
    useMemo(() => {
      const total = profileData.length;
      let active = 0;
      let suppressed = 0;
      profileData.forEach((p) => {
        if (p.email) {
          const isSuppressed = false;
          isSuppressed ? suppressed++ : active++;
        }
      });
      return {
        totalProfiles: total,
        emailActiveCount: active,
        emailSuppressedCount: suppressed,
      };
    }, [profileData]);

  return (
    <div className="d-flex flex-column w-100" id="content-wrapper">
      <div id="content">
        <div className="container-fluid">
          <h1 className="h3 mb-4 text-gray-800">Profiles</h1>
          <div className="card shadow mb-4">
            {/* Counts & Search */}
            <div className="card-body px-3">
              <div className="row mb-3">
                <div className="col-lg-3">
                 <p className="text-uppercase font-weight-bold mb-2">Total Profiles</p>
                  <div className="d-flex align-items-center">
                    <h2 className="mb-0 mr-2">{totalProfiles}</h2>
                    <span className="mr-1">All Profiles</span>
                    <i className="fas fa-info-circle text-secondary" title="All Profiles" />
                  </div>
                </div>
                <div className="col-lg-9">
                  <p className="text-uppercase font-weight-bold mb-2">Email Profile Counts</p>

                  <div className="d-flex align-items-center mb-2">
                    <h2 className="mb-0 mr-2">{emailActiveCount}</h2>
                    <span className="mr-1">Active Profiles</span>
                    <i className="fas fa-info-circle text-secondary" title="Active Profiles" />
                  </div>

                  <div className="d-flex align-items-center">
                    <h2 className="mb-0 mr-2">{emailSuppressedCount}</h2>
                    <span className="mr-1">Suppressed Profiles</span>
                    <i className="fas fa-info-circle text-secondary" title="Suppressed Profiles" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="card shadow mb-4">
            <div className="card-body px-3">
             <p className="mb-4 text-dark">Explore Profiles</p>
             <span>Search for someone</span>
             <div className="row mb-2">
                <div className="col-lg-6">
                <input
                  type="text"
                  className="form-control"
                  placeholder="by name, email or phone…"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // reset to first page on new search
                  }}
                />
              </div>
             </div>
              
            </div>

            {/* Table */}
            <div className="card-body p-0">
              <table className="table table-bordered mb-0">
                <thead className="thead-light">
                  <tr>
                    <th>#</th>
                    <th>Profile</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Updated At</th>
                  </tr>
                </thead>
                <tbody>
                  {currentProfiles.length > 0 ? (
                    currentProfiles.map((p, idx) => (
                      <tr key={startIndex + idx}>
                        <td>{startIndex + idx + 1}</td>
                        <td>
                          <Link href={`/profiles/${p._id}`} className="text-primary">
                          {p.email}
                          </Link>
                        </td>
                        
                        <td>{p.email}</td>
                        <td>{p.phone}</td>
                        <td>{p.lastActive}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center text-muted">
                        No profiles match “{searchTerm}”
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="card-body">
              <nav>
                <ul className="pagination justify-content-center mb-0">
                  <li
                    className={`page-item ${
                      currentPage === 1 ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() =>
                        setCurrentPage((p) => Math.max(p - 1, 1))
                      }
                    >
                      Previous
                    </button>
                  </li>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <li
                        key={page}
                        className={`page-item ${
                          currentPage === page ? "active" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      </li>
                    )
                  )}

                  <li
                    className={`page-item ${
                      currentPage === totalPages ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() =>
                        setCurrentPage((p) =>
                          Math.min(p + 1, totalPages)
                        )
                      }
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventData;