import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import CourseActionsProvider from './context/CourseActionsContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Loader from './components/Loader';

// Import critical styling only
import './main.css';

// Load homepage components with separate chunks
const Hero = lazy(() => import('./components/Hero'));
const About = lazy(() => import('./components/About'));
const Categories = lazy(() => import('./components/Categories'));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));

// Lazy load components that aren't needed for initial render
const Courses = lazy(() => import('./pages/Courses'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const SavedCourses = lazy(() => import('./pages/SavedCourses'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Chat = lazy(() => import('./pages/Chat'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const Announcements = lazy(() => import('./pages/Announcements'));
const Profile = lazy(() => import('./pages/Profile'));
const AdminAnnouncements = lazy(() => import('./pages/AdminAnnouncements'));
const AdminDocuments = lazy(() => import('./pages/AdminDocuments'));
const AdminProtectedRoute = lazy(() => import('./components/AdminProtectedRoute'));

export default function App() {
  // Add smooth scroll behavior when navigating to sections
  useEffect(() => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
          behavior: 'smooth'
        });
      });
    });
  }, []);

  // Error boundary component to prevent entire app crash on lazy load failures
  const ErrorFallback = ({ error }) => (
    <div className="error-boundary">
      <h2>Something went wrong.</h2>
      <p>{error.message}</p>
      <button onClick={() => window.location.reload()}>Try again</button>
    </div>
  );

  class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }
    
    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }
    
    render() {
      if (this.state.hasError) {
        return <ErrorFallback error={this.state.error} />;
      }
      return this.props.children;
    }
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <CourseActionsProvider>
            <div className="page-wrapper">
              <Navbar />
              <div className="content-container">
                <Routes>
                  <Route path="/" element={
                    <main className="home-page">
                      <Suspense fallback={<div className="section-loader"><Loader /></div>}>
                        <Hero />
                      </Suspense>
                      <Suspense fallback={<div className="section-loader"><Loader /></div>}>
                        <About />
                      </Suspense>
                      <Suspense fallback={<div className="section-loader"><Loader /></div>}>
                        <Categories />
                      </Suspense>
                    </main>
                  } />
                  <Route path="/announcements" element={<Announcements />} />

                  {/* User-protected */}
                  <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
                  <Route path="/saved-courses" element={<ProtectedRoute><SavedCourses /></ProtectedRoute>} />

                  <Route path="/profile" element={<Profile />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />

                  {/* Admin */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route
                    path="/admin/dashboard"
                    element={
                      <AdminProtectedRoute>
                        <AdminDashboard />
                      </AdminProtectedRoute>
                    } />
                  <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                  <Route path="/admin/documents" element={
                    <ProtectedRoute>
                      <AdminDocuments />
                    </ProtectedRoute>
                  } />

                  <Route path="/admin/users" element={
                    <ProtectedRoute requireAdmin>
                      <AdminUsers />
                    </ProtectedRoute>
                  } />

                  <Route
                    path="/admin/announcements"
                    element={
                      <AdminProtectedRoute>
                        <AdminAnnouncements />
                      </AdminProtectedRoute>
                    }
                  />
                </Routes>
              </div>
              <Suspense fallback={<Loader />}>
                <Footer />
              </Suspense>
            </div>
          </CourseActionsProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
