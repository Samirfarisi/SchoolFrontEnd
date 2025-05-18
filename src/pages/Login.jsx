import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/loginstyle.scss';
import logo from '../assets/Lycée de Ezzauada logo.png';
import Loader from '../components/Loader';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPass] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const nav = useNavigate();

    const handle = async e => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const ok = await login(email, password);
            if (ok) nav('/courses');
            else setError('Invalid credentials');
        } catch (err) {
            setError('Login failed: ' + (err.message || 'Please try again'));
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <Loader />;
    }

    return (
        <div className="login-container">
            <form className='login-form' onSubmit={handle}>
                <div className="login-header">
                    <img src={logo} alt="School Logo" className="login-logo" />
                    <h2>Login</h2>
                    <p className="login-subtitle">Welcome back! Please enter your credentials to continue.</p>
                </div>
                
                {error && <p className="error-message">{error}</p>}
                
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input 
                        id="email"
                        type="email" 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="Enter your email" 
                        required 
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input 
                        id="password"
                        type="password" 
                        value={password}
                        onChange={e => setPass(e.target.value)}
                        placeholder="Enter your password" 
                        required 
                    />
                </div>
                
                <div className="form-footer">
                    <button type="submit">Login</button>
                    <p className="register-link">
                        Don't have an account? <Link to="/signup">Register</Link>
                    </p>
                </div>
            </form>
        </div>
    );
}