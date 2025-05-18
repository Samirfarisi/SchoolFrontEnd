import React, { useState, useEffect, useCallback, memo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/navbarstyle.scss';
// Import lazily loaded image
import logo from '../assets/Lycée de Ezzauada logo.png';

function Navbar() {
    const { user, admin, logout, logoutAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location.pathname]);

    // Add scrolled class to navbar on scroll with debounce for better performance
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 30);
        };

        // Debounce scroll event handler to prevent performance issues
        let timeoutId;
        const debouncedHandleScroll = () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(handleScroll, 10); // 10ms debounce
        };

        window.addEventListener('scroll', debouncedHandleScroll, { passive: true });
        return () => window.removeEventListener('scroll', debouncedHandleScroll);
    }, []);

    // Memoize handleLogout function to prevent unnecessary rerenders
    const handleLogout = useCallback(async () => {
        if (admin) {
            await logoutAdmin();
            navigate('/admin/login');
        } else {
            await logout();
            navigate('/login');
        }
    }, [admin, logoutAdmin, logout, navigate]);
    
    // Toggle mobile menu (memoized)
    const toggleMenu = useCallback(() => {
        setIsMenuOpen(prevState => !prevState);
    }, []);

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''} ${isMenuOpen ? 'menu-open' : ''}`}>
            <div className="navbar-container">
                <div className="navbar-logo">
                    <Link to="/">
                        <img 
                            src={logo} 
                            width="162" 
                            height="50" 
                            alt="Lycée de Ezzauada" 
                            loading="eager" 
                            fetchPriority="high" 
                        />
                    </Link>
                </div>
                
                <button className="mobile-menu-toggle" onClick={toggleMenu} aria-label="Toggle menu">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
                
                <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
                    <div className="navbar-left">
                        <Link to="/">Home</Link>
                        {user && <Link to="/courses">Courses</Link>}
                        {user && <Link to="/saved-courses">Saved</Link>}
                        {admin && <Link to="/admin/dashboard">Dashboard</Link>}
                        {/* {admin && <Link to="/admin/announcements">Annonces</Link>} */}
                        {user && <Link to="/chat">Chat</Link>}
                        {user && <Link to="/announcements">Annonces</Link>}
                        {user && <Link to="/profile">Profile</Link>}
                    </div>
                    <div className="navbar-right">
                        {user || admin ? (
                            <>
                                <span className="user-greeting">Hi, {admin ? admin.email : user.first_name || user.name}</span>
                                <button className="logout-btn" onClick={handleLogout}>Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="login-link">Login</Link>
                                <Link to="/signup" className="signup-link">Sign Up</Link>
                                <Link to="/admin/login" className="admin-link">Admin</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Overlay for mobile menu */}
            
            {isMenuOpen && <div className="menu-overlay" onClick={toggleMenu}></div>}
        </nav>
    );
}

// Memoize the entire Navbar component to avoid unnecessary re-renders
export default memo(Navbar);