// // src/pages/AdminDashboard.jsx
// import React, { useState, useEffect } from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import api from '../api/axios';
// import AdminChat from '../components/AdminChat';
// import AdminUsers from './AdminUsers';
// import '../styles/admindashboard.scss';

// export default function AdminDashboard() {
//     const { pathname } = useLocation();
//     const isAnnouncementsTab = pathname.includes('/admin/announcements');

//     const [title, setTitle] = useState('');
//     const [description, setDescription] = useState('');
//     const [videoUrl, setVideoUrl] = useState('');
//     const [categoryId, setCategoryId] = useState('');
//     const [categories, setCategories] = useState([]);
//     const [loadingCats, setLoadingCats] = useState(true);
//     const [saving, setSaving] = useState(false);
//     const [feedback, setFeedback] = useState({ type: '', message: '' });

//     useEffect(() => {
//         async function fetchCategories() {
//             try {
//                 const res = await api.get('/categories');
//                 setCategories(res.data);
//             } catch (err) {
//                 console.error('Failed to load categories', err);
//                 setFeedback({ type: 'error', message: 'Could not load categories.' });
//             } finally {
//                 setLoadingCats(false);
//             }
//         }
//         if (!isAnnouncementsTab) {
//             fetchCategories();
//         }
//     }, [isAnnouncementsTab]);

//     const handleAddCourse = async () => {
//         setFeedback({ type: '', message: '' });
//         setSaving(true);
//         try {
//             await api.post('/admin/courses', {
//                 title,
//                 description,
//                 video_url: videoUrl,
//                 category_id: categoryId || null,
//             });
//             setFeedback({ type: 'success', message: 'Course added successfully!' });
//             setTitle(''); setDescription(''); setVideoUrl(''); setCategoryId('');
//         } catch (err) {
//             console.error(err);
//             const msg = err.response?.data?.message || 'Error adding course.';
//             setFeedback({ type: 'error', message: msg });
//         } finally {
//             setSaving(false);
//         }
//     };

//     return (
//         <div className="admin-dashboard">
//             {/* ─── Secondary Nav ─── */}
//             <nav className="admin-subnav">
//                 <Link
//                     to="/admin/dashboard"
//                     className={!isAnnouncementsTab ? 'active' : ''}
//                 >
//                     Cours
//                 </Link>
//                 <Link to="/admin/announcements" className={isAnnouncementsTab ? 'active' : ''}>
//                     Annonces
//                 </Link>
//             </nav>

//             {/* ─── Courses Tab ─── */}
//             {!isAnnouncementsTab ? (
//                 <>
//                     <div className="add-course">
                       
//                     </div>

//                     <div className="main-panel">
//                         <div className="chat-container">
//                             <AdminChat />
//                         </div>
//                     </div>
//                     <hr />
//                     <AdminUsers />
//                 </>
//             ) : (
//                 /* ─── Announcements Tab Placeholder ─── */
//                 <div className="admin-announcements">
//                     {/* TODO: créer et afficher <AdminAnnouncements /> ici */}
//                     <p>Gestion des annonces (bientôt disponible)</p>
//                 </div>
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import api from '../api/axios';
import AdminChat from '../components/AdminChat';
import AdminUsers from './AdminUsers';
import AdminAnnouncements from './AdminAnnouncements';
import AdminDashboardHome from '../components/AdminDashboardHome';
import '../styles/admindashboard.scss';
import '../styles/admin.css';
import '../styles/admin-dashboard-home.scss';
import AddCourseForm from '../components/AddCourseForm';

export default function AdminDashboard() {
    // Tab state for navigation
    const [tab, setTab] = useState('dashboard');
    
    // Set active tab on initial load
    useEffect(() => {
        const path = window.location.pathname;
        if (path.includes('chat')) setTab('chat');
        else if (path.includes('announcements')) setTab('announcements');
        else if (path.includes('users')) setTab('users');
        else if (path.includes('courses')) setTab('courses');
        else setTab('dashboard');
    }, []);

    return (
        <div className="admin-dashboard">
            <aside className="sidebar">
                <h3>Admin Panel</h3>
                <nav>
                    <button
                        className={tab === 'dashboard' ? 'active' : ''}
                        onClick={() => setTab('dashboard')}
                    >Dashboard</button>
                    <button
                        className={tab === 'courses' ? 'active' : ''}
                        onClick={() => setTab('courses')}
                    >Add New Course</button>
                    <button
                        className={tab === 'announcements' ? 'active' : ''}
                        onClick={() => setTab('announcements')}
                    >Announcements</button>
                    <button
                        className={tab === 'chat' ? 'active' : ''}
                        onClick={() => setTab('chat')}
                    >Chat</button>
                    <button
                        className={tab === 'users' ? 'active' : ''}
                        onClick={() => setTab('users')}
                    >User Accounts</button>
                </nav>
            </aside>

            <div className="content">
                {tab === 'dashboard' && (
                    <AdminDashboardHome />
                )}
                
                {tab === 'courses' && (
                    <div className="add-course">
                        <h3>Add New Course</h3>
                        <div className="panel-content">
                            <AddCourseForm />
                        </div>
                    </div>
                )}

                {tab === 'announcements' && (
                    <div className="announcements-panel">
                        <h3>Announcements</h3>
                        <div className="panel-content">
                            <AdminAnnouncements />
                        </div>
                    </div>
                )}

                {tab === 'chat' && (
                    <div className="chat-panel">
                        <h3>Chat with Users</h3>
                        <div className="panel-content">
                            <AdminChat />
                        </div>
                    </div>
                )}

                {tab === 'users' && (
                    <div className="users-panel">
                        <h3>User Accounts</h3>
                        <div className="panel-content">
                            <AdminUsers />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}