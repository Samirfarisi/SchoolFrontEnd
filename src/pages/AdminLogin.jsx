import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/adminloginstyle.scss';
import logo from '../assets/Lycée de Ezzauada logo.png';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { loginAdmin } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        const ok = await loginAdmin(email, password);
        if (ok) {
            navigate('/admin/dashboard', { replace: true });
        } else {
            setError('Invalid admin credentials');
        }
    };

    return (
        <div className="login-container">
            <form className='login-form' onSubmit={handleSubmit}>
                <div className="login-header">
                    <img src={logo} alt="School Logo" className="login-logo" />
                    <h2>Admin Portal</h2>
                    <p className="login-subtitle">Administrator access only. Please enter your credentials.</p>
                </div>
                
                {error && <p className="error-message">{error}</p>}
                
                <div className="form-group">
                    <label htmlFor="email">Admin Email</label>
                    <input 
                        id="email"
                        type="email" 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="Enter admin email" 
                        required 
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input 
                        id="password"
                        type="password" 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Enter your password" 
                        required 
                    />
                </div>
                
                <div className="form-footer">
                    <button type="submit">Login as Admin</button>
                    <p className="register-link">
                        <Link to="/login">Back to User Login</Link>
                    </p>
                </div>
            </form>
        </div>
    );
}