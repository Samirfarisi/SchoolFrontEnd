// // src/pages/Announcements.jsx
// import React, { useState, useEffect } from 'react';
// import api from '../api/axios';
// import '../styles/announcement.scss';

// export default function Announcements() {
//     const [anns, setAnns] = useState([]);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         api.get('/announcements')
//             .then(res => setAnns(res.data))
//             .catch(console.error)
//             .finally(() => setLoading(false));
//     }, []);

//     if (loading) return <p>Loading announcements…</p>;
//     if (!anns.length) return <p>No announcements for now.</p>;

//     return (
//         <div className="announcements-page">
//             <div className="announcements-grid">
//                 {anns.map(a => {
//                     console.log('announcement raw:', a); // ← inspectez ici

//                     // Remplacez 'file_path' par la propriété exacte de votre API
//                     const rawPath = a.file_path || a.image_path || a.thumbnail_path || '';
//                     const imgUrl = rawPath
//                         ? `http://127.0.0.1:8000/storage/${rawPath.replace(/^\/?storage\//, '')}`
//                         : '';

//                     return (
//                         <div key={a.id} className="announcement-card">
//                             {/* Affichez toujours l'élément <img> pour voir l'alt */}
//                             <img
//                                 src={imgUrl}
//                                 alt={a.title || 'Annonce'}
//                                 className="announcement-img"
//                                 style={{ display: imgUrl ? 'block' : 'none' }}
//                                 onError={e => {
//                                     e.currentTarget.style.display = 'none';
//                                     console.warn(`Image introuvable : ${imgUrl}`);
//                                 }}
//                             />

//                             {/* Si imgUrl est vide, affichez au moins l'alt en texte */}
//                             {!imgUrl && (
//                                 <div className="announcement-noimg">
//                                     {/* Affichez ici l’équivalent texte de l’alt */}
//                                     {a.title}
//                                 </div>
//                             )}

//                             <div className="announcement-body">
//                                 <h3>{a.title}</h3>
//                                 <p>{a.description}</p>
//                             </div>
//                         </div>
//                     );
//                 })}
//             </div>
//         </div>
//     );
// }

import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import './announcements.css';

import Loader from '../components/Loader';

export default function Announcements() {
    const [announcements, setAnnouncements] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    // Filter removed as requested
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        api.get('/announcements')
            .then(res => {
                setAnnouncements(res.data);
                setLoading(false);
            })
            .catch(err => {
                setError('Failed to load announcements.');
                setLoading(false);
            });
    }, []);

    // Search announcements
    const filteredAnnouncements = announcements.filter(announcement => {
        // Only filter by search term since filter has been removed
        return searchTerm === '' || 
            announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            announcement.description.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (loading) {
        return <Loader />;
    }

    if (error) {
        return <p className="error">{error}</p>;
    }

    return (
        <div className="announcements-page">
            <h1>School Announcements</h1>
            
            <div className="filter-container">
                <input
                    type="text"
                    placeholder="Search announcements..."
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            {filteredAnnouncements.length === 0 ? (
                <div className="empty-state">
                    <img src="/src/assets/empty-announcements.svg" alt="No announcements" />
                    <h2>No announcements found</h2>
                    <p>There are no announcements matching your criteria at the moment.</p>
                </div>
            ) : (
                <div className="announcements-list">
                    {filteredAnnouncements.map((a, index) => {
                        const isNew = new Date(a.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                        const announcementType = a.type || 'general';
                        
                        return (
                            <div 
                                className={`announcement-card ${announcementType}`} 
                                key={a.id}
                                style={{'--i': index % 9 + 1}}
                            >
                                {isNew && <span className="new-badge">New</span>}
                                
                                <div className="announcement-body">
                                    <div className="announcement-date">
                                        <ion-icon name="calendar-outline"></ion-icon>
                                        {new Date(a.created_at).toLocaleDateString(undefined, {
                                            year: 'numeric', month: 'long', day: 'numeric'
                                        })}
                                    </div>
                                    
                                    <h2 className="announcement-title">{a.title}</h2>
                                    <p className="announcement-content">{a.description}</p>
                                    
                                    <div className="announcement-tags">
                                        <span className={`tag ${announcementType}`}>
                                            {announcementType.charAt(0).toUpperCase() + announcementType.slice(1)}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="announcement-footer">
                                    <div className="author">
                                        <div className="author-avatar">
                                            <ion-icon name="person-outline"></ion-icon>
                                        </div>
                                        <span className="author-name">Admin</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
