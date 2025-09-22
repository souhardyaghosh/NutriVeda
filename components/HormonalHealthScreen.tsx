import React, { useState, useEffect } from 'react';
import { getHormonalHealthAdvice, visualizeMealPlate } from '../services/geminiService';
import { HormonalAdvice, Recipe } from '../types';
import LoadingSpinner from './LoadingSpinner';

// --- Constants ---
const FOCUS_AREAS = ['PCOS/PCOD', 'Menopause', 'Thyroid', 'General Balance'];
const PRIORITIES = [
  { name: 'Energy', icon: '⚡' },
  { name: 'Mood', icon: '💕' },
  { name: 'Fertility', icon: '🌼' },
  { name: 'Sleep', icon: '😴' }
];

// --- Sub-components ---
const RecipeModal: React.FC<{ recipe: Recipe | null; onClose: () => void; onImageLoad: (url: string) => void; }> = ({ recipe, onClose, onImageLoad }) => {
    const [isImgLoading, setIsImgLoading] = useState(false);
    
    useEffect(() => {
        if (recipe && !recipe.imageUrl && !isImgLoading) {
            const generateImage = async () => {
                setIsImgLoading(true);
                try {
                    const url = await visualizeMealPlate(recipe.name, recipe.description);
                    onImageLoad(url);
                } catch (e) {
                    console.error("Failed to generate recipe image:", e);
                    // Optionally set a placeholder error image
                } finally {
                    setIsImgLoading(false);
                }
            };
            generateImage();
        }
    }, [recipe, onImageLoad, isImgLoading]);

    if (!recipe) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl relative animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="w-full h-64 bg-gray-200 rounded-t-2xl flex items-center justify-center">
                    {isImgLoading && <LoadingSpinner />}
                    {recipe.imageUrl && <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-full object-cover rounded-t-2xl" />}
                </div>
                <div className="p-6">
                    <h3 className="text-3xl font-bold text-dark">{recipe.name}</h3>
                    <p className="text-gray-600 mt-2 mb-6">{recipe.description}</p>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-bold text-lg text-dark mb-2">Ingredients</h4>
                            <ul className="list-disc list-inside space-y-1 text-gray-700">
                                {recipe.ingredients?.map((ing, i) => <li key={i}>{ing}</li>)}
                            </ul>
                        </div>
                         <div>
                            <h4 className="font-bold text-lg text-dark mb-2">Instructions</h4>
                            <p className="text-gray-700 whitespace-pre-wrap">{recipe.instructions}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- Main Component ---
const HormonalHealthScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [focusArea, setFocusArea] = useState<string>(FOCUS_AREAS[0]);
    const [priority, setPriority] = useState<string>(PRIORITIES[0].name);
    const [advice, setAdvice] = useState<HormonalAdvice | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [modalRecipe, setModalRecipe] = useState<Recipe | null>(null);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setAdvice(null);
        try {
            const result = await getHormonalHealthAdvice(focusArea, priority);
            setAdvice(result);
        } catch (err) {
            setError('Apologies, we could not generate advice at this moment. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleImageLoaded = (url: string) => {
        if (modalRecipe && advice) {
            const updatedRecipes = advice.recipes.map(r => 
                r.name === modalRecipe.name ? { ...r, imageUrl: url } : r
            );
            setAdvice({ ...advice, recipes: updatedRecipes });
            setModalRecipe({ ...modalRecipe, imageUrl: url });
        }
    };
    
    return (
        <>
        <RecipeModal recipe={modalRecipe} onClose={() => setModalRecipe(null)} onImageLoad={handleImageLoaded} />
        <div className="w-full max-w-5xl mx-auto animate-fadeIn space-y-8">
            <header className="relative text-center">
                 <button onClick={onBack} className="absolute top-1/2 left-0 -translate-y-1/2 text-primary font-semibold hover:text-secondary flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    Back
                </button>
                <h2 className="text-3xl font-bold text-dark">Hormonal Health ⚖️</h2>
                <p className="text-gray-600 mt-2">Get Ayurvedic insights for hormonal balance and well-being.</p>
            </header>

            {/* --- Input Section --- */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-teal-100">
                <div className="grid md:grid-cols-2 gap-6 items-center">
                    <div>
                        <label htmlFor="focus-area" className="block text-sm font-bold text-dark mb-2">What is your focus area?</label>
                        <select
                            id="focus-area"
                            value={focusArea}
                            onChange={(e) => setFocusArea(e.target.value)}
                            className="w-full px-4 py-2 bg-light border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-dark"
                        >
                            {FOCUS_AREAS.map(area => <option key={area} value={area}>{area}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-bold text-dark mb-2">What is your priority?</label>
                         <div className="flex flex-wrap gap-2">
                             {PRIORITIES.map(p => (
                                <button
                                    key={p.name}
                                    onClick={() => setPriority(p.name)}
                                    className={`px-4 py-2 rounded-full font-semibold transition-colors text-sm flex items-center gap-2 ${
                                        priority === p.name ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {p.icon} {p.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-center">
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="bg-accent text-white font-bold py-3 px-10 text-lg rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-400 flex items-center justify-center shadow-md"
                    >
                        {isLoading ? <LoadingSpinner /> : 'Get Personal Advice'}
                    </button>
                </div>
            </div>

            {/* --- Output Section --- */}
            <div className="space-y-8">
                {isLoading && <div className="text-center py-12"><LoadingSpinner /></div>}
                {error && <div className="text-center text-red-600 font-semibold p-4 bg-red-100 rounded-lg">{error}</div>}
                {!isLoading && !advice && (
                    <div className="text-center text-gray-500 py-12">
                        <span className="text-5xl mb-4 inline-block">✨</span>
                        <h3 className="text-2xl font-bold text-dark">Your path to balance awaits.</h3>
                        <p>Select your focus and priority above to receive guidance.</p>
                    </div>
                )}
                {advice && (
                    <div className="space-y-8 animate-fadeIn">
                        {/* Today's Tip */}
                        <div className="bg-gradient-to-r from-yellow-50 to-amber-100 p-6 rounded-2xl shadow-md border-l-4 border-amber-400">
                            <h3 className="text-2xl font-bold text-amber-800">Today's Tip 💡</h3>
                            <p className="text-amber-700 mt-2">{advice.todayTip}</p>
                        </div>
                        
                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Lifestyle & Food */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-white p-6 rounded-2xl shadow-sm">
                                    <h4 className="font-bold text-xl text-dark mb-3">Lifestyle Suggestions</h4>
                                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                                        {advice.lifestyleSuggestions?.map((tip, i) => <li key={i}>{tip}</li>)}
                                    </ul>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm">
                                    <h4 className="font-bold text-xl text-dark mb-3">Food Suggestions</h4>
                                     <ul className="list-disc list-inside space-y-2 text-gray-700">
                                        {advice.foodSuggestions?.map((food, i) => <li key={i}>{food}</li>)}
                                    </ul>
                                </div>
                            </div>
                             {/* Dosha Advice */}
                            <div className="bg-light p-6 rounded-2xl shadow-sm">
                                <h4 className="font-bold text-xl text-dark mb-3">Dosha Balance Advice</h4>
                                <p className="text-gray-700">{advice.doshaAdvice}</p>
                            </div>
                        </div>

                        {/* Recipes */}
                        <div>
                           <h3 className="text-2xl font-bold text-dark text-center mb-6">Nourishing Recipes</h3>
                            <div className="grid md:grid-cols-2 gap-8">
                                {advice.recipes?.map((recipe, i) => (
                                    <div key={i} className="bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden">
                                        <div className="p-6 flex-grow">
                                            <h4 className="font-bold text-xl text-dark">{recipe.name}</h4>
                                            <p className="text-gray-600 mt-2 text-sm flex-grow">{recipe.description}</p>
                                        </div>
                                        <div className="p-6 bg-light mt-auto">
                                            <button onClick={() => setModalRecipe(recipe)} className="w-full bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-secondary transition-colors">
                                                View Recipe
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Consult */}
                        <div className="text-center bg-white p-6 rounded-2xl shadow-md border border-primary/20">
                            <h3 className="text-xl font-bold text-dark">Need More Guidance?</h3>
                            <p className="text-gray-600 mt-2 max-w-xl mx-auto">
                                Connect with a practitioner for advice approved by certified experts.
                            </p>
                             <button onClick={() => alert('Coming Soon!')} className="mt-4 bg-secondary text-white font-bold py-2 px-6 rounded-lg hover:bg-dark transition-colors">
                                Quick Consult
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
        </>
    );
};

export default HormonalHealthScreen;