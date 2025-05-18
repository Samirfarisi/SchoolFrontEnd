import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false }) {
    const { user, admin, loading } = useAuth();

    if (loading) return null;

    
    if (adminOnly) {
        if (!admin) return <Navigate to="/admin/login" />;
    }
   
    else {
        if (!user) return <Navigate to="/login" />;
    }

    return children;
}