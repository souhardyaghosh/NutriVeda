
import React, { useState } from 'react';
import { getCheatDaySwap } from '../services/geminiService';
import { COMMON_CRAVINGS } from '../constants';
import LoadingSpinner from './LoadingSpinner';

const CheatDayHelper: React.FC = () => {
  const [craving, setCraving] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGetSuggestion = async () => {
    if (!craving) {
      setError('Please select a craving first.');
      return;
    }
    setError('');
    setIsLoading(true);
    setSuggestion('');
    try {
      const result = await getCheatDaySwap(craving);
      setSuggestion(result);
    } catch (err) {
      setError('Sorry, I couldn\'t find a suggestion. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl mt-12">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-dark">Healthy Cheat Day Intelligence 🍕✨</h2>
        <p className="text-gray-600 mt-2 mb-6">Craving something? Let's find a healthier, guilt-free alternative.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <select
          value={craving}
          onChange={(e) => setCraving(e.target.value)}
          className="w-full flex-grow px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
        >
          <option value="">-- Select a craving --</option>
          {COMMON_CRAVINGS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button
          onClick={handleGetSuggestion}
          disabled={isLoading}
          className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-secondary transition-colors disabled:bg-gray-400 flex items-center justify-center"
        >
          {isLoading ? <LoadingSpinner /> : 'Find Swap'}
        </button>
      </div>
      
      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

      {suggestion && (
        <div className="mt-6 bg-green-50 p-6 rounded-lg border-l-4 border-primary">
            <h3 className="font-bold text-lg text-dark">Healthier Swap for {craving}:</h3>
            <p className="mt-2 text-gray-700 whitespace-pre-wrap">{suggestion}</p>
        </div>
      )}
    </div>
  );
};

export default CheatDayHelper;
