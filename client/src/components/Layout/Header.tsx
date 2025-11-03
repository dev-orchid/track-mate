// src/components/Layout/Header.tsx
import React, { useState, useRef, useEffect } from "react";
import { useLogout } from "@/src/utils/logout";
import { useRouter } from "next/router";
import Link from "next/link";
import useAccountDetails from "@/src/hooks/useAccountDetails";
import useNotifications from "@/src/hooks/useNotifications";

const Header: React.FC = () => {
	const router = useRouter();
	// 1) Hook goes _inside_ the component
	const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
	const [notifDropdownOpen, setNotifDropdownOpen] = useState<boolean>(false);

	// 2) Ref for the dropdown containers
	const userDropdownRef = useRef<HTMLLIElement>(null);
	const notifDropdownRef = useRef<HTMLDivElement>(null);

	// 3) Get current user details
	const { accountDetails } = useAccountDetails();

	// 4) Get notifications
	const { newProfiles, unreadCount, markAsRead } = useNotifications();

	const toggleDropdown = (e: React.MouseEvent) => {
		e.preventDefault();
		setDropdownOpen((open) => !open);
	};

	const toggleNotifDropdown = (e: React.MouseEvent) => {
		e.preventDefault();
		setNotifDropdownOpen((open) => !open);
	};

	const handleNotificationClick = () => {
		setNotifDropdownOpen(false);
		markAsRead();
	};

	// 3) Close if clicked outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			// Close user dropdown if clicked outside
			if (
				userDropdownRef.current &&
				!userDropdownRef.current.contains(event.target as Node)
			) {
				setDropdownOpen(false);
			}
			// Close notification dropdown if clicked outside
			if (
				notifDropdownRef.current &&
				!notifDropdownRef.current.contains(event.target as Node)
			) {
				setNotifDropdownOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
  }, []);

  // #4. logout function
  const logout = useLogout();

  return (
    <nav className="modern-header">
      <div className="header-icons">
        {/* Notifications */}
        <div
					className="header-icon-wrapper notifications-wrapper"
					ref={notifDropdownRef}
				>
          <button
						className="notification-button"
						onClick={toggleNotifDropdown}
						aria-label="Notifications"
					>
						<i className="fas fa-bell"></i>
						{unreadCount > 0 && (
							<span className="icon-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
						)}
					</button>

					{/* Notification Dropdown */}
					{notifDropdownOpen && (
						<div className="notification-dropdown">
							<div className="notification-header">
								<h4>
									<i className="fas fa-bell"></i>
									New Profiles
								</h4>
								{unreadCount > 0 && (
									<button
										className="mark-read-btn"
										onClick={markAsRead}
									>
										Mark all as read
									</button>
								)}
							</div>
							<div className="notification-body">
								{newProfiles.length === 0 ? (
									<div className="notification-empty">
										<i className="fas fa-inbox"></i>
										<p>No new profiles</p>
									</div>
								) : (
									newProfiles.map((profile) => (
										<Link
											key={profile._id}
											href={`/profiles/${profile._id}`}
											className="notification-item"
											onClick={handleNotificationClick}
										>
											<div className="notification-icon">
												<i className="fas fa-user-plus"></i>
											</div>
											<div className="notification-content">
												<div className="notification-title">{profile.name}</div>
												<div className="notification-email">{profile.email}</div>
												<div className="notification-time">
													{new Date(profile.createdAt).toLocaleString()}
												</div>
											</div>
										</Link>
									))
								)}
							</div>
							{newProfiles.length > 0 && (
								<div className="notification-footer">
									<Link href="/profile" onClick={handleNotificationClick}>
										View all profiles
									</Link>
								</div>
							)}
						</div>
					)}
        </div>

        {/* Tasks/Alerts - Placeholder */}
        <div className="header-icon-wrapper">
          <i className="fas fa-flag"></i>
        </div>

        {/* Messages - Placeholder */}
        <div className="header-icon-wrapper">
          <i className="fas fa-envelope"></i>
        </div>

        {/* User Profile Dropdown */}
        <div className="header-divider"></div>

        <li
          ref={userDropdownRef}
          className={`header-user-dropdown ${dropdownOpen ? "show" : ""}`}
        >
          <a
            className="user-dropdown-toggle"
            href="#"
            onClick={toggleDropdown}
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
          >
            <span className="user-name">{accountDetails?.firstName || 'Orchid Team'}</span>
            <div className="user-avatar">
              <i className="fas fa-user"></i>
            </div>
            <i className="fas fa-chevron-down dropdown-arrow"></i>
          </a>

          <div
            className={`modern-dropdown-menu ${dropdownOpen ? "show" : ""}`}
            aria-labelledby="userDropdown"
          >
            <Link className="dropdown-item" href="#">
              <i className="fas fa-user fa-sm fa-fw mr-2"></i>
              Profile
            </Link>

            <Link className="dropdown-item" href="/settings/account/personal">
              <i className="fas fa-cogs fa-sm fa-fw mr-2"></i>
              Settings
            </Link>
            <Link className="dropdown-item" href="#">
              <i className="fas fa-list fa-sm fa-fw mr-2"></i>
              Activity Log
            </Link>
            <div className="dropdown-divider"></div>
            <button
              type="button"
              className="dropdown-item"
              onClick={logout}
            >
              <i className="fas fa-sign-out-alt fa-sm fa-fw mr-2"></i>
              Logout
            </button>
          </div>
        </li>
      </div>
    </nav>
  );
};

export default Header;
