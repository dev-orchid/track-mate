// src/components/Layout/Sidebar.tsx
import React from 'react';
import Link from 'next/link';

const Sidebar: React.FC = () => {
  return (

    <>

      <ul className="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar">


        {/* Brand */}
        <a className="sidebar-brand d-flex  " href="/">

          <div className="sidebar-brand-text  ">Track Mate </div>
        </a>

        <hr className="sidebar-divider my-0" />

        {/* Dashboard */}
        <li className="nav-item active ">
          <Link className="nav-link" href="/">
            <i className="fas fa-fw fa-folder"></i>
            <span>Dashboard</span>
          </Link>
        </li>


        <hr className="sidebar-divider my-0" />

        <li className="nav-item  ">
          <Link className="nav-link" href="/profile">
            <i className="fas fa-fw fa-tachometer-alt"></i>
            <span>Profile</span>
          </Link>
        </li>

        <hr className="sidebar-divider my-0" />

        <li className="nav-item  ">
          <Link className="nav-link" href="/reports">
            <i className="fas fa-fw fa-chart-area"></i>
            <span>Reports</span>
          </Link>
        </li>

        <hr className="sidebar-divider my-0" />

        <li className="nav-item  ">
          <Link className="nav-link" href="/settings">
            <i className="fas fa-fw fa-cog"></i>
            <span>Settings</span>
          </Link>
        </li>


      </ul>

    </>

  );
};

export default Sidebar;
