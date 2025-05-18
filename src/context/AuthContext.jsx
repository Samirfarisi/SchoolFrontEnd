import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios-simple';

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            
            const userToken = localStorage.getItem('token');
            if (userToken) {
                try {
                    const { data } = await api.get('/me');
                    setUser(data);
                } catch {
                    localStorage.removeItem('token');
                }
            }

            
            const adminToken = localStorage.getItem('admin_token');
            if (adminToken) {
               
                setAdmin({ email: 'admin@example.com' });
            }

            setLoading(false);
        })();
    }, []);

  
    const login = async (email, password) => {
        try {
            const res = await api.post('/login', { email, password });
            localStorage.setItem('token', res.data.token);
            setUser(res.data.user);
            return true;
        } catch {
            return false;
        }
    };
    const logout = async () => {
        try { await api.post('/logout'); } catch { }
        localStorage.removeItem('token');
        setUser(null);
    };

    const loginAdmin = async (email, password) => {
        try {
            const res = await api.post('/admin/login', { email, password });
            localStorage.setItem('admin_token', res.data.token);
            setAdmin({ email });
            return true;
        } catch {
            return false;
        }
    };
    const logoutAdmin = async () => {
        try { await api.post('/admin/logout'); } catch { }
        localStorage.removeItem('admin_token');
        setAdmin(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                admin,
                loading,
                isLoggedIn: Boolean(user),
                isAdmin: Boolean(admin),
                login,
                logout,
                loginAdmin,
                logoutAdmin,
                setUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}