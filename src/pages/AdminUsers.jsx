import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Loader from '../components/Loader';
import '../styles/adminusers.scss';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/admin/users')
            .then(res => setUsers(res.data))
            .catch(err => setError(err.response?.data?.message || err.message))
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            setUsers(u => u.filter(x => x.id !== id));
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    };

    if (loading) return <Loader />;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="admin-users">
            <h2>User Accounts</h2>
            <ul>
                {users.map(u => (
                    <li key={u.id}>
                        <span>{u.first_name || u.email}</span>
                        <button onClick={() => handleDelete(u.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}