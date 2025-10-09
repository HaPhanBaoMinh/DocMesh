import { useState } from 'react';

interface UserNameModalProps {
  onSubmit: (name: string) => void;
}

export default function UserNameModal({ onSubmit }: UserNameModalProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-96">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Enter Your Name
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Please enter your name to join this document
        </p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoFocus
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          />
          
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-[#444444] text-white py-2 rounded-lg hover:bg-[#222222] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}

