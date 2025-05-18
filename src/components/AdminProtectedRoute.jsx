import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminProtectedRoute({ children }) {
    const { admin, loading } = useAuth();
    if (loading) return null;               // ou un spinner
    if (!admin) return <Navigate to="/admin/login" replace />;
    return children;
}