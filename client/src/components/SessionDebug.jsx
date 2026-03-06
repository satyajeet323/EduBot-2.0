import React from 'react';
import { useAuth } from '../hooks/useAuth';

const SessionDebug = () => {
  const { clearCorruptedSession, error } = useAuth();

  // Only show this component if there's an auth error
  if (!error) return null;

  return (
    <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
      <div className="flex items-center justify-between">
        <div>
          <strong className="font-bold">Authentication Error</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
        <button
          onClick={clearCorruptedSession}
          className="ml-4 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
        >
          Clear & Reload
        </button>
      </div>
    </div>
  );
};

export default SessionDebug;