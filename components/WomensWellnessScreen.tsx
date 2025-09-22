import React from 'react';

// Reusable Feature Card Component
const FeatureCard: React.FC<{
  icon: string;
  title: string;
  description: string;
  tag?: string;
  onClick: () => void;
}> = ({ icon, title, description, tag, onClick }) => (
  <button
    onClick={onClick}
    className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-start text-left transition-transform transform hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 w-full h-full"
  >
    <div className="flex justify-between items-start w-full">
        <div className="w-16 h-16 bg-light rounded-full flex items-center justify-center mb-4 text-3xl">
          {icon}
        </div>
        {tag && <span className="text-xs font-semibold bg-pink-100 text-pink-700 px-2 py-1 rounded-full">{tag}</span>}
    </div>
    <h3 className="text-xl font-bold text-dark mb-2">{title}</h3>
    <p className="text-gray-500 mt-2 flex-grow">{description}</p>
    <div className="bg-primary text-white font-bold py-2 px-6 rounded-lg mt-6 inline-block self-start">
        Explore
    </div>
  </button>
);


const womensWellnessFeatures = [
    {
        icon: '🩸',
        title: 'Menstrual Cycle Care',
        description: 'Track your cycle, understand your phases, and get personalized Ayurvedic tips for comfort and balance.',
    },
    {
        icon: '⚖️',
        title: 'Hormonal Health',
        description: 'Find natural remedies and lifestyle advice for conditions like PCOS and menopause.',
    },
    {
        icon: '🤰',
        title: 'Pregnancy & Postnatal',
        description: 'Nurturing guidance through every trimester and postpartum recovery with safe, gentle care.',
        tag: 'New'
    },
    {
        icon: '💕',
        title: 'Emotional Wellness',
        description: 'Check in with your mood, practice mindfulness, and find calm with guided breathing exercises.',
    },
    {
        icon: '💅',
        title: 'Ayurvedic Self-Care',
        description: 'Discover personalized beauty routines for your skin and hair based on your unique dosha.',
    },
    {
        icon: '👭',
        title: 'Community & Learning',
        description: 'Connect with other women in a safe space and learn from experts in live Q&A sessions.',
    },
];

interface WomensWellnessScreenProps {
  onBack: () => void;
  setScreen: (screen: string) => void;
}

const WomensWellnessScreen: React.FC<WomensWellnessScreenProps> = ({ onBack, setScreen }) => {
    
  const handleFeatureClick = (title: string) => {
    if (title === 'Menstrual Cycle Care') {
      setScreen('menstrualCycleCare');
    } else {
      alert(`The "${title}" feature is coming soon! Stay tuned for more empowering tools. ✨`);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto animate-fadeIn">
        <div className="relative text-center mb-12">
            <button onClick={onBack} className="absolute top-1/2 left-0 -translate-y-1/2 text-primary font-semibold hover:text-secondary flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                Back
            </button>
            <h2 className="text-4xl font-bold text-dark">Women's Wellness 🌸</h2>
            <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
                A supportive space designed for you, with Ayurvedic wisdom to nurture your well-being at every stage of life.
            </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {womensWellnessFeatures.map((feature) => (
                <FeatureCard
                    key={feature.title}
                    icon={feature.icon}
                    title={feature.title}
                    description={feature.description}
                    tag={feature.tag}
                    onClick={() => handleFeatureClick(feature.title)}
                />
            ))}
        </div>

        <div className="mt-16 text-center bg-white p-8 rounded-2xl shadow-lg border border-primary/20">
            <h3 className="text-2xl font-bold text-dark">Your Privacy Matters 🫶</h3>
            <p className="text-gray-600 mt-2 max-w-xl mx-auto">
                All sensitive data is optional and managed with a clear opt-in. This is your safe and private wellness sanctuary.
            </p>
        </div>
    </div>
  );
};

// Add fade-in animation to tailwind config or a style tag if not present
const style = document.createElement('style');
style.innerHTML = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
        animation: fadeIn 0.7s ease-in-out forwards;
    }
`;
document.head.appendChild(style);


export default WomensWellnessScreen;