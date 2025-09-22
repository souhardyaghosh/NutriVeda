import React, { useState } from 'react';
import { DietPlan, DailyPlan, Meal, UserData } from '../types';
import DonutChart from './DonutChart';
import { visualizeMealPlate, getMealSwap } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode; title: string; }> = ({ isOpen, onClose, children, title }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg relative" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b">
                    <h3 className="text-2xl font-bold text-dark">{title}</h3>
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

const VisualizePlateModal: React.FC<{ meal: Meal | null; isOpen: boolean; onClose: () => void; }> = ({ meal, isOpen, onClose }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    React.useEffect(() => {
        if (isOpen && meal && !imageUrl) {
            const generateImage = async () => {
                setIsLoading(true);
                setError('');
                try {
                    const url = await visualizeMealPlate(meal.name, meal.description);
                    setImageUrl(url);
                } catch (e) {
                    console.error(e);
                    setError('Sorry, the visualization failed. Please try again.');
                } finally {
                    setIsLoading(false);
                }
            };
            generateImage();
        } else if (!isOpen) {
            // Reset on close
            setImageUrl(null);
            setError('');
        }
    }, [isOpen, meal, imageUrl]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Visualizing: ${meal?.name ?? 'Meal'}`}>
            <div className="flex justify-center items-center min-h-[300px]">
                {isLoading && (
                    <div className="text-center">
                        <LoadingSpinner />
                        <p className="mt-4 text-gray-600">Our AI chef is preparing your plate...</p>
                    </div>
                )}
                {error && <p className="text-red-500">{error}</p>}
                {imageUrl && <img src={imageUrl} alt={`Visualization of ${meal?.name ?? 'your meal'}`} className="rounded-lg shadow-md w-full h-auto" />}
            </div>
        </Modal>
    );
};

const SwapMealModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onConfirmSwap: (newMeal: Meal) => void;
    meal: Meal | null; 
    mealType: keyof DailyPlan['meals'] | null;
    userData: UserData;
}> = ({ isOpen, onClose, onConfirmSwap, meal, mealType, userData }) => {
    const [suggestion, setSuggestion] = useState<Meal | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

     React.useEffect(() => {
        if (isOpen && meal && !suggestion) {
            const fetchSuggestion = async () => {
                setIsLoading(true);
                setError('');
                try {
                    const result = await getMealSwap(userData, meal, mealType || 'meal');
                    setSuggestion(result);
                } catch (e) {
                    console.error(e);
                    setError('Sorry, we couldn\'t find a swap. Please try again.');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchSuggestion();
        } else if (!isOpen) {
            setSuggestion(null);
            setError('');
        }
    }, [isOpen, meal, suggestion, mealType, userData]);

    const MealCard = ({ m, title }: {m: Meal | null, title: string}) => {
        if (!m) {
             return (
                <div className="bg-light p-4 rounded-lg border w-full">
                    <h4 className="font-bold text-lg text-secondary">{title}</h4>
                    <p className="text-gray-500">Meal data not available.</p>
                </div>
            );
        }
        return (
            <div className="bg-light p-4 rounded-lg border w-full">
                <h4 className="font-bold text-lg text-secondary">{title}</h4>
                <p className="font-semibold text-dark">{m.name}</p>
                <p className="text-sm text-gray-600">{m.description}</p>
                <div className="mt-2 text-sm font-semibold">{m.calories} kcal</div>
            </div>
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Swap Your ${mealType || 'Meal'}`}>
             <div className="min-h-[200px]">
                {isLoading && (
                    <div className="text-center py-8">
                        <LoadingSpinner />
                        <p className="mt-4 text-gray-600">Finding a delicious alternative...</p>
                    </div>
                )}
                {error && <p className="text-red-500 text-center py-8">{error}</p>}
                {suggestion && (
                    <div>
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                           <MealCard m={meal} title="Original" />
                           <MealCard m={suggestion} title="Suggestion" />
                        </div>
                        <div className="flex justify-end gap-4">
                            <button onClick={onClose} className="bg-gray-200 text-gray-700 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
                            <button onClick={() => { onConfirmSwap(suggestion); onClose(); }} className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-secondary transition-colors">Accept & Swap</button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};


const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex justify-center items-center">
        {[...Array(5)].map((_, i) => (
            <svg key={i} className={`w-6 h-6 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.367-2.448a1 1 0 00-1.175 0l-3.367 2.448c-.784.57-1.838-.197-1.54-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.05 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
            </svg>
        ))}
    </div>
);

const MEAL_ICONS = {
    breakfast: '☀️',
    lunch: '🥗',
    dinner: '🌙',
    snacks: '🍎'
};

const MealAccordion: React.FC<{ mealType: keyof DailyPlan['meals']; meal: Meal; isOpen: boolean; onToggle: () => void; onVisualize: () => void; onSwap: () => void; }> = ({ mealType, meal, isOpen, onToggle, onVisualize, onSwap }) => {
    if (!meal) {
        return null;
    }
    const macros = meal.macronutrients || { protein: 0, carbs: 0, fat: 0 };
    const macroSegments = [
        { label: 'P', value: macros.protein, color: '#34D399' }, // Green
        { label: 'C', value: macros.carbs, color: '#FBBF24' },   // Amber
        { label: 'F', value: macros.fat, color: '#F87171' },     // Red
    ];
    const doshaSegments = [
        { label: 'V', value: meal.ayurvedicBalance.vata, color: '#60A5FA' }, // Blue
        { label: 'P', value: meal.ayurvedicBalance.pitta, color: '#F87171' },  // Red
        { label: 'K', value: meal.ayurvedicBalance.kapha, color: '#34D399' }, // Green
    ];

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300">
            <button onClick={onToggle} className="w-full text-left p-4 flex items-center justify-between focus:outline-none">
                <div className="flex items-center">
                    <span className="text-2xl mr-4">{MEAL_ICONS[mealType]}</span>
                    <div>
                        <p className="text-xs text-gray-500 capitalize">{mealType}</p>
                        <h4 className="font-bold text-lg text-dark">{meal.name}</h4>
                    </div>
                </div>
                <div className="flex items-center">
                    <span className="font-bold text-lg text-primary mr-4">{meal.calories} kcal</span>
                    <svg className={`w-6 h-6 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>
            {isOpen && (
                <div className="p-5 border-t border-gray-200 bg-light">
                    <p className="text-gray-600 mb-6">{meal.description}</p>
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <DonutChart title="Macronutrients" segments={macroSegments} centerValue={String(meal.calories)} centerLabel="kcal" />
                        <DonutChart title="Ayurvedic Balance" segments={doshaSegments} centerValue="Doshas" centerLabel="" />
                    </div>
                    <div>
                        <h5 className="font-bold text-dark mb-2">Ayurvedic Properties</h5>
                        <div className="mb-3">
                            <span className="font-semibold text-sm text-gray-600 mr-2">Rasas (Tastes):</span>
                            {meal.ayurvedicProperties.rasas.map(rasa => (
                                <span key={rasa} className="inline-block bg-green-100 text-green-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">{rasa}</span>
                            ))}
                        </div>
                        <div className="bg-white p-3 rounded-lg border">
                           <p className="text-sm text-gray-700"><span className="font-semibold">Notes:</span> {meal.ayurvedicProperties.notes}</p>
                        </div>
                    </div>
                     <div className="flex justify-end gap-4 mt-6 text-sm">
                        <button onClick={onVisualize} className="font-semibold text-primary hover:text-secondary transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.25 2.5a.75.75 0 00-1.5 0v1.51a3.001 3.001 0 00-1.25 2.6V15.5a.75.75 0 001.5 0v-1.125a.75.75 0 00-1.5 0V15.5a2.25 2.25 0 002.25 2.25h13.5a2.25 2.25 0 002.25-2.25V6.61a3.001 3.001 0 00-1.25-2.6V2.5a.75.75 0 00-1.5 0v1.51a3.001 3.001 0 00-1.25-2.6V2.5a.75.75 0 00-1.5 0v1.51a3.001 3.001 0 00-1.25-2.6V2.5a.75.75 0 00-1.5 0v1.51a3.001 3.001 0 00-1.25-2.6V2.5zM3.5 8.75a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0v-1.5z" clipRule="evenodd" /></svg>
                            Visualize Plate
                        </button>
                        <button onClick={onSwap} className="font-semibold text-primary hover:text-secondary transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-1" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM13 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z" /></svg>
                            Swap Meal
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

interface DietPlanDisplayProps {
    plan: DietPlan;
    userData: UserData;
    onUpdateMeal: (dayIndex: number, mealType: keyof DailyPlan['meals'], newMeal: Meal) => void;
    onReset: () => void;
}

const DietPlanDisplay: React.FC<DietPlanDisplayProps> = ({ plan, userData, onUpdateMeal, onReset }) => {
    const [activeDayIndex, setActiveDayIndex] = useState(0);
    const [openMeal, setOpenMeal] = useState<string | null>(null);

    // State for modals
    const [visualizeModal, setVisualizeModal] = useState<{ isOpen: boolean; meal: Meal | null }>({ isOpen: false, meal: null });
    const [swapModal, setSwapModal] = useState<{ isOpen: boolean; meal: Meal | null, mealType: keyof DailyPlan['meals'] | null }>({ isOpen: false, meal: null, mealType: null });

    if (!plan || !plan.dailyPlans || plan.dailyPlans.length === 0) {
        return (
            <div className="w-full max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-xl">
                 <div className="text-center p-4 bg-red-50 rounded-2xl border border-red-200">
                    <h2 className="text-2xl font-bold text-red-700 mb-4">Plan Generation Error</h2>
                    <p className="text-red-600 mb-6">Sorry, we couldn't generate a valid diet plan. Please try again.</p>
                    <button onClick={onReset} className="bg-red-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-600 transition-colors">
                        Start Over
                    </button>
                </div>
            </div>
        );
    }

    const activeDayPlan = plan.dailyPlans[activeDayIndex];

    const handleToggleMeal = (mealKey: string) => {
        setOpenMeal(prev => (prev === mealKey ? null : mealKey));
    };
    
    const handleDayChange = (index: number) => {
        setActiveDayIndex(index);
        setOpenMeal(null);
    }
    
    const handleConfirmSwap = (newMeal: Meal) => {
        if(swapModal.mealType) {
            onUpdateMeal(activeDayIndex, swapModal.mealType, newMeal);
        }
    };


  return (
    <>
      <VisualizePlateModal 
        isOpen={visualizeModal.isOpen} 
        onClose={() => setVisualizeModal({ isOpen: false, meal: null })}
        meal={visualizeModal.meal}
      />
      <SwapMealModal
        isOpen={swapModal.isOpen}
        onClose={() => setSwapModal({ isOpen: false, meal: null, mealType: null })}
        meal={swapModal.meal}
        mealType={swapModal.mealType}
        userData={userData}
        onConfirmSwap={handleConfirmSwap}
      />
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-dark">{plan.title}</h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">{plan.description}</p>
        </div>
        
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <div className="flex border-b border-gray-200 mb-6">
              {plan.dailyPlans.map((day, index) => (
                  <button 
                      key={day.day} 
                      onClick={() => handleDayChange(index)}
                      className={`px-4 py-3 font-semibold text-lg transition-colors ${activeDayIndex === index ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-dark'}`}
                  >
                    Day {index + 1}
                  </button>
              ))}
          </div>
          
          <div className="text-center mb-6 p-4 bg-light rounded-lg">
              <p className="text-lg font-semibold text-dark">Daily Total: <span className="text-primary">{activeDayPlan.totalCalories} Calories</span></p>
              <div className="mt-2">
                  <StarRating rating={activeDayPlan.ayurvedicRating} />
              </div>
              <p className="text-sm text-gray-600 italic mt-2">"{activeDayPlan.ayurvedicQuote}"</p>
          </div>

          <div className="space-y-4">
              {(Object.entries(activeDayPlan.meals) as [keyof DailyPlan['meals'], Meal][]).map(([mealType, meal]) => (
                  <MealAccordion 
                      key={mealType}
                      mealType={mealType} 
                      meal={meal}
                      isOpen={openMeal === mealType}
                      onToggle={() => handleToggleMeal(mealType)}
                      onVisualize={() => setVisualizeModal({ isOpen: true, meal })}
                      onSwap={() => setSwapModal({ isOpen: true, meal, mealType })}
                  />
              ))}
          </div>
        </div>

        <div className="text-center mt-12">
              <button onClick={onReset} className="bg-primary text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-secondary transition-colors">
                Start Over
              </button>
          </div>
      </div>
    </>
  );
};

export default DietPlanDisplay;