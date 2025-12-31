
import React, { useState } from 'react';

interface GoalInputProps {
  onAdd: (text: string) => void;
  isProcessing: boolean;
}

const GoalInput: React.FC<GoalInputProps> = ({ onAdd, isProcessing }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      onAdd(input);
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative group">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isProcessing}
        placeholder={isProcessing ? "Listening to your thoughts..." : "What direction would you like to explore?"}
        className="w-full py-5 px-8 glass rounded-[2rem] text-lg font-light focus:outline-none focus:ring-1 focus:ring-zinc-600/30 transition-all duration-500 placeholder:text-zinc-600"
      />
      <button
        type="submit"
        disabled={isProcessing || !input.trim()}
        className="absolute right-3 top-2 bottom-2 px-8 bg-zinc-800/50 text-zinc-400 rounded-[1.5rem] hover:text-white transition-colors disabled:opacity-0"
      >
        {isProcessing ? '...' : 'Plant Seed'}
      </button>
    </form>
  );
};

export default GoalInput;
