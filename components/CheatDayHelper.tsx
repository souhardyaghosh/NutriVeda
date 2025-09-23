
import React, { useState } from 'react';
import { getCheatDaySwap, visualizeMealPlate } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

// Add fade-in animation for new elements
const style = document.createElement('style');
style.innerHTML = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
        animation: fadeIn 0.5s ease-in-out forwards;
    }
`;
document.head.appendChild(style);

const CheatDayHelper: React.FC = () => {
  const [craving, setCraving] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // State for image generation
  const [imageUrl, setImageUrl] = useState('');
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageError, setImageError] = useState('');

  const handleGetSuggestion = async () => {
    if (!craving.trim()) {
      setError("Please tell me what you're craving.");
      return;
    }
    setError('');
    setIsLoading(true);
    setSuggestion('');
    // Reset image state on new suggestion
    setImageUrl('');
    setImageError('');
    setIsImageLoading(false);

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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleGetSuggestion();
    }
  };

  const handleVisualize = async () => {
    if (!suggestion) return;
    setIsImageLoading(true);
    setImageUrl('');
    setImageError('');
    try {
      const result = await visualizeMealPlate(craving, suggestion);
      setImageUrl(result);
    } catch (err) {
      setImageError('Sorry, the visualization failed. Please try again.');
      console.error(err);
    } finally {
      setIsImageLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-black">Healthy Cheat Day Intelligence 🍕✨</h2>
        <p className="text-gray-700 mt-2 mb-6">Craving something? Let's find and visualize a healthier, guilt-free alternative.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={craving}
          onChange={(e) => setCraving(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., Pizza, Chocolate Cake, French Fries..."
          className="w-full flex-grow px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-black"
        />
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
        <div className="mt-6 bg-green-50 p-6 rounded-lg border-l-4 border-primary animate-fadeIn">
            <h3 className="font-bold text-lg text-black">Healthier Swap for {craving}:</h3>
            <p className="mt-2 text-gray-800 whitespace-pre-wrap">{suggestion}</p>
            <div className="flex justify-end mt-4">
               <button
                  onClick={handleVisualize}
                  disabled={isImageLoading}
                  className="bg-accent text-white font-semibold py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-400 flex items-center justify-center text-sm shadow-md"
                >
                  {isImageLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span className="ml-2">Visualizing...</span>
                    </>
                  ) : (
                    'Visualize Swap 📸'
                  )}
                </button>
            </div>
        </div>
      )}
      
      {imageError && <p className="text-red-500 mt-4 text-center">{imageError}</p>}
      
      {imageUrl && (
        <div className="mt-6 animate-fadeIn">
            <h3 className="text-center font-bold text-lg text-dark mb-4">Here's how it could look!</h3>
            <img src={imageUrl} alt={`Visualization of a healthier alternative for ${craving}`} className="rounded-2xl shadow-lg w-full h-auto" />
        </div>
      )}

    </div>
  );
};

export default CheatDayHelper;
