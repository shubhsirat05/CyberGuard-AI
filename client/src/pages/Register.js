import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <div className="cyber-card rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="font-mono text-4xl mb-2">🛡️</div>
            <h1 className="font-mono text-xl font-bold text-white">Create Account</h1>
            <p className="font-mono text-xs text-slate-500 mt-1 tracking-widest">JOIN CYBERGUARD AI</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-cyber-red/10 border border-cyber-red/30 font-mono text-sm text-cyber-red">
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'username', label: 'USERNAME', type: 'text', placeholder: 'CyberOperator' },
              { key: 'email', label: 'EMAIL', type: 'email', placeholder: 'you@example.com' },
              { key: 'password', label: 'PASSWORD', type: 'password', placeholder: '••••••••' },
              { key: 'confirm', label: 'CONFIRM PASSWORD', type: 'password', placeholder: '••••••••' }
            ].map(field => (
              <div key={field.key}>
                <label className="block font-mono text-xs text-slate-500 mb-2 tracking-widest">{field.label}</label>
                <input
                  type={field.type}
                  value={form[field.key]}
                  onChange={e => setForm({...form, [field.key]: e.target.value})}
                  className="w-full cyber-input px-4 py-3 rounded-lg font-mono text-sm"
                  placeholder={field.placeholder}
                  required
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-mono font-medium text-sm btn-primary glow-accent transition-all disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border border-cyber-accent/30 border-t-cyber-accent rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                '→ Activate Shield'
              )}
            </button>
          </form>

          <p className="text-center font-mono text-xs text-slate-500 mt-6">
            Already registered?{' '}
            <Link to="/login" className="text-cyber-accent hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
