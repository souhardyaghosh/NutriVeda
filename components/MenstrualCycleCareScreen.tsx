import React, { useState, useEffect } from 'react';
import { getMenstrualCycleAdvice } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

// Types
type CyclePhase = 'Menstrual' | 'Follicular' | 'Ovulation' | 'Luteal';
interface Advice {
  phaseName: string;
  dailyTips: string[];
  remedy: {
    type: 'Herbal Tea' | 'Yoga Pose';
    name: string;
    description: string;
  };
  affirmation: string;
}

// UI Constants
const PHASE_DATA = {
  Menstrual: { icon: '🩸', color: 'bg-red-100', textColor: 'text-red-800', borderColor: 'border-red-300' },
  Follicular: { icon: '🌱', color: 'bg-green-100', textColor: 'text-green-800', borderColor: 'border-green-300' },
  Ovulation: { icon: '🌸', color: 'bg-pink-100', textColor: 'text-pink-800', borderColor: 'border-pink-300' },
  Luteal: { icon: '🌙', color: 'bg-indigo-100', textColor: 'text-indigo-800', borderColor: 'border-indigo-300' },
};
const SYMPTOMS = ['Cramps', 'Fatigue', 'Mood Swings', 'Cravings', 'Bloating', 'None'];

// Dummy Dosha Chart Component
const DoshaChart: React.FC<{ phase: CyclePhase }> = ({ phase }) => {
  const data = {
    Menstrual: { vata: 60, pitta: 20, kapha: 20, note: 'Vata is elevated, leading to dryness and movement.' },
    Follicular: { vata: 30, pitta: 30, kapha: 40, note: 'Kapha dominates, supporting rebuilding and growth.' },
    Ovulation: { vata: 20, pitta: 50, kapha: 30, note: 'Pitta peaks, increasing heat and intensity.' },
    Luteal: { vata: 40, pitta: 40, kapha: 20, note: 'Pitta remains high, can lead to pre-menstrual symptoms.' }
  };
  const phaseData = data[phase];
  const doshas = [
      { name: 'Vata 🌬️', value: phaseData.vata, color: 'bg-blue-300' },
      { name: 'Pitta 🔥', value: phaseData.pitta, color: 'bg-red-400' },
      { name: 'Kapha 🌊', value: phaseData.kapha, color: 'bg-green-400' }
  ];

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm">
        <h4 className="font-bold text-dark mb-3 text-center">Typical Dosha Fluctuation</h4>
        <div className="space-y-2">
            {doshas.map(d => (
                <div key={d.name}>
                    <div className="flex justify-between mb-1 text-sm font-medium text-gray-600">
                        <span>{d.name}</span>
                        <span>{d.value}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className={`${d.color} h-2.5 rounded-full`} style={{ width: `${d.value}%` }}></div>
                    </div>
                </div>
            ))}
        </div>
        <p className="text-xs text-center text-gray-500 mt-3 italic">{phaseData.note}</p>
    </div>
  );
};


// Main Component
const MenstrualCycleCareScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [currentPhase, setCurrentPhase] = useState<CyclePhase>('Menstrual');
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [advice, setAdvice] = useState<Advice | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Dummy logic to assign a phase based on the day of the month
    useEffect(() => {
        if (selectedDate) {
            const day = selectedDate.getDate();
            if (day <= 5) setCurrentPhase('Menstrual');
            else if (day <= 13) setCurrentPhase('Follicular');
            else if (day <= 16) setCurrentPhase('Ovulation');
            else setCurrentPhase('Luteal');
        }
    }, [selectedDate]);

    const handleSymptomToggle = (symptom: string) => {
        if (symptom === 'None') {
            setSelectedSymptoms(prev => prev.includes('None') ? [] : ['None']);
            return;
        }
        setSelectedSymptoms(prev => {
            const withoutNone = prev.filter(s => s !== 'None');
            if (withoutNone.includes(symptom)) {
                return withoutNone.filter(s => s !== symptom);
            } else {
                return [...withoutNone, symptom];
            }
        });
    };

    const handleGenerate = async () => {
        if (!selectedDate) return;
        setIsLoading(true);
        setError(null);
        setAdvice(null);
        try {
            const result = await getMenstrualCycleAdvice(currentPhase, selectedSymptoms.includes('None') ? [] : selectedSymptoms);
            setAdvice(result);
        } catch (err) {
            setError('Sorry, we could not fetch your personalized guide. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const renderCalendar = () => {
        const today = new Date();
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

        const getPhaseForDay = (day: number): CyclePhase => {
            if (day <= 5) return 'Menstrual';
            if (day <= 13) return 'Follicular';
            if (day <= 16) return 'Ovulation';
            return 'Luteal';
        };

        return (
            <div className="grid grid-cols-7 gap-2">
                {days.map(day => {
                    const date = new Date(today.getFullYear(), today.getMonth(), day);
                    const phase = getPhaseForDay(day);
                    const isSelected = selectedDate?.getDate() === day;
                    return (
                        <button
                            key={day}
                            onClick={() => setSelectedDate(date)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-200 ${
                                isSelected ? `bg-primary text-white scale-110 shadow-lg` : `${PHASE_DATA[phase].color} ${PHASE_DATA[phase].textColor} hover:ring-2 hover:ring-primary`
                            }`}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="w-full max-w-4xl mx-auto animate-fadeIn space-y-8">
            <header className="relative text-center">
                 <button onClick={onBack} className="absolute top-1/2 left-0 -translate-y-1/2 text-primary font-semibold hover:text-secondary flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    Back
                </button>
                <h2 className="text-3xl font-bold text-dark">Menstrual Cycle Care {PHASE_DATA[currentPhase].icon}</h2>
                <p className="text-gray-600 mt-2">Select a day and your symptoms for personalized Ayurvedic guidance.</p>
            </header>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Inputs */}
                <div className="bg-white p-6 rounded-2xl shadow-lg space-y-6">
                    <div>
                        <h3 className="text-xl font-bold text-dark mb-4">1. Select a Day from Your Cycle</h3>
                        {renderCalendar()}
                    </div>
                     <div>
                        <h3 className="text-xl font-bold text-dark mb-4">2. How are you feeling today?</h3>
                        <div className="flex flex-wrap gap-3">
                            {SYMPTOMS.map(symptom => (
                                <button
                                    key={symptom}
                                    onClick={() => handleSymptomToggle(symptom)}
                                    className={`px-4 py-2 rounded-full font-semibold transition-colors text-sm ${
                                        selectedSymptoms.includes(symptom) ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {symptom}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={!selectedDate || isLoading}
                        className="w-full bg-pink-500 text-white font-bold py-3 px-6 text-lg rounded-lg hover:bg-pink-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                    >
                        {isLoading ? 'Generating...' : 'Get My Personal Guide ✨'}
                    </button>
                </div>
                {/* Outputs */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 space-y-6">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                    {error && <div className="text-center text-red-600 font-semibold p-4 bg-red-100 rounded-lg">{error}</div>}
                    {!isLoading && !advice && (
                        <div className="text-center text-gray-500 flex flex-col justify-center items-center h-full">
                            <span className="text-4xl mb-4">🧘‍♀️</span>
                            <h3 className="text-xl font-bold text-dark">Your wellness guide awaits.</h3>
                            <p>Fill in your details to the left to receive your tips.</p>
                        </div>
                    )}
                    {advice && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className={`p-4 rounded-xl text-center border-2 ${PHASE_DATA[currentPhase].borderColor} ${PHASE_DATA[currentPhase].color}`}>
                                <h3 className={`text-2xl font-bold ${PHASE_DATA[currentPhase].textColor}`}>{PHASE_DATA[currentPhase].icon} {advice.phaseName}</h3>
                            </div>
                            
                            <div>
                                <h4 className="font-bold text-dark mb-2">🌿 Daily Tips</h4>
                                <ul className="list-disc list-inside space-y-1 text-gray-700 bg-white/50 p-4 rounded-lg">
                                    {advice.dailyTips.map((tip, i) => <li key={i}>{tip}</li>)}
                                </ul>
                            </div>

                             <div>
                                <h4 className="font-bold text-dark mb-2">{advice.remedy.type === 'Herbal Tea' ? '🍵' : '🤸‍♀️'} {advice.remedy.name}</h4>
                                <div className="bg-white/50 p-4 rounded-lg">
                                    <p className="text-gray-700">{advice.remedy.description}</p>
                                </div>
                            </div>
                            
                            <DoshaChart phase={currentPhase} />
                            
                            <div className="text-center bg-gradient-to-r from-purple-200 to-pink-200 p-4 rounded-xl shadow-inner">
                                <p className="font-semibold text-purple-800 italic">"{advice.affirmation}"</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MenstrualCycleCareScreen;
