import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/admin.css';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div className={`admin-layout ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <img src="/src/assets/logo.png" alt="School Logo" className="admin-logo" />
            <h2 className="sidebar-title">School Admin</h2>
          </div>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <ion-icon name={sidebarOpen ? 'chevron-back-outline' : 'chevron-forward-outline'}></ion-icon>
          </button>
        </div>

        <div className="admin-user-info">
          <div className="admin-avatar">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="Profile" />
            ) : (
              <div className="avatar-placeholder">
                {user?.first_name?.[0] || user?.name?.[0] || 'A'}
              </div>
            )}
          </div>
          <div className="admin-user-details">
            <h3>{user?.first_name || user?.name || 'Admin'}</h3>
            <p>Administrator</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li className={isActive('/admin')}>
              <Link to="/admin">
                <ion-icon name="grid-outline"></ion-icon>
                <span>Dashboard</span>
              </Link>
            </li>
            <li className={isActive('/admin/courses')}>
              <Link to="/admin/courses">
                <ion-icon name="book-outline"></ion-icon>
                <span>Courses</span>
              </Link>
            </li>
            <li className={isActive('/admin/add-course')}>
              <Link to="/admin/add-course">
                <ion-icon name="add-circle-outline"></ion-icon>
                <span>Add New Course</span>
              </Link>
            </li>
            <li className={isActive('/admin/announcements')}>
              <Link to="/admin/announcements">
                <ion-icon name="megaphone-outline"></ion-icon>
                <span>Announcements</span>
              </Link>
            </li>
            <li className={isActive('/admin/chat')}>
              <Link to="/admin/chat">
                <ion-icon name="chatbubbles-outline"></ion-icon>
                <span>Chat</span>
                <div className="notification-badge">3</div>
              </Link>
            </li>
            <li className={isActive('/admin/users')}>
              <Link to="/admin/users">
                <ion-icon name="people-outline"></ion-icon>
                <span>User Accounts</span>
              </Link>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-button" onClick={handleLogout}>
            <ion-icon name="log-out-outline"></ion-icon>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        <header className="admin-header">
          <div className="header-content">
            <div className="page-title">
              <h1>
                {location.pathname === '/admin' && 'Dashboard'}
                {location.pathname === '/admin/courses' && 'Manage Courses'}
                {location.pathname === '/admin/add-course' && 'Add New Course'}
                {location.pathname === '/admin/announcements' && 'Announcements'}
                {location.pathname === '/admin/chat' && 'Admin Chat'}
                {location.pathname === '/admin/users' && 'User Accounts'}
              </h1>
            </div>
            <div className="header-actions">
              <div className="search-container">
                <input type="text" placeholder="Search..." className="search-input" />
                <ion-icon name="search-outline" className="search-icon"></ion-icon>
              </div>
              <button className="notification-btn">
                <ion-icon name="notifications-outline"></ion-icon>
                <span className="notification-indicator"></span>
              </button>
              <button className="settings-btn">
                <ion-icon name="settings-outline"></ion-icon>
              </button>
            </div>
          </div>
        </header>

        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
