import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../styles/signupstyle.scss';
import logo from '../assets/Lycée de Ezzauada logo.png';
import Loader from '../components/Loader';

export default function Signup() {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await api.post('/register', form);

      await Swal.fire({
        icon: 'success',
        title: 'Registered!',
        text: 'Please log in now.',
        confirmButtonText: 'OK',
      });

      // After signup, go to login (or directly to /courses if you like)
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || 'Signup failed';
      setError(msg);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: msg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSubmit}>
        <div className="signup-header">
          <img src={logo} alt="School Logo" className="signup-logo" />
          <h2>Sign Up</h2>
          <p className="signup-subtitle">Create your account to access all features</p>
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="form-group">
          <label htmlFor="first_name">First Name</label>
          <input
            id="first_name"
            name="first_name"
            placeholder="Enter your first name"
            value={form.first_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="last_name">Last Name</label>
          <input
            id="last_name"
            name="last_name"
            placeholder="Enter your last name"
            value={form.last_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email address"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Create a password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-footer">
          <button type="submit">Create Account</button>
        </div>
      </form>
    </div>
  );
}