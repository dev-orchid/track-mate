// src/components/Layout/Header.tsx
import React, { useState, useRef, useEffect } from "react";

const Header: React.FC = () => {
  // 1) Hook goes _inside_ the component
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  // 2) Ref for the dropdown container
  const containerRef = useRef<HTMLLIElement>(null);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    setDropdownOpen((open) => !open);
  };

  // 3) Close if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // if click target isn't inside our ref, close
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
      <ul className="navbar-nav ml-auto">
        {/* Attach ref here */}
        <li
          ref={containerRef}
          className={`nav-item dropdown no-arrow ${dropdownOpen ? "show" : ""}`}
        >
          <a
            className="nav-link dropdown-toggle"
            href="#"
            id="userDropdown"
            role="button"
            onClick={toggleDropdown}
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
          >
            <span className="mr-2 d-none d-lg-inline text-gray-600 small">
              Admin
            </span>
          </a>

          <div
            className={`dropdown-menu dropdown-menu-right shadow animated--grow-in ${
              dropdownOpen ? "show" : ""
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
            <a
              className="dropdown-item"
              href="#"
              data-toggle="modal"
              data-target="#logoutModal"
            >
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
