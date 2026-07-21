import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <div className="cyber-card rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="font-mono text-4xl mb-2">🛡️</div>
            <h1 className="font-mono text-xl font-bold text-white">Access Terminal</h1>
            <p className="font-mono text-xs text-slate-500 mt-1 tracking-widest">CYBERGUARD AI</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-cyber-red/10 border border-cyber-red/30 font-mono text-sm text-cyber-red">
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-mono text-xs text-slate-500 mb-2 tracking-widest">EMAIL</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                className="w-full cyber-input px-4 py-3 rounded-lg font-mono text-sm"
                placeholder="operator@cyberguard.ai"
                required
              />
            </div>
            <div>
              <label className="block font-mono text-xs text-slate-500 mb-2 tracking-widest">PASSWORD</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                className="w-full cyber-input px-4 py-3 rounded-lg font-mono text-sm"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-mono font-medium text-sm btn-primary glow-accent transition-all disabled:opacity-50 mt-6"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border border-cyber-accent/30 border-t-cyber-accent rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                '→ Authenticate'
              )}
            </button>
          </form>

          <p className="text-center font-mono text-xs text-slate-500 mt-6">
            No account?{' '}
            <Link to="/register" className="text-cyber-accent hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
