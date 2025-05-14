import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import '../styles/Auth.css';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Sign up functionality removed
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      setLoading(true);
      
      // Only sign in is available
      const response = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      const { error } = response;
      
      if (error) throw error;
      

    } catch (error) {
      setError({
        message: error.error_description || error.message,
        isSuccess: false
      });
    } finally {
      setLoading(false);
    }
  };





  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="clock-icon">🕒</div>
          <h1>Family Clock</h1>
        </div>
        

        
        {error && (
          <div className={`auth-message ${error.isSuccess ? 'success' : 'error'}`}>
            {error.message}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-button primary-button"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Sign In'}
          </button>
        </form>
        

        

      </div>
    </div>
  );
}
