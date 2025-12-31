
import React, { useState } from 'react';
import { SylviaProfile } from '../types';

interface OnboardingProps {
  onComplete: (profile: SylviaProfile) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Partial<SylviaProfile>>({
    name: 'Sylvia',
    pace: 'balanced',
    onboarded: true
  });

  const next = () => setStep(s => s + 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#0a0a0b]">
      <div className="max-w-md w-full glass p-10 rounded-[2.5rem] glow-soft transition-all duration-700">
        {step === 1 && (
          <div className="space-y-6">
            <h1 className="text-4xl serif italic leading-tight text-white">Welcome, Sylvia.</h1>
            <p className="text-zinc-400 font-light leading-relaxed">
              This is a quiet space for your growth. Before we begin, let's understand how you move through the world.
            </p>
            <button 
              onClick={next}
              className="w-full py-4 glass text-white rounded-2xl hover:bg-white/5 transition-colors duration-300"
            >
              Begin
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl serif italic text-white">What is your natural pace?</h2>
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'slow', label: 'Slow & Intentional', desc: 'I value depth over speed.' },
                { id: 'balanced', label: 'Balanced Rhythm', desc: 'Steady movement with rest.' },
                { id: 'intense', label: 'Focused Bursts', desc: 'I work best in energetic cycles.' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setProfile({ ...profile, pace: opt.id as any });
                    next();
                  }}
                  className="p-5 text-left glass rounded-2xl hover:bg-white/5 transition-all group"
                >
                  <div className="text-white font-medium mb-1 group-hover:text-purple-300">{opt.label}</div>
                  <div className="text-xs text-zinc-500">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl serif italic text-white">What matters most right now?</h2>
            <textarea
              className="w-full h-32 glass rounded-2xl p-4 text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 bg-transparent placeholder:text-zinc-700"
              placeholder="Example: Finding peace in my daily routine..."
              onChange={(e) => setProfile({ ...profile, priority: e.target.value })}
            />
            <button 
              onClick={() => onComplete(profile as SylviaProfile)}
              className="w-full py-4 bg-purple-600/20 text-purple-200 rounded-2xl hover:bg-purple-600/30 transition-all border border-purple-500/20"
            >
              Enter My Path
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
