
import React, { useState, useRef, useEffect } from 'react';
import { MoodAnalysisResult, WellnessData, MoodInputType, DoshaBalance } from '../types';
import LoadingSpinner from './LoadingSpinner';
import CameraView from './CameraView';

// --- Reusable UI Components ---
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white p-6 rounded-2xl shadow-sm ${className}`}>
    {children}
  </div>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="text-xl font-bold text-dark mb-4">{children}</h3>
);

// --- SVG Icons ---
const CameraIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const MicIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-14 0m7 6v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>;
const ChatIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
const ChartIcon: React.FC<{className?: string}> = ({className}) => <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_4_2)"><path d="M5.25 2.25H2.25V5.25H5.25V2.25Z" fill="#34D399"></path><path d="M5.25 6.75H2.25V9.75H5.25V6.75Z" fill="#FBBF24"></path><path d="M5.25 11.25H2.25V14.25H5.25V11.25Z" fill="#F87171"></path><path d="M5.25 15.75H2.25V18.75H5.25V15.75Z" fill="#60A5FA"></path><path d="M6.75 20.25V3.75C6.75 3.45435 6.86853 3.17064 7.0795 2.95967C7.29048 2.7487 7.57419 2.63013 7.86975 2.63013H21.375" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M9.75 20.25V15.75C9.75 15.4544 9.86853 15.1706 10.0795 14.9597C10.2905 14.7487 10.5742 14.6301 10.8697 14.6301H12.3697C12.6653 14.6301 12.949 14.7487 13.1599 14.9597C13.3709 15.1706 13.4894 15.4544 13.4894 15.75V20.25" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M15.75 20.25V11.25C15.75 10.9544 15.8685 10.6706 16.0795 10.4597C16.2905 10.2487 16.5742 10.1301 16.8697 10.1301H18.3697C18.6653 10.1301 18.949 10.2487 19.1599 10.4597C19.3709 10.6706 19.4894 10.9544 19.4894 11.25V20.25" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></g><defs><clipPath id="clip0_4_2"><rect width="24" height="24" fill="white"></rect></clipPath></defs></svg>;

// --- Input Stage Components ---
interface MoodInputProps {
  onAnalyze: (type: MoodInputType, data: string, mime?: string) => void;
  onOpenCamera: () => void;
}

const MoodInput: React.FC<MoodInputProps> = ({ onAnalyze, onOpenCamera }) => {
    const [activeTab, setActiveTab] = useState<MoodInputType>('selfie');
    const [chatInput, setChatInput] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = (file: File) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    const base64String = reader.result.split(',')[1];
                    onAnalyze('selfie', base64String, file.type);
                }
            };
            reader.readAsDataURL(file);
        } else {
             alert('Please select a valid image file.');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) handleFile(files[0]);
    };

    const handleChatSubmit = () => {
        if (chatInput.trim()) {
            onAnalyze('chatbot', chatInput.trim());
        }
    };
    
    // Simplified voice handling for demo
    const handleVoiceSubmit = () => {
        onAnalyze('voice', "I'm feeling a bit tired and overwhelmed today.");
    };

    const renderContent = () => {
        switch(activeTab) {
            case 'selfie':
                return (
                    <div className="text-center p-4">
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        <CameraIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600 mb-4">Capture a selfie to analyze your facial expression for a mood assessment.</p>
                        <button onClick={onOpenCamera} className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-secondary transition-colors">
                            Open Camera
                        </button>
                        <p className="mt-2 text-sm text-gray-500">
                            or{' '}
                            <button onClick={() => fileInputRef.current?.click()} className="font-semibold text-primary hover:underline">
                                browse for a file
                            </button>
                        </p>
                    </div>
                );
            case 'voice':
                 return (
                    <div className="text-center p-4">
                        <MicIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600 mb-4">Record a short voice note about your feelings. We'll analyze the tone and content. (Demo)</p>
                        <button onClick={handleVoiceSubmit} className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-secondary transition-colors">
                            Start Recording
                        </button>
                    </div>
                );
            case 'chatbot':
                 return (
                    <div className="p-4">
                       <ChatIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                        <textarea
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="Tell me how you're feeling..."
                            className="w-full h-24 p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                        />
                        <button onClick={handleChatSubmit} className="mt-4 w-full bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-secondary transition-colors">
                            Submit
                        </button>
                    </div>
                );
        }
    }
    
    const TabButton: React.FC<{ type: MoodInputType, icon: React.ReactNode, label: string }> = ({ type, icon, label }) => (
        <button 
            onClick={() => setActiveTab(type)}
            className={`flex-1 p-3 flex items-center justify-center gap-2 font-semibold text-sm rounded-t-lg transition-colors ${activeTab === type ? 'bg-white text-primary' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
        >
            {icon} {label}
        </button>
    );

    return (
        <Card className="h-full">
            <SectionTitle>🤔 How are you feeling today?</SectionTitle>
            <div className="bg-gray-100 rounded-lg">
                <div className="flex border-b border-gray-200">
                    <TabButton type="selfie" icon={<CameraIcon className="h-5 w-5"/>} label="Selfie"/>
                    <TabButton type="voice" icon={<MicIcon className="h-5 w-5"/>} label="Voice"/>
                    <TabButton type="chatbot" icon={<ChatIcon className="h-5 w-5"/>} label="Chatbot"/>
                </div>
                <div>{renderContent()}</div>
            </div>
        </Card>
    );
};

const WellnessInput: React.FC<{ data: WellnessData; onChange: (data: WellnessData) => void; }> = ({ data, onChange }) => {
    
    const handleInputChange = (field: keyof WellnessData, value: string) => {
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue) && numValue >= 0) {
            onChange({ ...data, [field]: numValue });
        } else if (value === '') {
             onChange({ ...data, [field]: undefined });
        }
    };
    
    const InputCard: React.FC<{
        icon: string;
        label: string;
        value?: number;
        unit: string;
        field: keyof WellnessData;
    }> = ({ icon, label, value, unit, field }) => (
         <div className="bg-light p-4 rounded-lg flex items-center gap-4">
            <div className="text-3xl">{icon}</div>
            <div className="flex-grow">
                <label className="text-sm font-semibold text-gray-600">{label}</label>
                <div className="flex items-baseline gap-2">
                    <input
                        type="number"
                        value={value ?? ''}
                        onChange={(e) => handleInputChange(field, e.target.value)}
                        placeholder="--"
                        className="w-full bg-transparent text-2xl font-bold text-dark focus:outline-none"
                    />
                    <span className="text-gray-500">{unit}</span>
                </div>
            </div>
        </div>
    );

    return (
        <Card className="h-full">
            <SectionTitle>💖 Enhance with Wellness Data</SectionTitle>
            <div className="space-y-4">
                <InputCard icon="😴" label="Sleep" value={data.sleepHours} unit="hours" field="sleepHours" />
                <InputCard icon="❤️" label="Heart Rate" value={data.heartRate} unit="bpm" field="heartRate" />
                <InputCard icon="💨" label="SpO₂" value={data.spo2} unit="%" field="spo2" />
            </div>
        </Card>
    );
};


// --- Results Stage Components ---

const WeeklyMoodChart: React.FC<{ data: MoodAnalysisResult['weeklyMoods'] }> = ({ data }) => {
    const [tooltip, setTooltip] = useState<{ x: number, y: number, day: string, balance: DoshaBalance } | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    const doshaConfig = {
        kapha: { color: '#F97316', name: 'Kapha' }, // Orange
        pitta: { color: '#FBBF24', name: 'Pitta' }, // Amber
        vata: { color: '#14B8A6', name: 'Vata' },   // Teal
    };

    const width = 500;
    const height = 200;
    const padding = { top: 10, right: 10, bottom: 30, left: 30 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const yMax = 80;

    const xScale = (index: number) => padding.left + (index / (data.length - 1)) * chartWidth;
    const yScale = (value: number) => padding.top + chartHeight - (Math.min(value, yMax) / yMax) * chartHeight;

    const lineCommand = (points: {x: number, y: number}[]) => {
        const d = points.reduce((acc, point, i, a) => {
            if (i === 0) return `M ${point.x},${point.y}`;
            const [cpsX, cpsY] = controlPoint(a[i - 1], a[i - 2], point);
            const [cpeX, cpeY] = controlPoint(point, a[i - 1], a[i + 1], true);
            return `${acc} C ${cpsX},${cpsY} ${cpeX},${cpeY} ${point.x},${point.y}`;
        }, "");
        return d;
    };
    
    const controlPoint = (current: any, previous: any, next: any, end?: boolean) => {
        const p = previous || current;
        const n = next || current;
        const smoothing = 0.2;
        const o = {
            x: n.x - p.x,
            y: n.y - p.y
        };
        const angle = Math.atan2(o.y, o.x);
        const length = Math.sqrt(o.x * o.x + o.y * o.y) * smoothing;
        const x = current.x + Math.cos(angle) * length * (end ? -1 : 1);
        const y = current.y + Math.sin(angle) * length * (end ? -1 : 1);
        return [x, y];
    };

    const handleMouseMove = (event: React.MouseEvent<SVGRectElement, MouseEvent>, index: number) => {
        const svg = svgRef.current;
        if (!svg) return;
        
        const point = data[index];
        const clientRect = svg.getBoundingClientRect();
        const svgX = xScale(index);
        
        setTooltip({
            x: ((svgX / width) * clientRect.width) + clientRect.left - 50, // Center tooltip
            y: clientRect.top - 10,
            day: index === data.length -1 ? 'Today' : point.day,
            balance: point.doshaBalance,
        });
    };

    return (
        <Card>
            <SectionTitle>
                <div className="flex items-center gap-3">
                    <ChartIcon className="w-8 h-8"/> Weekly Mood Balance
                </div>
            </SectionTitle>
             <div className="relative">
                <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} className="w-full">
                    <g className="grid-lines">
                        {[0, 20, 40, 60, 80].map(y => (
                            <g key={y}>
                                <line x1={padding.left} x2={width - padding.right} y1={yScale(y)} y2={yScale(y)} stroke="#E5E7EB" strokeDasharray="4 2" />
                                <text x={padding.left - 8} y={yScale(y) + 4} textAnchor="end" fontSize="10" fill="#6B7281">{y}</text>
                            </g>
                        ))}
                    </g>

                    {(['kapha', 'pitta', 'vata'] as const).map(dosha => {
                        const points = data.map((d, i) => ({ x: xScale(i), y: yScale(d.doshaBalance[dosha]) }));
                        const linePath = lineCommand(points);
                        const areaPath = `${linePath} L ${xScale(data.length - 1)},${height - padding.bottom} L ${padding.left},${height - padding.bottom} Z`;
                        
                        return (
                            <g key={dosha}>
                                <path d={areaPath} fill={doshaConfig[dosha].color} fillOpacity="0.1" />
                                <path d={linePath} fill="none" stroke={doshaConfig[dosha].color} strokeWidth="2.5" />
                            </g>
                        );
                    })}

                    {data.map((point, index) => (
                        <g key={index}>
                            <rect
                                x={xScale(index) - chartWidth / (data.length * 2)}
                                y={padding.top}
                                width={chartWidth / data.length}
                                height={chartHeight}
                                fill="transparent"
                                onMouseEnter={(e) => handleMouseMove(e, index)}
                                onMouseLeave={() => setTooltip(null)}
                            />
                             {(['kapha', 'pitta', 'vata'] as const).map(dosha => (
                                tooltip && tooltip.day === (index === data.length - 1 ? 'Today' : point.day) && (
                                    <circle
                                        key={dosha}
                                        cx={xScale(index)}
                                        cy={yScale(point.doshaBalance[dosha])}
                                        r="4"
                                        fill="white"
                                        stroke={doshaConfig[dosha].color}
                                        strokeWidth="2"
                                    />
                                )
                            ))}
                            <text x={xScale(index)} y={height - padding.bottom + 15} textAnchor="middle" fontSize="11" fill="#6B7281">{index === data.length - 1 ? 'Today' : point.day}</text>
                        </g>
                    ))}
                    {tooltip && <line x1={xScale(data.findIndex(d => (d.day === tooltip.day) || ('Today' === tooltip.day && data.indexOf(d) === data.length-1)))} x2={xScale(data.findIndex(d => (d.day === tooltip.day) || ('Today' === tooltip.day && data.indexOf(d) === data.length-1)))} y1={padding.top} y2={height - padding.bottom} stroke="#9CA3AF" strokeWidth="1" />}
                </svg>

                 {tooltip && (
                    <div className="absolute bg-white rounded-lg shadow-lg p-3 border text-sm pointer-events-none text-left" style={{ top: tooltip.y - 100, left: tooltip.x, transform: 'translateY(-100%)' }}>
                        <p className="font-bold mb-2 text-dark">{tooltip.day}</p>
                        {(['kapha', 'pitta', 'vata'] as const).map(dosha => (
                            <div key={dosha} className="flex justify-between items-center gap-4">
                               <span style={{color: doshaConfig[dosha].color}} className="text-dark">{doshaConfig[dosha].name}:</span>
                               <span className="font-semibold text-gray-800">{tooltip.balance[dosha]}</span>
                           </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="flex justify-center flex-wrap mt-4 gap-x-6 gap-y-1">
                {(['kapha', 'pitta', 'vata'] as const).map(dosha => (
                    <div key={dosha} className="flex items-center text-sm">
                        <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: doshaConfig[dosha].color }}></span>
                        <span className="text-gray-700 font-medium">{doshaConfig[dosha].name}</span>
                    </div>
                ))}
            </div>
        </Card>
    );
};


const MoodInsight: React.FC<{ mood: string; summary: string }> = ({ mood, summary }) => (
    <Card className="flex flex-col">
        <SectionTitle>Today's Mood Insight</SectionTitle>
        <div className="flex-grow">
            <p className="text-sm text-gray-500 mb-2">DETECTED MOOD</p>
            <p className="text-4xl font-bold text-primary mb-4">{mood}</p>
            <p className="text-sm text-gray-500 mb-2">AYURVEDIC SUMMARY</p>
            <p className="text-gray-700">{summary}</p>
        </div>
    </Card>
);

// A smaller, embeddable version of the DonutChart component for use inside other cards.
const EmbeddedDonutChart: React.FC<{ segments: { label: string; value: number; color: string; }[]; centerLabel: string; centerValue: string; }> = ({ segments, centerLabel, centerValue }) => {
  const size = 120; // smaller size
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  const sanitizedSegments = segments.map(segment => ({
    ...segment,
    value: Math.max(0, segment.value)
  }));
  
  let accumulatedPercentage = 0;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{width: size, height: size}}>
        <svg viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} />
          {sanitizedSegments.map((segment, index) => {
            const percentValue = segment.value; // It's already a percentage
            const dasharray = `${(percentValue / 100) * circumference} ${circumference}`;
            const dashoffset = -(accumulatedPercentage / 100) * circumference;
            accumulatedPercentage += percentValue;

            return (
              <circle
                key={index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth={strokeWidth}
                strokeDasharray={dasharray}
                strokeDashoffset={dashoffset}
                strokeLinecap="round"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold text-dark">{centerValue}</span>
            <span className="text-xs text-gray-500">{centerLabel}</span>
        </div>
      </div>
      <div className="flex justify-center flex-wrap mt-3 gap-x-3 gap-y-1">
        {sanitizedSegments.map((segment) => (
          <div key={segment.label} className="flex items-center text-xs">
            <span className="w-2.5 h-2.5 rounded-full mr-1.5" style={{ backgroundColor: segment.color }}></span>
            <span className="text-gray-600">{segment.label}: {segment.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const BalanceAndRecs: React.FC<{ result: MoodAnalysisResult }> = ({ result }) => {
    const Recommendation: React.FC<{icon: string, title: string, text: string}> = ({icon, title, text}) => (
        <div className="flex gap-4 items-start">
            <div className="text-2xl mt-1">{icon}</div>
            <div>
                <h5 className="font-bold text-dark">{title}</h5>
                <p className="text-sm text-gray-600">{text}</p>
            </div>
        </div>
    );
    
     const doshaSegments = [
        { label: 'Vata', value: result.doshaBalance.vata, color: '#14B8A6' },
        { label: 'Pitta', value: result.doshaBalance.pitta, color: '#FBBF24' },
        { label: 'Kapha', value: result.doshaBalance.kapha, color: '#F97316' },
    ];

    return (
        <Card className="flex flex-col">
            <SectionTitle>Balance & Recommendations</SectionTitle>
            <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-center mb-6">
                <EmbeddedDonutChart segments={doshaSegments} centerValue="Doshas" centerLabel="Balance" />
            </div>
            <div className="space-y-4 flex-grow">
                <Recommendation icon="🥗" title="What to Eat" text={result.recommendations.diet} />
                <Recommendation icon="🏃‍♂️" title="Lifestyle Activity" text={result.recommendations.lifestyle} />
                <Recommendation icon="🧘‍♀️" title="Yoga & Pranayama" text={result.recommendations.mindfulness} />
            </div>
        </Card>
    );
};

const WellnessSnapshot: React.FC<{ advice: string }> = ({ advice }) => (
    <Card>
        <SectionTitle>Wellness Snapshot</SectionTitle>
        <div className="bg-light p-4 rounded-lg flex items-center gap-4">
            <div className="text-3xl">💡</div>
            <p className="text-gray-700">{advice}</p>
        </div>
    </Card>
);

// --- Main Screen Component ---
interface MoodTrackerScreenProps {
    onAnalyze: (inputType: MoodInputType, inputData: string, wellnessData: WellnessData, mimeType?: string) => void;
    result: MoodAnalysisResult | null;
    isLoading: boolean;
    error: string | null;
    onBack: () => void;
    onRetry: () => void;
}

const MoodTrackerScreen: React.FC<MoodTrackerScreenProps> = ({ onAnalyze, result, isLoading, error, onBack, onRetry }) => {
    const [wellnessData, setWellnessData] = useState<WellnessData>({ sleepHours: 7, heartRate: 65, spo2: 98 });
    const [isCameraOpen, setIsCameraOpen] = useState(false);

    const handleAnalysis = (inputType: MoodInputType, inputData: string, mimeType?: string) => {
        onAnalyze(inputType, inputData, wellnessData, mimeType);
    };

    const handleCapture = (base64: string, mimeType: string) => {
        handleAnalysis('selfie', base64, mimeType);
        setIsCameraOpen(false);
    };

    return (
        <div className="w-full max-w-5xl mx-auto space-y-8">
            {isCameraOpen && (
                <CameraView
                    onCapture={handleCapture}
                    onBack={() => setIsCameraOpen(false)}
                    facingMode="user"
                />
            )}
            <header className="flex justify-between items-center">
                <button onClick={onBack} className="text-primary font-semibold hover:text-secondary">
                    &larr; Back to Dashboard
                </button>
                <h2 className="text-3xl font-bold text-dark">Mood Tracker</h2>
                <div className="w-36"></div> {/* Spacer */}
            </header>

            {/* Stage 1: Input */}
            <div className="grid lg:grid-cols-2 gap-8 items-stretch">
                <MoodInput onAnalyze={handleAnalysis} onOpenCamera={() => setIsCameraOpen(true)} />
                <WellnessInput data={wellnessData} onChange={setWellnessData} />
            </div>

            {/* Loading State */}
            {isLoading && (
                 <div className="text-center p-12">
                    <LoadingSpinner />
                    <p className="mt-4 text-gray-600">Our AI is analyzing your mood...</p>
                </div>
            )}
            
            {/* Error State */}
            {error && !isLoading && (
                <Card className="bg-red-50 border border-red-200 text-center">
                    <div className="text-4xl mb-2">⚠️</div>
                    <h3 className="text-xl font-bold text-red-700">Analysis Failed</h3>
                    <p className="text-red-600 mt-2 mb-4">{error}</p>
                    <button onClick={onRetry} className="bg-red-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-600 transition-colors">
                        Try Again
                    </button>
                </Card>
            )}

            {/* Stage 2: Results */}
            {result && !isLoading && (
                <div className="space-y-8 transition-opacity duration-700 animate-fadeIn">
                    <h2 className="text-2xl font-bold text-dark text-center">Your Ayurvedic Insight</h2>
                    <WeeklyMoodChart data={result.weeklyMoods} />
                    <div className="grid md:grid-cols-2 gap-8 items-stretch">
                        <MoodInsight mood={result.detectedMood} summary={result.summary} />
                        <BalanceAndRecs result={result} />
                    </div>
                    {result.wellnessAdvice && <WellnessSnapshot advice={result.wellnessAdvice} />}
                </div>
            )}
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


export default MoodTrackerScreen;