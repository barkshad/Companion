
import React, { useState, useEffect, useCallback } from 'react';
import { SylviaProfile, Goal, GoalType, GoalStatus } from './types';
import Onboarding from './components/Onboarding';
import GoalInput from './components/GoalInput';
import GoalNetwork from './components/GoalNetwork';
import { analyzeGoal, generateReflection } from './services/geminiService';

const App: React.FC = () => {
  const [profile, setProfile] = useState<SylviaProfile | null>(() => {
    const saved = localStorage.getItem('sylvia_profile');
    return saved ? JSON.parse(saved) : null;
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('sylvia_goals');
    return saved ? JSON.parse(saved) : [];
  });

  const [reflection, setReflection] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  useEffect(() => {
    if (profile) localStorage.setItem('sylvia_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('sylvia_goals', JSON.stringify(goals));
  }, [goals]);

  const handleOnboarding = (p: SylviaProfile) => setProfile(p);

  const handleAddGoal = async (text: string) => {
    if (!profile) return;
    setIsProcessing(true);
    try {
      const result = await analyzeGoal(text, profile);
      const newGoal: Goal = {
        id: Math.random().toString(36).substr(2, 9),
        title: result.title || 'New Exploration',
        description: result.description || '',
        type: result.type || GoalType.SHORT_TERM,
        status: GoalStatus.ACTIVE,
        progress: 0,
        createdAt: Date.now(),
        milestones: result.milestones || [],
        connectedGoalIds: []
      };
      setGoals(prev => [newGoal, ...prev]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    setGoals(prev => prev.map(g => {
      if (g.id !== goalId) return g;
      const updatedMilestones = g.milestones.map(m => 
        m.id === milestoneId ? { ...m, completed: !m.completed } : m
      );
      const completedCount = updatedMilestones.filter(m => m.completed).length;
      const progress = Math.round((completedCount / updatedMilestones.length) * 100);
      return { ...g, milestones: updatedMilestones, progress };
    }));
  };

  const handleReflect = async () => {
    if (!profile || goals.length === 0) return;
    setIsProcessing(true);
    try {
      const text = await generateReflection(goals, profile);
      setReflection(text);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!profile) return <Onboarding onComplete={handleOnboarding} />;

  return (
    <div className="min-h-screen max-w-5xl mx-auto px-6 py-12 pb-32">
      <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl serif italic text-white animate-float mb-2">Unfold, {profile.name}.</h1>
          <p className="text-zinc-500 font-light max-w-md">
            A quiet space for your growth, moving at a <span className="text-purple-400 italic font-medium">{profile.pace}</span> pace.
          </p>
        </div>
        <button 
          onClick={handleReflect}
          disabled={isProcessing || goals.length === 0}
          className="text-sm px-6 py-3 glass rounded-full text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
        >
          {isProcessing ? 'Gathering thoughts...' : 'Weekly Reflection'}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-10">
          <section>
            <GoalInput onAdd={handleAddGoal} isProcessing={isProcessing} />
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl serif italic text-zinc-300">Active Paths</h2>
              <span className="text-xs text-zinc-600 font-light">{goals.length} intentions found</span>
            </div>
            
            <div className="space-y-4">
              {goals.length === 0 && (
                <div className="glass p-12 rounded-[2rem] text-center text-zinc-600 font-light italic">
                  "The journey of a thousand miles begins with a single step."
                </div>
              )}
              {goals.map(goal => (
                <div 
                  key={goal.id} 
                  className={`glass p-6 rounded-[2rem] hover:bg-white/[0.05] transition-all cursor-pointer ${selectedGoal?.id === goal.id ? 'ring-1 ring-purple-500/30' : ''}`}
                  onClick={() => setSelectedGoal(goal)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className={`text-[10px] uppercase tracking-[0.2em] px-3 py-1 rounded-full ${goal.type === GoalType.LONG_TERM ? 'bg-purple-900/30 text-purple-300' : 'bg-emerald-900/30 text-emerald-300'}`}>
                        {goal.type === GoalType.LONG_TERM ? 'Direction' : 'Focus Point'}
                      </span>
                      <h3 className="text-lg text-white mt-2 font-medium">{goal.title}</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-light text-zinc-300">{goal.progress}%</div>
                      <div className="text-[10px] text-zinc-600 uppercase tracking-widest">Growth</div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 transition-all duration-1000"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-5 space-y-10">
          <section>
            <GoalNetwork goals={goals} onSelectGoal={(g) => setSelectedGoal(g)} />
          </section>

          {selectedGoal && (
            <div className="glass p-8 rounded-[2.5rem] animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl serif italic text-white">{selectedGoal.title}</h3>
                <button onClick={() => setSelectedGoal(null)} className="text-zinc-500 hover:text-white">✕</button>
              </div>
              <p className="text-zinc-400 font-light leading-relaxed mb-8 text-sm">
                {selectedGoal.description}
              </p>
              
              <div className="space-y-4">
                <h4 className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Milestones</h4>
                {selectedGoal.milestones.map(m => (
                  <div 
                    key={m.id} 
                    onClick={() => toggleMilestone(selectedGoal.id, m.id)}
                    className="flex items-center gap-4 group cursor-pointer"
                  >
                    <div className={`w-5 h-5 rounded-full border border-zinc-700 flex items-center justify-center transition-all ${m.completed ? 'bg-emerald-500/20 border-emerald-500/50' : 'group-hover:border-zinc-500'}`}>
                      {m.completed && <div className="w-2 h-2 rounded-full bg-emerald-400" />}
                    </div>
                    <span className={`text-sm font-light transition-all ${m.completed ? 'text-zinc-500 line-through' : 'text-zinc-300'}`}>
                      {m.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {reflection && (
            <div className="glass p-8 rounded-[2.5rem] bg-purple-900/10 border-purple-500/10">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl serif italic text-purple-200 underline decoration-purple-500/30 underline-offset-8">A Moment of Awareness</h3>
                <button onClick={() => setReflection(null)} className="text-zinc-500">✕</button>
              </div>
              <div className="text-zinc-300 font-light leading-relaxed text-sm whitespace-pre-wrap italic">
                {reflection}
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 p-8 flex justify-center pointer-events-none">
        <div className="glass px-8 py-4 rounded-full pointer-events-auto flex items-center gap-10">
          <div className="flex flex-col items-center">
            <span className="text-lg text-white">{goals.filter(g => g.progress === 100).length}</span>
            <span className="text-[8px] uppercase tracking-widest text-zinc-500">Bloomed</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex flex-col items-center">
            <span className="text-lg text-white">{goals.filter(g => g.status === GoalStatus.ACTIVE).length}</span>
            <span className="text-[8px] uppercase tracking-widest text-zinc-500">Flowing</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex flex-col items-center">
            <span className="text-lg text-white">{Math.round(goals.reduce((acc, curr) => acc + curr.progress, 0) / (goals.length || 1))}%</span>
            <span className="text-[8px] uppercase tracking-widest text-zinc-500">Harmony</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
