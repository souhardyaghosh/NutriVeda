import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import DietPlanDisplay from './components/DietPlanDisplay';
import CheatDayHelper from './components/CheatDayHelper';
import LoadingSpinner from './components/LoadingSpinner';
import { UserData, DietPlan, DailyPlan, Meal, FamilyMember, FoodAnalysis, MoodAnalysisResult, WellnessData, MoodInputType } from './types';
import { generateDietPlan, analyzeFoodImage, analyzeMood } from './services/geminiService';
import { dummyPlans, familyMembers } from './dummyData';
import { GENDERS, ACTIVITY_LEVELS, DIETARY_PREFERENCES, DIETARY_RESTRICTIONS, HEALTH_GOALS, SPICE_LEVELS, SWEETNESS_LEVELS, MEAL_TIMINGS, EATING_OUT_FREQUENCY } from './constants';
import DonutChart from './components/DonutChart';
import MoodTrackerScreen from './components/MoodTrackerScreen';
import CameraView from './components/CameraView';

// --- Reusable UI Components ---
const OnboardingCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="w-full max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-xl transition-all duration-500">
    {children}
  </div>
);

const ProgressTracker: React.FC<{ currentStep: number; totalSteps: number }> = ({ currentStep, totalSteps }) => {
  const progress = Math.max(0, (currentStep / totalSteps) * 100);
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-8">
      <div className="bg-primary h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
    </div>
  );
};

const NavButtons: React.FC<{ onBack: () => void; onNext: () => void; nextDisabled?: boolean; nextText?: string }> = ({ onBack, onNext, nextDisabled = false, nextText = 'Next' }) => (
  <div className="flex justify-between mt-10">
    <button onClick={onBack} className="bg-gray-200 text-gray-700 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors">
      Back
    </button>
    <button onClick={onNext} disabled={nextDisabled} className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-secondary transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
      {nextText}
    </button>
  </div>
);

const BackButton: React.FC<{ onClick: () => void; className?: string }> = ({ onClick, className }) => (
    <button onClick={onClick} className={`absolute -top-4 -left-4 text-gray-500 hover:text-dark font-semibold flex items-center gap-1 z-10 ${className}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        Back
    </button>
);


// --- SVG Icons ---
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary mb-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>;
const FamilyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary mb-4" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>;
const FemaleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-current" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 10c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>;
const MaleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-current" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 10c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>;
const OtherIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-current" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 10c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>;
const GENDER_ICONS = { Female: <FemaleIcon />, Male: <MaleIcon />, Other: <OtherIcon /> };

// --- Onboarding Screens ---

const WelcomeScreen: React.FC<{ setScreen: (screen: string) => void }> = ({ setScreen }) => {
  const FeatureCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    buttonText: string;
    onClick: () => void;
  }> = ({ icon, title, description, buttonText, onClick }) => (
    <div onClick={onClick} className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-start text-left transition-transform transform hover:-translate-y-1 cursor-pointer">
      <div className="w-16 h-16 bg-light rounded-full flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-dark mb-2">{title}</h3>
      <p className="text-gray-500 mt-2 flex-grow">{description}</p>
      <div className="bg-primary text-white font-bold py-2 px-6 rounded-lg mt-6 inline-block">
        {buttonText}
      </div>
    </div>
  );
  
  const iconStyle = "text-3xl";

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-dark mb-2">
          Your intelligent partner for holistic wellness. 🌿
        </h2>
        <p className="text-gray-600">What would you like to do today?</p>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <FeatureCard
          icon={<span className={iconStyle}>🥗</span>}
          title="AI Diet Planner"
          description="Generate a personalized diet plan for yourself or family, tailored to your unique goals and lifestyle."
          buttonText="Create a Plan"
          onClick={() => setScreen('planType')}
        />
        <FeatureCard
          icon={<span className={iconStyle}>📸</span>}
          title="Ayurvedic Food Scanner"
          description="Snap a photo of your meal to instantly get a detailed Ayurvedic analysis of its properties and effects."
          buttonText="Scan My Food"
          onClick={() => setScreen('foodScanner')}
        />
        <FeatureCard
          icon={<span className={iconStyle}>🧘‍♀️</span>}
          title="Mood Tracker"
          description="Analyze your mood via selfie, voice, or chat to understand your dosha balance and get personalized advice."
          buttonText="Track My Mood"
          onClick={() => setScreen('moodTracker')}
        />
        <FeatureCard
          icon={<span className={iconStyle}>🌸</span>}
          title="Women's Wellness"
          description="Track your cycle, get personalized insights, and find Ayurvedic remedies for hormonal balance."
          buttonText="Get Started"
          onClick={() => setScreen('womensWellness')}
        />
      </div>
    </div>
  );
};

const PlanTypeScreen: React.FC<{ setScreen: (screen: string) => void; updateData: (data: Partial<UserData>) => void; onBack: () => void; }> = ({ setScreen, updateData, onBack }) => (
  <OnboardingCard>
    <div className="relative">
      <BackButton onClick={onBack} />
      <div className="text-center">
        <h2 className="text-3xl font-bold text-dark mb-2">Welcome!</h2>
        <p className="text-gray-600 mb-8">Who is this diet plan for? Let's get started by choosing an option below.</p>
        <div className="grid md:grid-cols-2 gap-6">
          <button onClick={() => { updateData({ planFor: 'individual' }); setScreen('basics'); }} className="text-center p-6 bg-white rounded-lg border-2 border-gray-200 hover:border-primary transition-all duration-300 transform hover:scale-105">
            <UserIcon />
            <h3 className="text-xl font-bold text-dark">For an Individual</h3>
            <p className="text-gray-500 mt-2">Create a hyper-personalized diet plan tailored to the specific goals and preferences of one person.</p>
            <div className="bg-primary text-white font-bold py-2 px-6 rounded-lg mt-6 inline-block">Start Individual Plan</div>
          </button>
          <button onClick={() => { updateData({ planFor: 'family' }); setScreen('familyProfile'); }} className="text-center p-6 bg-white rounded-lg border-2 border-gray-200 hover:border-primary transition-all duration-300 transform hover:scale-105">
            <FamilyIcon />
            <h3 className="text-xl font-bold text-dark">For the Family</h3>
            <p className="text-gray-500 mt-2">Generate a single, cohesive meal plan that works for the entire family, based on their collective needs.</p>
            <div className="bg-primary text-white font-bold py-2 px-6 rounded-lg mt-6 inline-block">Create Family Plan</div>
          </button>
        </div>
      </div>
    </div>
  </OnboardingCard>
);

const FamilyProfileScreen: React.FC<{
  onGenerate: (members: FamilyMember[]) => void;
  onBack: () => void;
}> = ({ onGenerate, onBack }) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([4]); // Pre-select Rohan Verma as in image

  const toggleSelection = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === familyMembers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(familyMembers.map(m => m.id));
    }
  };

  const handleGenerateClick = () => {
    const selected = familyMembers.filter(m => selectedIds.includes(m.id));
    onGenerate(selected);
  };

  const isSelected = (id: number) => selectedIds.includes(id);

  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-xl relative">
       <BackButton onClick={onBack} />
      <div className="text-center mb-4">
        <h2 className="text-4xl font-bold text-dark">Your Family Profile</h2>
        <p className="text-gray-600 mt-2">Select the family members to include in the unified diet plan.</p>
      </div>

      <div className="text-right mb-6">
        <button onClick={handleSelectAll} className="font-semibold text-primary hover:text-secondary">
          {selectedIds.length === familyMembers.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {familyMembers.map(member => (
          <div
            key={member.id}
            onClick={() => toggleSelection(member.id)}
            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${isSelected(member.id) ? 'border-primary bg-teal-50' : 'bg-white border-gray-200 hover:border-gray-300'}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold text-dark">{member.name}</h3>
                <p className="text-gray-500 mb-4">{member.age}, {member.gender.toLowerCase()}</p>
              </div>
              <div className={`w-6 h-6 rounded-md flex items-center justify-center ${isSelected(member.id) ? 'bg-primary' : 'border-2 border-gray-300'}`}>
                {isSelected(member.id) && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
              </div>
            </div>
            <div className="text-sm space-y-2 text-gray-600">
              <p><span className="font-semibold text-gray-700">Goal:</span> {member.goal}</p>
              <p><span className="font-semibold text-gray-700">Diet:</span> {member.diet}</p>
              {member.restrictions.length > 0 && <p><span className="font-semibold text-gray-700">Restrictions:</span> {member.restrictions.join(', ')}</p>}
              <p><span className="font-semibold text-gray-700">Dislikes:</span> {member.dislikes.join(', ')}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <button
          onClick={handleGenerateClick}
          disabled={selectedIds.length === 0}
          className="bg-primary text-white font-bold py-3 px-12 text-lg rounded-lg shadow-lg hover:bg-secondary transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {selectedIds.length > 0 ? `Generate Plan for ${selectedIds.length} ${selectedIds.length === 1 ? 'Person' : 'People'}` : 'Select a Member'}
        </button>
      </div>
    </div>
  );
};

// --- Food Scanner Screens ---

const FoodScannerScreen: React.FC<{ onAnalyze: (base64: string, mimeType: string) => void; onBack: () => void; setScreen: (screen: string) => void; }> = ({ onAnalyze, onBack, setScreen }) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = (file: File) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    const base64String = reader.result.split(',')[1];
                    onAnalyze(base64String, file.type);
                }
            };
            reader.readAsDataURL(file);
        } else {
            alert('Please select a valid image file (PNG, JPG, WEBP).');
        }
    };

    const handleDragEnter = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) handleFile(files[0]);
    };

    const handleBrowseClick = () => fileInputRef.current?.click();
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) handleFile(files[0]);
    };

    return (
        <div className="w-full max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-bold text-dark">Ayurvedic Food Scanner</h2>
                <button onClick={onBack} className="text-primary font-semibold hover:text-secondary">
                    &larr; Back to Home
                </button>
            </div>
            <p className="text-gray-600 mb-6">Get an instant analysis of your meal.</p>
            <p className="text-center text-gray-500 mb-6">Snap a photo or upload an image to instantly analyze your food.</p>
            
            <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`p-10 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors ${isDragging ? 'border-primary bg-teal-50' : 'border-gray-300 bg-gray-50 hover:border-primary'}`}
                onClick={handleBrowseClick}
            >
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" className="hidden" />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M12 15l-3-3m0 0l3-3m-3 3h12" /></svg>
                <p className="mt-4 text-gray-600">Drop image here or <span className="font-semibold text-primary">browse</span></p>
                <p className="text-sm text-gray-400 mt-1">PNG, JPG, WEBP supported</p>
            </div>
            
            <div className="flex items-center my-6">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-400 font-semibold">OR</span>
                <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <button onClick={() => setScreen('cameraView')} className="w-full bg-primary text-white font-bold py-3 px-6 text-lg rounded-lg hover:bg-secondary transition-colors flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Use Camera
            </button>
        </div>
    );
};

const ProgressBar: React.FC<{ value: number, total: number, color: string }> = ({ value, total, color }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    return (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className={color} style={{ width: `${percentage}%`, height: '100%', borderRadius: 'inherit' }}></div>
        </div>
    );
};

const FoodAnalysisDisplay: React.FC<{ analysis: FoodAnalysis, image: string, onReset: () => void }> = ({ analysis, image, onReset }) => {
    const { foodName, servingSize, calories, macronutrients = { protein: 0, carbs: 0, fat: 0 }, vitamins, minerals, ayurvedicAnalysis } = analysis;
    const totalMacros = macronutrients.protein + macronutrients.carbs + macronutrients.fat;
    const doshaBalance = ayurvedicAnalysis?.doshaBalance || { vata: 34, pitta: 33, kapha: 33 };

    const doshaSegments = [
        { label: 'V', value: doshaBalance.vata, color: '#60A5FA' }, // Blue
        { label: 'P', value: doshaBalance.pitta, color: '#F87171' },  // Red
        { label: 'K', value: doshaBalance.kapha, color: '#34D399' }, // Green
    ];

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="bg-white p-6 rounded-2xl shadow-xl">
                <div className="relative h-64 rounded-xl overflow-hidden mb-6 -mt-12">
                    <img src={image} alt={foodName} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-6">
                        <h2 className="text-4xl font-bold text-white shadow-lg">{foodName}</h2>
                        <p className="text-white/90 mt-1">{servingSize}</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center bg-light p-4 rounded-xl mb-6">
                    <div>
                        <p className="text-sm text-gray-500">Calories</p>
                        <p className="text-3xl font-bold text-dark">{calories}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Protein</p>
                        <p className="text-3xl font-bold text-dark">{macronutrients.protein.toFixed(1)}g</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Carbs</p>
                        <p className="text-3xl font-bold text-dark">{macronutrients.carbs.toFixed(1)}g</p>
                    </div>
                </div>
                
                <h3 className="text-xl font-bold text-dark mb-4">Macronutrients</h3>
                <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-700">Protein</span>
                        <span className="text-gray-600">{macronutrients.protein.toFixed(1)}g</span>
                    </div>
                     <ProgressBar value={macronutrients.protein} total={totalMacros} color="bg-blue-500" />
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-700">Carbohydrates</span>
                        <span className="text-gray-600">{macronutrients.carbs.toFixed(1)}g</span>
                    </div>
                     <ProgressBar value={macronutrients.carbs} total={totalMacros} color="bg-orange-500" />
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-700">Fat</span>
                        <span className="text-gray-600">{macronutrients.fat.toFixed(1)}g</span>
                    </div>
                     <ProgressBar value={macronutrients.fat} total={totalMacros} color="bg-yellow-400" />
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <h3 className="text-xl font-bold text-dark mb-4">Vitamins & Minerals</h3>
                        <div className="h-48 overflow-y-auto pr-2 space-y-3 border rounded-lg p-4 bg-gray-50">
                            {[...(vitamins || []), ...(minerals || [])].map(nutrient => (
                                <div key={nutrient.name} className="flex justify-between items-center text-sm">
                                    <span className="font-semibold text-gray-700">{nutrient.name}</span>
                                    <span className="text-gray-600">{nutrient.amount} ({nutrient.percentDV}%)</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <DonutChart 
                        title="Ayurvedic Balance" 
                        segments={doshaSegments} 
                        centerValue="Doshas" 
                        centerLabel="" 
                    />
                </div>


                <h3 className="text-xl font-bold text-dark mb-4">Ayurvedic Analysis</h3>
                <div className="bg-light p-4 rounded-xl space-y-3">
                     <p><span className="font-semibold text-gray-700">Effect on Body:</span> <span className={`font-bold ${ayurvedicAnalysis.effect === 'Heating' ? 'text-red-600' : 'text-blue-600'}`}>{ayurvedicAnalysis.effect}</span></p>
                     <p><span className="font-semibold text-gray-700">Dominant Tastes:</span> {ayurvedicAnalysis.tastes.join(', ')}</p>
                     <p><span className="font-semibold text-gray-700">Primary Qualities:</span> {ayurvedicAnalysis.qualities.join(', ')}</p>
                     <p className="text-gray-600 text-sm pt-2 border-t mt-3">{ayurvedicAnalysis.summary}</p>
                </div>
            </div>
            <div className="text-center mt-8">
                <button onClick={onReset} className="bg-primary text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-secondary transition-colors">
                    Scan Another Meal
                </button>
            </div>
        </div>
    );
};


const OnboardingStep: React.FC<{title: string; subtitle?: string; children: React.ReactNode; currentStep: number; totalSteps: number; onBack: () => void; onNext: () => void; nextDisabled?: boolean; nextText?: string;}> = ({ title, subtitle, children, currentStep, totalSteps, onBack, onNext, nextDisabled, nextText }) => (
    <OnboardingCard>
        <ProgressTracker currentStep={currentStep} totalSteps={totalSteps} />
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-dark">{title}</h2>
            {subtitle && <p className="text-gray-600 mt-2">{subtitle}</p>}
        </div>
        <div className="space-y-6">{children}</div>
        <NavButtons onBack={onBack} onNext={onNext} nextDisabled={nextDisabled} nextText={nextText} />
    </OnboardingCard>
);

const GenerationChoiceScreen: React.FC<{onQuick: () => void; onAdvanced: () => void; onBack: () => void;}> = ({ onQuick, onAdvanced, onBack }) => (
    <OnboardingCard>
        <div className="relative">
             <BackButton onClick={onBack} />
            <ProgressTracker currentStep={7} totalSteps={7} />
            <div className="text-center">
                <h2 className="text-3xl font-bold text-dark mb-2">Ready to Generate!</h2>
                <p className="text-gray-600 mb-8">Choose your generation method. The advanced AI provides a deeply personalized plan but takes a moment to create.</p>
                <div className="space-y-6">
                     <button onClick={onQuick} className="w-full text-center p-6 bg-white rounded-lg border-2 border-gray-200 hover:border-primary transition-all duration-300 transform hover:scale-105">
                        <h3 className="text-xl font-bold text-dark">⚡ Quick Generation</h3>
                        <p className="text-gray-500 mt-2">Instantly receive a balanced, sample diet plan to see how it works.</p>
                        <div className="bg-secondary text-white font-bold py-2 px-6 rounded-lg mt-6 inline-block">Get Instant Plan</div>
                    </button>
                     <button onClick={onAdvanced} className="w-full text-center p-6 bg-white rounded-lg border-2 border-gray-200 hover:border-primary transition-all duration-300 transform hover:scale-105">
                        <h3 className="text-xl font-bold text-dark">🧠 Advanced AI Generation</h3>
                        <p className="text-gray-500 mt-2">Our AI will craft a unique plan based on all your inputs. (May take up to a minute)</p>
                         <div className="bg-primary text-white font-bold py-2 px-6 rounded-lg mt-6 inline-block">Generate My Personal Plan</div>
                    </button>
                </div>
            </div>
        </div>
    </OnboardingCard>
);

const ComingSoonScreen: React.FC<{ title: string; onBack: () => void }> = ({ title, onBack }) => (
  <OnboardingCard>
    <div className="text-center p-8">
      <span className="text-6xl mb-4 inline-block">🚧</span>
      <h2 className="text-3xl font-bold text-dark mb-2">{title}</h2>
      <p className="text-gray-600 mb-8">This feature is under construction. Stay tuned!</p>
      <button onClick={onBack} className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-secondary transition-colors">
        Back to Home
      </button>
    </div>
  </OnboardingCard>
);

const App: React.FC = () => {
  const TOTAL_STEPS = 7;
  const [screen, setScreen] = useState('welcome');
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Crafting Your Perfect Plan...');
  const [error, setError] = useState<string | null>(null);
  const [selectedFamilyMembers, setSelectedFamilyMembers] = useState<FamilyMember[]>([]);
  // Food scanner state
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [foodAnalysisResult, setFoodAnalysisResult] = useState<FoodAnalysis | null>(null);
  
  // Mood tracker state
  const [moodAnalysisResult, setMoodAnalysisResult] = useState<MoodAnalysisResult | null>(null);


  const [userData, setUserData] = useState<UserData>({
    planFor: 'individual',
    age: 30,
    gender: 'Female',
    height: 165,
    weight: 60,
    activityLevel: 'Moderately Active',
    dietaryPreference: 'Vegetarian',
    dietaryRestrictions: [],
    healthGoals: ['Weight Loss'],
    spiceLevel: 'Medium',
    sweetnessLevel: 'Medium',
    mealHabits: {
      breakfastTime: 'Regular',
      lunchTime: 'Standard',
      dinnerTime: 'Standard',
      eatingOutFrequency: 'Rarely',
      familyFriendly: 'No',
    }
  });

  const updateData = (data: Partial<UserData>) => {
    setUserData(prev => ({ ...prev, ...data }));
  };

  const updateMealHabits = (data: Partial<UserData['mealHabits']>) => {
    setUserData(prev => ({ ...prev, mealHabits: { ...prev.mealHabits, ...data }}));
  }

  const handleMultiSelect = (field: keyof UserData, value: string) => {
    const currentValues = userData[field] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(item => item !== value)
      : [...currentValues, value];
    updateData({ [field]: newValues });
  };
  
  const handleStartFamilyPlan = (members: FamilyMember[]) => {
    updateData({ planFor: 'family' });
    setSelectedFamilyMembers(members);
    setScreen('generationChoice');
  };

  const handleGeneratePlan = async () => {
    setScreen('loading');
    setIsLoading(true);
    setError(null);
    setLoadingMessage('Crafting Your Perfect Plan...');

    const messages = [
        "Analyzing your profile...",
        "Consulting our AI nutritionists...",
        "Balancing macronutrients...",
        "Considering Ayurvedic principles...",
        "Finalizing your 7-day plan...",
    ];
    let messageIndex = 0;
    const interval = setInterval(() => {
        setLoadingMessage(messages[messageIndex]);
        messageIndex = (messageIndex + 1) % messages.length;
    }, 2500);

    try {
      const plan = userData.planFor === 'family' ? await generateDietPlan(selectedFamilyMembers) : await generateDietPlan(userData);
      setDietPlan(plan);
      setScreen('results');
    } catch (err) {
      setError('There was an error generating your diet plan. Please try again.');
      setScreen('error');
      console.error(err);
    } finally {
      clearInterval(interval);
      setIsLoading(false);
    }
  };

   const handleAnalyzeImage = async (base64ImageData: string, mimeType: string) => {
    setScannedImage(`data:${mimeType};base64,${base64ImageData}`);
    setScreen('loading');
    setIsLoading(true);
    setError(null);
    setLoadingMessage('Analyzing your meal...');
    
    try {
      const result = await analyzeFoodImage(base64ImageData, mimeType);
      setFoodAnalysisResult(result);
      setScreen('foodScannerResults');
    } catch (err) {
      console.error(err);
      setError("We couldn't analyze your image. Please try again with a clear photo.");
      setScreen('error');
    } finally {
      setIsLoading(false);
    }
  };

   const handleAnalyzeMood = async (inputType: MoodInputType, inputData: string, wellnessData: WellnessData, mimeType?: string) => {
    setIsLoading(true);
    setError(null);
    setMoodAnalysisResult(null);
    setLoadingMessage('Analyzing your mood...');
    
    try {
      const result = await analyzeMood(inputType, inputData, wellnessData, mimeType);
      setMoodAnalysisResult(result);
    } catch (err) {
      console.error(err);
      setError("We couldn't analyze your mood. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  
  const handleQuickGenerate = () => {
    let plan;
    if (userData.planFor === 'family') {
        plan = dummyPlans['Family'];
    } else {
        const key = userData.dietaryPreference as keyof typeof dummyPlans;
        plan = dummyPlans[key] || dummyPlans['Vegetarian'];
    }
    setDietPlan(plan);
    setScreen('results');
  };

  const handleUpdateMeal = (dayIndex: number, mealType: keyof DailyPlan['meals'], newMeal: Meal) => {
    if (!dietPlan) return;

    const newDietPlan = JSON.parse(JSON.stringify(dietPlan));
    
    const dayToUpdate = newDietPlan.dailyPlans[dayIndex];
    const oldMeal = dayToUpdate.meals[mealType];

    dayToUpdate.totalCalories = dayToUpdate.totalCalories - oldMeal.calories + newMeal.calories;
    
    dayToUpdate.meals[mealType] = newMeal;

    setDietPlan(newDietPlan);
  };

  const handleReset = () => {
    setScreen('welcome');
    setDietPlan(null);
    setFoodAnalysisResult(null);
    setScannedImage(null);
    setMoodAnalysisResult(null);
    setError(null);
  }

  const renderContent = () => {
    switch (screen) {
      case 'welcome':
        return <WelcomeScreen setScreen={setScreen} />;
      case 'planType':
        return <PlanTypeScreen setScreen={setScreen} updateData={updateData} onBack={() => setScreen('welcome')} />;
      
      case 'familyProfile':
          return <FamilyProfileScreen onGenerate={handleStartFamilyPlan} onBack={() => setScreen('planType')} />;

      case 'foodScanner':
        return <FoodScannerScreen onAnalyze={handleAnalyzeImage} onBack={handleReset} setScreen={setScreen} />;

      case 'cameraView':
        return <CameraView onCapture={handleAnalyzeImage} onBack={() => setScreen('foodScanner')} facingMode="environment" />;
      
      case 'foodScannerResults':
        if (foodAnalysisResult && scannedImage) {
            return <FoodAnalysisDisplay analysis={foodAnalysisResult} image={scannedImage} onReset={() => setScreen('foodScanner')} />
        }
        // Fallback or error view could go here
        return <FoodScannerScreen onAnalyze={handleAnalyzeImage} onBack={handleReset} setScreen={setScreen}/>;

      case 'moodTracker':
        return (
          <MoodTrackerScreen
            onAnalyze={handleAnalyzeMood}
            result={moodAnalysisResult}
            isLoading={isLoading}
            error={error}
            onBack={handleReset}
            onRetry={() => {
              setError(null);
              setMoodAnalysisResult(null);
            }}
          />
        );
      
      case 'womensWellness':
        return <ComingSoonScreen title="Women's Wellness" onBack={handleReset} />;

      case 'basics':
        return (
            <OnboardingStep title="Let's start with the basics" currentStep={1} totalSteps={TOTAL_STEPS} onBack={() => setScreen('planType')} onNext={() => setScreen('physicalProfile')}>
                <div>
                    <label htmlFor="age" className="block text-lg font-medium text-gray-700 mb-2">Age</label>
                    <div className="flex items-center gap-4">
                        <input type="range" id="age" min="18" max="100" value={userData.age} onChange={e => updateData({ age: parseInt(e.target.value) })} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                        <span className="font-bold text-primary text-lg w-8 text-center">{userData.age}</span>
                    </div>
                </div>
                <div>
                    <label className="block text-lg font-medium text-gray-700 mb-3">Gender</label>
                    <div className="grid grid-cols-3 gap-4">
                        {GENDERS.map(gender => (
                            <button key={gender} onClick={() => updateData({ gender })} className={`flex flex-col items-center p-4 rounded-lg border-2 transition-colors ${userData.gender === gender ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-200 hover:border-primary'}`}>
                                {GENDER_ICONS[gender]}
                                <span className="font-semibold mt-2">{gender}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </OnboardingStep>
        );

    case 'physicalProfile':
        return (
            <OnboardingStep title="Your Physical Profile" currentStep={2} totalSteps={TOTAL_STEPS} onBack={() => setScreen('basics')} onNext={() => setScreen('dietaryPreferences')}>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="height" className="block text-lg font-medium text-gray-700">Height (cm)</label>
                        <input type="number" id="height" value={userData.height} onChange={e => updateData({ height: parseInt(e.target.value) || 0 })} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                    </div>
                    <div>
                        <label htmlFor="weight" className="block text-lg font-medium text-gray-700">Weight (kg)</label>
                        <input type="number" id="weight" value={userData.weight} onChange={e => updateData({ weight: parseInt(e.target.value) || 0 })} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                    </div>
                </div>
                 <div>
                    <label className="block text-lg font-medium text-gray-700 mb-3">Activity Level</label>
                    <div className="space-y-3">
                        {ACTIVITY_LEVELS.map(level => (
                             <button key={level.name} onClick={() => updateData({ activityLevel: level.name })} className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${userData.activityLevel === level.name ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-200 hover:border-primary'}`}>
                                <p className="font-bold">{level.name}</p>
                                <p className="text-sm">{level.description}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </OnboardingStep>
        );
    
    case 'dietaryPreferences':
        return (
            <OnboardingStep title="Your Dietary Preferences" currentStep={3} totalSteps={TOTAL_STEPS} onBack={() => setScreen('physicalProfile')} onNext={() => setScreen('goals')}>
                 <div className="space-y-3">
                    {DIETARY_PREFERENCES.map(pref => (
                         <button key={pref.name} onClick={() => updateData({ dietaryPreference: pref.name })} className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${userData.dietaryPreference === pref.name ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-200 hover:border-primary'}`}>
                            <p className="font-bold">{pref.name}</p>
                            <p className="text-sm">{pref.description}</p>
                        </button>
                    ))}
                </div>
            </OnboardingStep>
        );

    case 'goals':
        return (
            <OnboardingStep title="Health & Wellness Goals" currentStep={4} totalSteps={TOTAL_STEPS} onBack={() => setScreen('dietaryPreferences')} onNext={() => setScreen('tasteProfile')} nextDisabled={userData.healthGoals.length === 0}>
                <div>
                    <label className="block text-lg font-medium text-gray-700 mb-3">Do you have any of these dietary restrictions?</label>
                    <div className="flex flex-wrap gap-3">
                        {DIETARY_RESTRICTIONS.map(r => (
                            <button key={r} onClick={() => handleMultiSelect('dietaryRestrictions', r)} className={`px-4 py-2 rounded-full font-semibold transition-colors ${userData.dietaryRestrictions.includes(r) ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>{r}</button>
                        ))}
                    </div>
                </div>
                 <div>
                    <label className="block text-lg font-medium text-gray-700 mb-3">What are your primary health goals?</label>
                    <div className="flex flex-wrap gap-3">
                        {HEALTH_GOALS.map(g => (
                            <button key={g} onClick={() => handleMultiSelect('healthGoals', g)} className={`px-4 py-2 rounded-full font-semibold transition-colors ${userData.healthGoals.includes(g) ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>{g}</button>
                        ))}
                    </div>
                </div>
            </OnboardingStep>
        );

    case 'tasteProfile':
         return (
            <OnboardingStep title="What's Your Taste Profile? (Optional)" subtitle="Help us find flavors you'll love." currentStep={5} totalSteps={TOTAL_STEPS} onBack={() => setScreen('goals')} onNext={() => setScreen('mealHabits')}>
                <div>
                    <label className="block text-lg font-medium text-gray-700 mb-3 text-center">Spice Level Preference</label>
                    <div className="grid grid-cols-3 gap-4">
                        {SPICE_LEVELS.map(level => (
                            <button key={level} onClick={() => updateData({ spiceLevel: level })} className={`p-4 rounded-lg border-2 transition-colors font-semibold ${userData.spiceLevel === level ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-200 hover:border-primary'}`}>{level}</button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-lg font-medium text-gray-700 mb-3 text-center">Sweetness Preference</label>
                    <div className="grid grid-cols-3 gap-4">
                        {SWEETNESS_LEVELS.map(level => (
                            <button key={level} onClick={() => updateData({ sweetnessLevel: level })} className={`p-4 rounded-lg border-2 transition-colors font-semibold ${userData.sweetnessLevel === level ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-200 hover:border-primary'}`}>{level}</button>
                        ))}
                    </div>
                </div>
            </OnboardingStep>
        );
    
    case 'mealHabits':
        return (
             <OnboardingStep title="Meal & Social Habits (Optional)" subtitle="Tell us about your eating patterns." currentStep={6} totalSteps={TOTAL_STEPS} onBack={() => setScreen('tasteProfile')} onNext={() => setScreen('generationChoice')} nextText="Next">
                <div>
                    <label className="block text-lg font-medium text-gray-700 mb-3">Typical Meal Timings</label>
                    <div className="space-y-4">
                        {Object.entries(MEAL_TIMINGS).map(([mealType, timings]) => (
                             <div key={mealType}>
                                <h4 className="font-semibold capitalize text-gray-600 mb-2">{mealType}</h4>
                                <div className="grid grid-cols-3 gap-2">
                                    {timings.map(timing => (
                                        <button key={timing.name} onClick={() => updateMealHabits({ [`${mealType}Time`]: timing.name })} className={`p-2 text-center rounded-lg border-2 transition-colors font-semibold ${userData.mealHabits[`${mealType}Time`] === timing.name ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-200 hover:border-primary'}`}>
                                            <span className="block text-sm">{timing.name}</span>
                                            <span className="block text-xs text-gray-500">{timing.time}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-lg font-medium text-gray-700 mb-3">How often do you eat out?</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                         {EATING_OUT_FREQUENCY.map(freq => (
                            <button key={freq.name} onClick={() => updateMealHabits({ eatingOutFrequency: freq.name })} className={`p-3 text-center rounded-lg border-2 transition-colors font-semibold ${userData.mealHabits.eatingOutFrequency === freq.name ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-200 hover:border-primary'}`}>
                                {freq.name}
                            </button>
                         ))}
                    </div>
                </div>
                 <div>
                    <label className="block text-lg font-medium text-gray-700 mb-3">Do you need family-friendly meals?</label>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => updateMealHabits({ familyFriendly: 'Yes' })} className={`flex flex-col items-center p-4 rounded-lg border-2 transition-colors ${userData.mealHabits.familyFriendly === 'Yes' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-200 hover:border-primary'}`}>
                            <FamilyIcon /> Yes
                        </button>
                        <button onClick={() => updateMealHabits({ familyFriendly: 'No' })} className={`flex flex-col items-center p-4 rounded-lg border-2 transition-colors ${userData.mealHabits.familyFriendly === 'No' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-200 hover:border-primary'}`}>
                            <UserIcon /> No
                        </button>
                    </div>
                </div>
            </OnboardingStep>
        );

      case 'generationChoice':
          const backScreen = userData.planFor === 'family' ? 'familyProfile' : 'mealHabits';
          return <GenerationChoiceScreen onQuick={handleQuickGenerate} onAdvanced={handleGeneratePlan} onBack={() => setScreen(backScreen)} />;

      case 'loading':
        return (
          <OnboardingCard>
            <div className="text-center p-12">
              <h2 className="text-2xl font-bold text-dark mb-4">{loadingMessage}</h2>
              <p className="text-gray-600 mb-6">Our AI is working its magic. This can take up to a minute.</p>
              <LoadingSpinner />
            </div>
          </OnboardingCard>
        );
      
      case 'error':
        return (
          <OnboardingCard>
            <div className="text-center p-12 bg-red-50 rounded-2xl border border-red-200">
              <h2 className="text-2xl font-bold text-red-700 mb-4">Oops! Something went wrong.</h2>
              <p className="text-red-600 mb-6">{error}</p>
              <button onClick={handleReset} className="bg-red-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-600 transition-colors">
                Try Again
              </button>
            </div>
          </OnboardingCard>
        );

      case 'results':
        if (dietPlan) {
          return (
            <>
              <DietPlanDisplay 
                plan={dietPlan} 
                userData={userData}
                onUpdateMeal={handleUpdateMeal}
                onReset={handleReset} 
              />
              <CheatDayHelper />
            </>
          );
        }
        return null;

      default:
        return <WelcomeScreen setScreen={setScreen} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header onHomeClick={handleReset} />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center">
            {renderContent()}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
