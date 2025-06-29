// src/components/Layout/Header.tsx
import React from 'react';
import { useState } from 'react';

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

const Header: React.FC<profileDataProps> = ({ profileData }) => {
  console.log('Tracking Data in EventData:', profileData); // Debug log


  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = (e) => {
    e.preventDefault();
    setDropdownOpen(!dropdownOpen);
  };

  const [activeTab, setActiveTab] = useState('home');


  const [activeIndex, setActiveIndex] = useState(null);

  const toggle = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    
    
          <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
            {/* Sidebar Toggle (Topbar) */}


            {/* Topbar Navbar */}
            <ul className="navbar-nav ml-auto">
              {/* Nav Item - Search Dropdown (Visible Only XS) */}


              {/* Nav Item - User Info */}


              <li className={`nav-item dropdown no-arrow ${dropdownOpen ? 'show' : ''}`}>
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  id="userDropdown"
                  role="button"
                  onClick={toggleDropdown}
                  aria-haspopup="true"
                  aria-expanded={dropdownOpen}
                >
                  <span className="mr-2 d-none d-lg-inline text-gray-600 small">Admin</span>
                </a>

                <div
                  className={`dropdown-menu dropdown-menu-right shadow animated--grow-in ${dropdownOpen ? 'show' : ''
                    }`}
                  aria-labelledby="userDropdown"
                >
                  <a className="dropdown-item" href="#">
                    <i className="fas fa-user fa-sm fa-fw mr-2 text-gray-400"></i>
                    Profile
                  </a>
                  <a className="dropdown-item" href="#">
                    <i className="fas fa-cogs fa-sm fa-fw mr-2 text-gray-400"></i>
                    Settings
                  </a>
                  <a className="dropdown-item" href="#">
                    <i className="fas fa-list fa-sm fa-fw mr-2 text-gray-400"></i>
                    Activity Log
                  </a>
                  <div className="dropdown-divider"></div>
                  <a className="dropdown-item" href="#" data-toggle="modal" data-target="#logoutModal">
                    <i className="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400"></i>
                    Logout
                  </a>
                </div>
              </li>





            </ul>
          </nav>

          
  );
};

export default Header;
