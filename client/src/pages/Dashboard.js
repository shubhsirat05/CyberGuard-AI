import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const StatCard = ({ label, value, sub, color = 'cyber-accent' }) => (
  <div className="cyber-card rounded-xl p-5">
    <div className={`font-mono text-3xl font-bold text-${color} mb-1`}>{value}</div>
    <div className="font-mono text-xs text-slate-500 tracking-widest uppercase">{label}</div>
    {sub && <div className="text-xs text-slate-600 mt-1">{sub}</div>}
  </div>
);

const VerdictBadge = ({ verdict }) => {
  const map = { SAFE: 'badge-safe', SUSPICIOUS: 'badge-suspicious', DANGEROUS: 'badge-dangerous' };
  return (
    <span className={`px-2 py-0.5 rounded font-mono text-xs ${map[verdict] || 'bg-slate-700 text-slate-400'}`}>
      {verdict}
    </span>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/stats/dashboard').then(res => setData(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="cyber-spinner" />
    </div>
  );

  const stats = data?.stats || {};
  const accuracy = stats.accuracy || 0;
  const chartData = [{ name: 'Accuracy', value: accuracy, fill: '#00d4ff' }];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-10">
        <div className="font-mono text-xs text-slate-500 tracking-widest mb-2">COMMAND CENTER</div>
        <h1 className="font-mono text-3xl font-bold text-white">
          Welcome back, <span className="text-cyber-accent">{user?.username}</span>
        </h1>
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        <Link to="/analyzer" className="cyber-card rounded-xl p-6 group hover:glow-accent transition-all">
          <div className="flex items-center gap-4">
            <div className="text-3xl">🔍</div>
            <div>
              <div className="font-mono font-bold text-cyber-accent">Threat Analyzer</div>
              <div className="text-sm text-slate-500 mt-1">Analyze suspicious content now</div>
            </div>
            <div className="ml-auto font-mono text-cyber-accent/40 group-hover:text-cyber-accent text-xl transition-colors">→</div>
          </div>
        </Link>
        <Link to="/simulator" className="cyber-card rounded-xl p-6 group hover:glow-green transition-all">
          <div className="flex items-center gap-4">
            <div className="text-3xl">🎯</div>
            <div>
              <div className="font-mono font-bold text-cyber-green">Attack Simulator</div>
              <div className="text-sm text-slate-500 mt-1">Train your threat instincts</div>
            </div>
            <div className="ml-auto font-mono text-cyber-green/40 group-hover:text-cyber-green text-xl transition-colors">→</div>
          </div>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard label="Threats Analyzed" value={stats.totalAnalyses || 0} color="cyber-accent" />
        <StatCard label="Training Sessions" value={stats.scenariosCompleted || 0} color="cyber-green" />
        <StatCard label="Correct Catches" value={stats.correctIdentifications || 0} color="cyber-yellow" />
        <StatCard label="Avg Score" value={`${stats.avgScore || 0}`} sub="per session" color="cyber-accent" />
      </div>

      {/* Charts + History */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Accuracy Gauge */}
        <div className="cyber-card rounded-xl p-6">
          <div className="font-mono text-xs text-slate-500 tracking-widest mb-4">DETECTION ACCURACY</div>
          <div className="h-40 relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="80%" innerRadius="60%" outerRadius="90%" data={chartData} startAngle={180} endAngle={0}>
                <RadialBar background={{ fill: 'rgba(0,212,255,0.05)' }} dataKey="value" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
              <div className="font-mono text-3xl font-bold text-cyber-accent">{accuracy}%</div>
              <div className="font-mono text-xs text-slate-500">accuracy</div>
            </div>
          </div>
        </div>

        {/* Recent Analyses */}
        <div className="cyber-card rounded-xl p-6">
          <div className="font-mono text-xs text-slate-500 tracking-widest mb-4">RECENT ANALYSES</div>
          {data?.recentAnalyses?.length > 0 ? (
            <div className="space-y-3">
              {data.recentAnalyses.map((a, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-800">
                  <div className="font-mono text-xs text-slate-400 capitalize">{a.contentType}</div>
                  <VerdictBadge verdict={a.result.verdict} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-600 font-mono text-sm">
              No analyses yet.<br />
              <Link to="/analyzer" className="text-cyber-accent text-xs mt-2 inline-block">Start analyzing →</Link>
            </div>
          )}
        </div>

        {/* Recent Training */}
        <div className="cyber-card rounded-xl p-6">
          <div className="font-mono text-xs text-slate-500 tracking-widest mb-4">RECENT TRAINING</div>
          {data?.recentTraining?.length > 0 ? (
            <div className="space-y-3">
              {data.recentTraining.map((t, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span>{t.result.correct ? '✅' : '❌'}</span>
                    <span className="font-mono text-xs text-slate-400 capitalize">{t.scenario.type}</span>
                  </div>
                  <span className={`font-mono text-xs font-bold ${t.result.score >= 70 ? 'text-cyber-green' : 'text-cyber-red'}`}>
                    {t.result.score}pts
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-600 font-mono text-sm">
              No training yet.<br />
              <Link to="/simulator" className="text-cyber-green text-xs mt-2 inline-block">Start training →</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
