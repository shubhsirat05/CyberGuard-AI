import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6l-8-4z" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = user ? [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/analyzer', label: 'Threat Analyzer' },
    { to: '/simulator', label: 'Attack Simulator' }
  ] : [];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-cyber-accent/10 bg-cyber-dark/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-cyber-accent group-hover:text-glow-accent transition-all">
              <ShieldIcon />
            </span>
            <div>
              <div className="font-mono font-bold text-cyber-accent text-sm tracking-widest">
                CYBERGUARD
              </div>
              <div className="font-mono text-xs text-slate-500 tracking-wider -mt-1">AI</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`font-mono text-sm tracking-wide transition-all ${
                  isActive(link.to)
                    ? 'text-cyber-accent text-glow-accent'
                    : 'text-slate-400 hover:text-cyber-accent'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="font-mono text-sm text-slate-400">
                  <span className="text-cyber-accent/60 mr-1">›</span>
                  {user.username}
                </span>
                <button
                  onClick={logout}
                  className="font-mono text-xs px-4 py-2 rounded border border-slate-700 text-slate-400 hover:border-cyber-red/40 hover:text-cyber-red transition-all"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="font-mono text-sm text-slate-400 hover:text-cyber-accent transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="font-mono text-sm px-4 py-2 rounded btn-primary">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-slate-400 hover:text-cyber-accent"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <div className={`w-5 h-0.5 bg-current mb-1 transition-all ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <div className={`w-5 h-0.5 bg-current mb-1 transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <div className={`w-5 h-0.5 bg-current transition-all ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-cyber-accent/10">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`block py-2 font-mono text-sm ${isActive(link.to) ? 'text-cyber-accent' : 'text-slate-400'}`}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <button onClick={logout} className="block w-full text-left py-2 font-mono text-sm text-cyber-red mt-2">
                Logout
              </button>
            ) : (
              <div className="mt-2 flex gap-3">
                <Link to="/login" className="font-mono text-sm text-slate-400">Sign In</Link>
                <Link to="/register" className="font-mono text-sm text-cyber-accent">Register</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
