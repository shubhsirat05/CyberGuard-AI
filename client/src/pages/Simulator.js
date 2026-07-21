import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const ATTACK_TYPES = [
  'Phishing', 'Smishing', 'Spear Phishing', 'Business Email Compromise',
  'Social Engineering', 'Pretexting', 'Vishing', 'Legitimate'
];

const ScoreDisplay = ({ score, correct }) => (
  <div className={`text-center p-6 rounded-xl ${correct ? 'bg-cyber-green/10 border border-cyber-green/30' : 'bg-cyber-red/10 border border-cyber-red/30'}`}>
    <div className="text-4xl mb-2">{correct ? '🎯' : '❌'}</div>
    <div className={`font-mono text-4xl font-bold ${correct ? 'text-cyber-green' : 'text-cyber-red'}`}>
      {score} pts
    </div>
    <div className={`font-mono text-sm mt-1 ${correct ? 'text-cyber-green/70' : 'text-cyber-red/70'}`}>
      {correct ? 'Correct identification!' : 'Missed this one'}
    </div>
  </div>
);

export default function Simulator() {
  const [scenario, setScenario] = useState(null);
  const [scenarioId, setScenarioId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState({ type: 'email', difficulty: 'medium' });
  const [answer, setAnswer] = useState({ isReal: null, attackType: '' });
  const [sessionStats, setSessionStats] = useState({ total: 0, correct: 0, totalScore: 0 });

  const generateScenario = async () => {
    setLoading(true);
    setResult(null);
    setScenario(null);
    setAnswer({ isReal: null, attackType: '' });
    setError('');
    try {
      const res = await api.post('/simulator/scenario', settings);
      setScenario(res.data);
      setScenarioId(res.data.id);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate scenario. Ensure Groq API key is set.');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (answer.isReal === null) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/simulator/answer/${scenarioId}`, answer);
      setResult(res.data);
      setSessionStats(prev => ({
        total: prev.total + 1,
        correct: prev.correct + (res.data.correct ? 1 : 0),
        totalScore: prev.totalScore + res.data.score
      }));
    } catch (err) {
      setError('Failed to submit answer.');
    } finally {
      setSubmitting(false);
    }
  };

  const ScenarioContent = () => {
    if (!scenario) return null;
    const isEmail = scenario.type === 'email';
    const isSms = scenario.type === 'sms';

    return (
      <div className="terminal rounded-xl overflow-hidden">
        {/* Terminal header */}
        <div className="flex items-center gap-2 px-4 py-3 bg-black/40 border-b border-cyber-accent/10">
          <div className="w-2 h-2 rounded-full bg-cyber-red/60" />
          <div className="w-2 h-2 rounded-full bg-cyber-yellow/60" />
          <div className="w-2 h-2 rounded-full bg-cyber-green/60" />
          <span className="font-mono text-xs text-slate-600 ml-2">
            {isEmail ? '📧 incoming-message.eml' : isSms ? '📱 sms-message.txt' : '💬 social-message.txt'}
          </span>
          <span className={`ml-auto px-2 py-0.5 rounded font-mono text-xs font-medium ${
            scenario.difficulty === 'easy' ? 'badge-safe' :
            scenario.difficulty === 'medium' ? 'badge-suspicious' : 'badge-dangerous'
          }`}>
            {scenario.difficulty?.toUpperCase()}
          </span>
        </div>

        {/* Email headers */}
        {isEmail && (
          <div className="px-4 py-3 border-b border-slate-800 bg-black/20 space-y-1">
            <div className="font-mono text-xs"><span className="text-slate-600">FROM: </span><span className="text-slate-300">{scenario.senderInfo || 'unknown@example.com'}</span></div>
            {scenario.subject && <div className="font-mono text-xs"><span className="text-slate-600">SUBJ: </span><span className="text-slate-300">{scenario.subject}</span></div>}
          </div>
        )}

        {isSms && (
          <div className="px-4 py-3 border-b border-slate-800 bg-black/20">
            <div className="font-mono text-xs"><span className="text-slate-600">FROM: </span><span className="text-slate-300">{scenario.senderInfo || '+1 (555) 000-0000'}</span></div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          <pre className="font-mono text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
            {scenario.content}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="font-mono text-xs text-slate-500 tracking-widest mb-2">FEATURE 02</div>
          <h1 className="font-mono text-3xl font-bold text-white mb-2">
            🎯 Attack <span className="text-cyber-green">Simulator</span>
          </h1>
          <p className="text-slate-500 text-sm">AI generates realistic threats. You identify them.</p>
        </div>

        {/* Session stats */}
        {sessionStats.total > 0 && (
          <div className="cyber-card rounded-xl px-6 py-4 flex gap-6">
            <div className="text-center">
              <div className="font-mono text-xl font-bold text-cyber-accent">{sessionStats.total}</div>
              <div className="font-mono text-xs text-slate-500">TOTAL</div>
            </div>
            <div className="text-center">
              <div className="font-mono text-xl font-bold text-cyber-green">{sessionStats.correct}</div>
              <div className="font-mono text-xs text-slate-500">CORRECT</div>
            </div>
            <div className="text-center">
              <div className="font-mono text-xl font-bold text-cyber-yellow">
                {sessionStats.total > 0 ? Math.round(sessionStats.totalScore / sessionStats.total) : 0}
              </div>
              <div className="font-mono text-xs text-slate-500">AVG PTS</div>
            </div>
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="cyber-card rounded-xl p-5 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <div className="font-mono text-xs text-slate-500 mb-2 tracking-widest">SCENARIO TYPE</div>
            <div className="flex gap-2">
              {['email', 'sms', 'social'].map(t => (
                <button
                  key={t}
                  onClick={() => setSettings({...settings, type: t})}
                  className={`px-4 py-2 rounded font-mono text-xs capitalize transition-all ${
                    settings.type === t
                      ? 'btn-primary glow-accent'
                      : 'border border-slate-700 text-slate-500 hover:border-slate-500'
                  }`}
                >
                  {t === 'email' ? '📧' : t === 'sms' ? '📱' : '💬'} {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="font-mono text-xs text-slate-500 mb-2 tracking-widest">DIFFICULTY</div>
            <div className="flex gap-2">
              {['easy', 'medium', 'hard'].map(d => (
                <button
                  key={d}
                  onClick={() => setSettings({...settings, difficulty: d})}
                  className={`px-4 py-2 rounded font-mono text-xs capitalize transition-all ${
                    settings.difficulty === d
                      ? d === 'easy' ? 'badge-safe' : d === 'medium' ? 'badge-suspicious' : 'badge-dangerous'
                      : 'border border-slate-700 text-slate-500 hover:border-slate-500'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={generateScenario}
            disabled={loading}
            className="ml-auto px-8 py-2.5 rounded font-mono text-sm font-medium btn-success glow-green disabled:opacity-40 transition-all"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border border-cyber-green/30 border-t-cyber-green rounded-full animate-spin" />
                Generating...
              </span>
            ) : (scenario ? '↺ New Scenario' : '▶ Generate Scenario')}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-lg bg-cyber-red/10 border border-cyber-red/30 font-mono text-sm text-cyber-red">
          ⚠ {error}
        </div>
      )}

      {!scenario && !loading && (
        <div className="cyber-card rounded-xl p-16 text-center">
          <div className="text-5xl mb-4 opacity-20">🎯</div>
          <div className="font-mono text-slate-600">Configure settings and generate a scenario to begin training</div>
        </div>
      )}

      {loading && (
        <div className="cyber-card rounded-xl p-16 flex flex-col items-center">
          <div className="w-12 h-12 border-2 border-cyber-green/20 border-t-cyber-green rounded-full animate-spin mb-4" />
          <div className="font-mono text-sm text-cyber-green">GENERATING ATTACK SCENARIO</div>
          <div className="font-mono text-xs text-slate-600 mt-2">Crafting realistic threat...</div>
        </div>
      )}

      {scenario && !loading && (
        <div className="space-y-6">
          <ScenarioContent />

          {/* Answer Section */}
          {!result && (
            <div className="cyber-card rounded-xl p-6 space-y-5">
              <div className="font-mono text-xs text-slate-500 tracking-widest">YOUR ASSESSMENT</div>

              {/* Real or Fake */}
              <div>
                <div className="font-mono text-sm text-slate-400 mb-3">Is this message legitimate or a threat?</div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setAnswer({...answer, isReal: true})}
                    className={`py-3 rounded-xl font-mono text-sm font-medium transition-all ${
                      answer.isReal === true ? 'badge-safe glow-green' : 'border border-slate-700 text-slate-400 hover:border-cyber-green/40'
                    }`}
                  >
                    ✅ Legitimate
                  </button>
                  <button
                    onClick={() => setAnswer({...answer, isReal: false})}
                    className={`py-3 rounded-xl font-mono text-sm font-medium transition-all ${
                      answer.isReal === false ? 'badge-dangerous glow-red' : 'border border-slate-700 text-slate-400 hover:border-cyber-red/40'
                    }`}
                  >
                    🚨 Threat / Scam
                  </button>
                </div>
              </div>

              {/* Attack Type */}
              {answer.isReal === false && (
                <div>
                  <div className="font-mono text-sm text-slate-400 mb-3">What type of attack is this?</div>
                  <div className="flex flex-wrap gap-2">
                    {ATTACK_TYPES.filter(t => t !== 'Legitimate').map(type => (
                      <button
                        key={type}
                        onClick={() => setAnswer({...answer, attackType: type})}
                        className={`px-3 py-1.5 rounded font-mono text-xs transition-all ${
                          answer.attackType === type
                            ? 'badge-suspicious'
                            : 'border border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-400'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={submitAnswer}
                disabled={submitting || answer.isReal === null}
                className="w-full py-3 rounded-xl font-mono font-medium text-sm btn-primary glow-accent disabled:opacity-40 transition-all"
              >
                {submitting ? 'Evaluating...' : '→ Submit Assessment'}
              </button>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-4">
              <ScoreDisplay score={result.score} correct={result.correct} />

              <div className="cyber-card rounded-xl p-5">
                <div className="font-mono text-xs text-slate-500 tracking-widest mb-3">CORRECT ANSWER</div>
                <div className="flex gap-4 flex-wrap">
                  <div>
                    <span className="font-mono text-xs text-slate-600">Type: </span>
                    <span className={`font-mono text-sm font-bold ${result.correctAnswer.isReal ? 'text-cyber-green' : 'text-cyber-red'}`}>
                      {result.correctAnswer.isReal ? 'Legitimate' : 'Threat'}
                    </span>
                  </div>
                  {!result.correctAnswer.isReal && (
                    <div>
                      <span className="font-mono text-xs text-slate-600">Attack: </span>
                      <span className="font-mono text-sm font-bold text-cyber-yellow">{result.correctAnswer.attackType}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="cyber-card rounded-xl p-5">
                <div className="font-mono text-xs text-slate-500 tracking-widest mb-3">EXPLANATION</div>
                <p className="text-sm text-slate-300 leading-relaxed">{result.explanation}</p>
              </div>

              {result.redFlags?.length > 0 && (
                <div className="cyber-card rounded-xl p-5">
                  <div className="font-mono text-xs text-slate-500 tracking-widest mb-3">RED FLAGS IN THIS SCENARIO</div>
                  <ul className="space-y-2">
                    {result.redFlags.map((flag, i) => (
                      <li key={i} className="flex gap-2 text-sm text-cyber-red">
                        <span>▸</span><span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.learningPoint && (
                <div className="rounded-xl p-4 bg-cyber-accent/5 border border-cyber-accent/20">
                  <div className="font-mono text-xs text-cyber-accent tracking-widest mb-2">💡 KEY LEARNING</div>
                  <p className="text-sm text-slate-300">{result.learningPoint}</p>
                </div>
              )}

              <button
                onClick={generateScenario}
                className="w-full py-3 rounded-xl font-mono font-medium text-sm btn-success glow-green transition-all"
              >
                ↺ Next Scenario
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
