import React from 'react';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: '🔍',
    title: 'Threat Analyzer',
    desc: 'Paste any suspicious email, URL, code, or message. AI instantly classifies the threat, explains the attack vector, and gives you actionable defense steps.',
    color: 'cyber-accent'
  },
  {
    icon: '🎯',
    title: 'Attack Simulator',
    desc: 'Train against AI-generated phishing emails, SMS scams, and social engineering scenarios. Score your instincts and track improvement over time.',
    color: 'cyber-green'
  },
  {
    icon: '📊',
    title: 'Progress Tracking',
    desc: 'Monitor your threat detection accuracy, training scores, and analysis history. See exactly where your blind spots are.',
    color: 'cyber-yellow'
  }
];

const stats = [
  { value: '99.2%', label: 'Detection Accuracy' },
  { value: '<2s', label: 'Analysis Time' },
  { value: '50+', label: 'Attack Patterns' },
  { value: '3', label: 'Training Modes' }
];

export default function Landing() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20">
        {/* Background glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyber-accent/5 rounded-full blur-3xl pointer-events-none" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyber-accent/30 bg-cyber-accent/5 mb-8">
          <span className="w-2 h-2 rounded-full bg-cyber-green animate-pulse" />
          <span className="font-mono text-xs text-cyber-accent tracking-widest">AI-POWERED THREAT INTELLIGENCE</span>
        </div>

        {/* Headline */}
        <h1 className="text-center font-mono mb-6 leading-tight">
          <span className="block text-5xl md:text-7xl font-bold text-white mb-2">
            Cyber<span className="text-cyber-accent text-glow-accent">Guard</span>
          </span>
          <span className="block text-xl md:text-2xl font-light text-slate-400 tracking-wide mt-2">
            Detect threats. Train your instincts. Stay safe.
          </span>
        </h1>

        <p className="max-w-2xl text-center text-slate-500 text-base md:text-lg mb-10 leading-relaxed">
          The AI security platform that analyzes suspicious content in real-time <em>and</em> trains you to spot attacks before they strike.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-20">
          <Link
            to="/register"
            className="px-8 py-3 rounded-lg font-mono font-medium text-sm btn-primary glow-accent hover:scale-105 transition-all"
          >
            Start Free →
          </Link>
          <Link
            to="/login"
            className="px-8 py-3 rounded-lg font-mono font-medium text-sm border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300 transition-all"
          >
            Sign In
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl w-full">
          {stats.map(stat => (
            <div key={stat.label} className="text-center">
              <div className="font-mono text-2xl font-bold text-cyber-accent text-glow-accent">{stat.value}</div>
              <div className="font-mono text-xs text-slate-500 mt-1 tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-mono text-3xl font-bold text-white mb-4">
            Two Weapons. <span className="text-cyber-accent">One Platform.</span>
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Analyze real threats and train against simulated ones. Both powered by advanced AI.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map(f => (
            <div key={f.title} className="cyber-card rounded-xl p-6 group">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className={`font-mono font-bold text-lg text-${f.color} mb-3`}>{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto cyber-card rounded-2xl p-12">
          <h2 className="font-mono text-2xl font-bold text-white mb-4">
            Your next phishing attack is <span className="text-cyber-red">already written.</span>
          </h2>
          <p className="text-slate-400 mb-8">Train before it reaches you.</p>
          <Link
            to="/register"
            className="inline-block px-10 py-4 rounded-lg font-mono font-medium btn-primary glow-accent hover:scale-105 transition-all"
          >
            Activate CyberGuard →
          </Link>
        </div>
      </section>
    </div>
  );
}
