import React, { useState, useRef, useEffect } from 'react';
import { patientProfile, appointments as initialAppointments, prescriptions, labReports, ayurvedicInsight, billing } from '../dummyData';
import LoadingSpinner from './LoadingSpinner';

// --- Reusable Components ---
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl shadow-lg p-6 flex flex-col ${className}`}>
    {children}
  </div>
);

const CardTitle: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
    <div className="flex items-center mb-4">
        {icon}
        <h3 className="text-xl font-bold text-dark ml-3">{title}</h3>
    </div>
);

// --- SVG Icons ---
const iconClass = "h-7 w-7 text-primary";
const ProfileIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>;
const AppointmentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} viewBox="0 0 24 24" fill="currentColor"><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/></svg>;
const PrescriptionIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} viewBox="0 0 24 24" fill="currentColor"><path d="M13 9h-2v3H8v2h3v3h2v-3h3v-2h-3z"/><path d="M15.5 2.5a2.5 2.5 0 0 0-2.41 1.83l-1.37 4.1a1.51 1.51 0 0 0 2.1 1.76l1.18-.59-1 3a2.5 2.5 0 1 0 4.5-.82l-2-6A2.5 2.5 0 0 0 15.5 2.5zM6 3h6v2H6zm0 3h4v2H6zm0 3h6v2H6zm0 3h4v2H6z"/></svg>;
const LabIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} viewBox="0 0 24 24" fill="currentColor"><path d="M20.55 5.22l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.45 5.22C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.45-1.28zM12 9c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-3 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2.81 8.5L8 15.65l1.81 1.85L12 15l2.19 2.5L16 15.65l1.81 1.85L20 15.17V19H4v-3.83zM15 9c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z"/></svg>;
const InsightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>;
const BillingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>;
const WarningIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.22 3.006-1.742 3.006H4.42c-1.522 0-2.492-1.672-1.742-3.006l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" /></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>;

// --- Chart Components ---

const ProgressDial: React.FC<{ percentage: number; colorClass: string }> = ({ percentage, colorClass }) => {
    const size = 32;
    const strokeWidth = 4;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <svg width={size} height={size} className="-rotate-90">
            <circle className="text-gray-200" stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" r={radius} cx={size/2} cy={size/2} />
            <circle className={colorClass} stroke="currentColor" strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" fill="transparent" r={radius} cx={size/2} cy={size/2} />
        </svg>
    );
};

const LineChart: React.FC<{ data: { date: string, value: number }[]; color: string; unit: string }> = ({ data, color, unit }) => {
    const [tooltip, setTooltip] = useState<{ x: number, y: number, date: string, value: number } | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    const width = 200, height = 60, padding = 5;
    const values = data.map(d => d.value);
    const min = Math.min(...values) * 0.95;
    const max = Math.max(...values) * 1.05;
    
    const getCoords = (value: number, i: number) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - padding - ((value - min) / (max - min)) * (height - padding * 2);
        return {x, y};
    };

    const points = data.map((point, i) => {
        const {x, y} = getCoords(point.value, i);
        return `${x},${y}`;
    }).join(' ');

    const handleMouseMove = (event: React.MouseEvent, index: number) => {
        if (!svgRef.current) return;
        const point = data[index];
        const parentRect = svgRef.current.parentElement!.getBoundingClientRect();
        
        // Use coordinates relative to the parent for positioning
        const relativeX = event.clientX - parentRect.left;
        const relativeY = event.clientY - parentRect.top;

        setTooltip({ x: relativeX, y: relativeY, ...point });
    };

    return (
        <div className="relative" onMouseLeave={() => setTooltip(null)}>
            <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} className="w-full h-16 overflow-visible">
                <polyline fill="none" stroke={color} strokeWidth="2.5" points={points} strokeLinecap="round" strokeLinejoin="round"/>
                {data.map((point, i) => {
                    const { x, y } = getCoords(point.value, i);
                    const rectWidth = data.length > 1 ? width / (data.length - 1) : width;
                    return (
                        <g key={i}>
                            <circle cx={x} cy={y} r="3" fill={color} />
                            <rect
                                x={x - rectWidth / 2}
                                y={0}
                                width={rectWidth}
                                height={height}
                                fill="transparent"
                                onMouseMove={(e) => handleMouseMove(e, i)}
                            />
                        </g>
                    );
                })}
            </svg>
            {tooltip && (
                <div
                    className="absolute bg-dark text-white text-xs rounded-md p-2 shadow-lg pointer-events-none z-10"
                    style={{ 
                        top: tooltip.y - 50, // Position above the cursor
                        left: tooltip.x,
                        transform: 'translateX(-50%)' 
                    }}
                >
                    <div className="font-bold">{tooltip.value} {unit}</div>
                    <div className="text-gray-300">{tooltip.date}</div>
                </div>
            )}
        </div>
    );
};

const PieChart: React.FC<{ data: { category: string, value: number }[] }> = ({ data }) => {
    const colors = ['#14B8A6', '#F97316', '#0D9488', '#F59E0B'];
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativePercent = 0;

    const getCoordinatesForPercent = (percent: number) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    return (
        <div className="flex items-center gap-4">
            <svg viewBox="-1 -1 2 2" className="w-24 h-24 transform -rotate-90">
                {data.map((item, i) => {
                    const percent = item.value / total;
                    const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
                    cumulativePercent += percent;
                    const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
                    const largeArcFlag = percent > 0.5 ? 1 : 0;
                    const pathData = `M ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} L 0 0`;
                    return <path key={i} d={pathData} fill={colors[i % colors.length]} />;
                })}
            </svg>
            <div className="text-sm space-y-1">
                {data.map((item, i) => (
                    <div key={i} className="flex items-center">
                        <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: colors[i % colors.length] }}></span>
                        <span className="font-semibold text-gray-600">{item.category}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


// --- Card Components ---

const PatientProfileCard: React.FC = () => (
    <Card className="md:col-span-2 xl:col-span-3 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-shrink-0 w-24 h-24 bg-light rounded-full flex items-center justify-center">
                <span className="text-6xl">👩</span>
            </div>
            <div>
                <h2 className="text-4xl font-bold">{patientProfile.name}</h2>
                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-light">
                    <span>Age: {patientProfile.age}</span>
                    <span>Gender: {patientProfile.gender}</span>
                    <span>ABHA ID: {patientProfile.abhaId}</span>
                </div>
            </div>
            <div className="sm:ml-auto text-left bg-white/20 p-4 rounded-lg">
                <h4 className="font-bold mb-2">Allergy</h4>
                {patientProfile.allergies.map(allergy => (
                    <div key={allergy} className="flex items-center">
                        <WarningIcon /> {allergy}
                    </div>
                ))}
            </div>
        </div>
    </Card>
);

const AppointmentCard: React.FC = () => {
    const [appointments, setAppointments] = useState(initialAppointments);
    const [bookingStep, setBookingStep] = useState('list'); // 'list', 'calendar', 'specialty', 'slot', 'confirm'
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedSpecialty, setSelectedSpecialty] = useState('');
    const [selectedSlot, setSelectedSlot] = useState('');
    const [calendarDate, setCalendarDate] = useState(new Date());

    const formatDate = (date: Date): string => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear().toString().slice(-2);
        return `${day} ${month} ${year}`;
    };

    const handleBook = () => {
        if (!selectedDate) return;
        const newAppointment = {
            date: formatDate(selectedDate),
            doctor: "Dr. Kavita", // Dummy doctor for new bookings
            specialty: selectedSpecialty,
            mode: "OPD",
            status: "Scheduled"
        };
        setAppointments(prev => [newAppointment, ...prev]);
        
        // Reset flow
        setBookingStep('list');
        setSelectedDate(null);
        setSelectedSpecialty('');
        setSelectedSlot('');
    };
    
    const renderCalendar = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const fiveDaysLater = new Date(today);
        fiveDaysLater.setDate(today.getDate() + 4);

        const month = calendarDate.getMonth();
        const year = calendarDate.getFullYear();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => <div key={`blank-${i}`}></div>);
        const days = Array.from({ length: daysInMonth }, (_, i) => {
            const dayDate = new Date(year, month, i + 1);
            const isSelected = selectedDate?.getTime() === dayDate.getTime();
            const isDisabled = dayDate < today || dayDate > fiveDaysLater;

            return (
                <button
                    key={i + 1}
                    disabled={isDisabled}
                    onClick={() => { setSelectedDate(dayDate); setBookingStep('specialty'); }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-200 ${
                        isDisabled ? 'text-gray-300 cursor-not-allowed' :
                        isSelected ? 'bg-primary text-white scale-110 shadow-lg' :
                        'bg-light text-dark hover:bg-primary/20'
                    }`}
                >
                    {i + 1}
                </button>
            );
        });

        return (
            <div className="p-4 bg-light rounded-lg">
                <div className="flex justify-between items-center mb-2">
                    <button onClick={() => setCalendarDate(new Date(year, month - 1))} className="font-bold text-lg">‹</button>
                    <h4 className="font-bold text-dark">{calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h4>
                    <button onClick={() => setCalendarDate(new Date(year, month + 1))} className="font-bold text-lg">›</button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-500 mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d}>{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1 place-items-center">
                    {blanks}
                    {days}
                </div>
                 <button onClick={() => setBookingStep('list')} className="text-sm font-semibold text-gray-500 mt-4">Cancel</button>
            </div>
        );
    };

    const renderBookingFlow = () => {
        switch (bookingStep) {
            case 'calendar':
                return renderCalendar();
            case 'specialty':
                return (
                    <div className="p-4 bg-light rounded-lg">
                        <h4 className="font-bold text-dark mb-2">Select Specialty for {selectedDate && formatDate(selectedDate)}</h4>
                        <div className="space-y-2">
                           {['Ayurveda Gynae', 'Ayurveda Nutrition', 'Panchakarma Therapy'].map(spec => (
                               <button key={spec} onClick={() => { setSelectedSpecialty(spec); setBookingStep('slot'); }} className="w-full text-left p-2 bg-white rounded-md hover:bg-gray-100 text-dark">{spec}</button>
                           ))}
                        </div>
                        <button onClick={() => setBookingStep('calendar')} className="text-sm font-semibold text-gray-500 mt-4">Back</button>
                    </div>
                );
            case 'slot':
                 return (
                    <div className="p-4 bg-light rounded-lg">
                        <h4 className="font-bold text-dark mb-2">Available Slots for {selectedSpecialty}</h4>
                        <p className="text-sm text-gray-600 mb-3">with Dr. Kavita on {selectedDate && formatDate(selectedDate)}</p>
                        <div className="grid grid-cols-3 gap-2">
                           {['4:00 PM', '4:30 PM', '5:30 PM', '6:00 PM'].map(slot => (
                               <button key={slot} onClick={() => { setSelectedSlot(slot); setBookingStep('confirm'); }} className="p-2 bg-white text-dark rounded-md hover:bg-primary hover:text-white">{slot}</button>
                           ))}
                        </div>
                        <button onClick={() => setBookingStep('specialty')} className="text-sm font-semibold text-gray-500 mt-4">Back</button>
                    </div>
                );
            case 'confirm':
                return (
                     <div className="p-4 bg-light rounded-lg text-center">
                        <h4 className="font-bold text-dark mb-2">Confirm Booking</h4>
                        <p className="text-gray-700">With <span className="font-semibold">Dr. Kavita</span> ({selectedSpecialty})</p>
                        <p className="text-gray-700">on <span className="font-semibold">{selectedDate && formatDate(selectedDate)}</span> at <span className="font-semibold">{selectedSlot}</span></p>
                        <div className="flex gap-4 justify-center mt-4">
                            <button onClick={() => setBookingStep('slot')} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg">Back</button>
                            <button onClick={handleBook} className="bg-primary text-white font-bold py-2 px-4 rounded-lg">Confirm & Book</button>
                        </div>
                    </div>
                )
            default: return null;
        }
    }

    const StatusBadge: React.FC<{status: string}> = ({status}) => {
        const colors: {[key: string]: string} = {
            "Upcoming": "bg-yellow-100 text-yellow-800",
            "Completed": "bg-gray-100 text-gray-800",
            "Scheduled": "bg-blue-100 text-blue-800",
        };
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[status] || 'bg-gray-100'}`}>{status}</span>
    }

    return (
        <Card>
            <CardTitle icon={<AppointmentIcon />} title="Appointments" />
            <div className="space-y-3 flex-grow overflow-y-auto max-h-60 pr-2">
                {appointments.map((appt, i) => (
                    <div key={i} className="p-3 bg-light rounded-lg">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-bold text-dark">{appt.specialty}</p>
                                <p className="text-sm text-gray-500">{appt.date} with {appt.doctor}</p>
                            </div>
                            <StatusBadge status={appt.status} />
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-4">
                {bookingStep !== 'list' ? renderBookingFlow() : (
                     <button onClick={() => setBookingStep('calendar')} className="w-full bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-secondary transition-colors">
                        Book New Appointment
                    </button>
                )}
            </div>
        </Card>
    );
};

const PrescriptionCard: React.FC = () => (
    <Card>
        <CardTitle icon={<PrescriptionIcon />} title="Prescription Tracker" />
        <div className="space-y-4 flex-grow overflow-y-auto max-h-80 pr-2">
            {prescriptions.map((p, i) => (
                <div key={i}>
                    <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-dark">{p.name} <span className="text-xs font-normal text-gray-500">{p.notes}</span></span>
                        <ProgressDial percentage={(p.daysCompleted / p.duration) * 100} colorClass={p.status === 'Active' ? 'text-primary' : 'text-gray-400'} />
                    </div>
                    <p className="text-sm text-gray-600">{p.dosage}</p>
                    <p className="text-xs text-gray-400">{p.daysCompleted} / {p.duration} days completed</p>
                </div>
            ))}
        </div>
    </Card>
);

const LabReportCard: React.FC = () => {
    const [activeTrend, setActiveTrend] = useState<string | null>(null);

    const statusInfo: { [key: string]: { icon: string, color: string } } = {
        'normal': { icon: '✅', color: 'text-green-600' },
        'high': { icon: '⚠️', color: 'text-orange-600' },
        'deficient': { icon: '❌', color: 'text-red-600' }
    };

    const trendableReports: { [key: string]: { data: { date: string, value: number }[], color: string, unit: string } } = {
        'Sugar Fasting': { data: labReports.trends.sugarFasting, color: '#F97316', unit: 'mg/dL' },
        'Thyroid (TSH)': { data: labReports.trends.thyroid, color: '#EF4444', unit: 'µIU/mL' },
        'Vitamin D': { data: labReports.trends.vitaminD, color: '#3B82F6', unit: 'ng/mL' }
    };

    const handleTrendClick = (testName: string) => {
        if (trendableReports.hasOwnProperty(testName)) {
            setActiveTrend(prev => prev === testName ? null : testName);
        } else {
            setActiveTrend(null);
        }
    };

    const getStatusForValue = (testName: string, value: number) => {
        const range = (labReports.ranges as any)[testName];
        if (!range) return { text: 'N/A', color: 'bg-gray-200 text-gray-800' };

        if (value < range.low) return { text: 'LOW', color: 'bg-blue-100 text-blue-800' };
        if (value > range.high) return { text: 'HIGH', color: 'bg-red-100 text-red-800' };
        return { text: 'NORMAL', color: 'bg-green-100 text-green-800' };
    };
    
    const renderTrendDetails = () => {
        if (!activeTrend || !trendableReports[activeTrend]) {
            return (
                <div className="text-center text-gray-400">
                    <p>Click on a report above to view its historical trend.</p>
                </div>
            );
        }

        const latestReport = labReports.reports.find(r => r.test === activeTrend);
        const latestValue = latestReport ? parseFloat(latestReport.result) : 0;
        const status = getStatusForValue(activeTrend, latestValue);
        const trendInfo = trendableReports[activeTrend];

        return (
            <div className="animate-fadeIn">
                <div className="flex justify-between items-center mb-1">
                    <h5 className="font-semibold text-dark text-sm">{activeTrend} Trend</h5>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${status.color}`}>{status.text}</span>
                </div>
                <LineChart 
                    data={trendInfo.data} 
                    color={trendInfo.color} 
                    unit={trendInfo.unit} 
                />
            </div>
        );
    };

    return (
        <Card className="md:col-span-2">
            <CardTitle icon={<LabIcon />} title="Lab Reports" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {labReports.reports.map((r, i) => (
                    <button
                        key={i}
                        onClick={() => handleTrendClick(r.test)}
                        className={`bg-light p-3 rounded-lg text-center transition-all duration-200 focus:outline-none ${
                            activeTrend === r.test ? 'ring-2 ring-primary shadow-md' : 'hover:bg-gray-200'
                        }`}
                    >
                        <p className="font-bold text-sm text-dark">{r.test}</p>
                        <p className={`font-semibold text-lg ${statusInfo[r.status].color}`}>{r.result}</p>
                        <p className="text-xs text-gray-400">{r.date}</p>
                    </button>
                ))}
            </div>
            
            <div className="border-t pt-4 min-h-[8rem] flex flex-col justify-center">
                {renderTrendDetails()}
            </div>

            <button
                onClick={() => alert('File upload functionality coming soon!')}
                className="w-full mt-6 flex items-center justify-center bg-light text-primary font-bold py-2 px-4 rounded-lg border border-primary/50 hover:bg-teal-100 transition-colors"
            >
                <UploadIcon />
                Upload New Report
            </button>
        </Card>
    );
};


const AyurvedicInsightCard: React.FC = () => (
    <Card>
        <CardTitle icon={<InsightIcon />} title="Ayurvedic Insight" />
        <div className="text-center mb-4">
            <p className="text-sm text-gray-500">Prakriti</p>
            <p className="text-2xl font-bold text-dark">{ayurvedicInsight.prakriti}</p>
        </div>
        <div className="mb-4">
            <h4 className="font-semibold text-center text-dark mb-2">Current Dosha Status</h4>
             <div className="flex justify-around items-center bg-light p-3 rounded-lg">
                <div>
                    <p className="text-3xl font-bold text-blue-500">{ayurvedicInsight.currentDosha.vata}%</p>
                    <p className="font-semibold text-sm text-dark">Vata 🌬️</p>
                </div>
                <div>
                    <p className="text-3xl font-bold text-red-500">{ayurvedicInsight.currentDosha.pitta}%</p>
                    <p className="font-semibold text-sm text-dark">Pitta 🔥</p>
                </div>
                 <div>
                    <p className="text-3xl font-bold text-green-500">{ayurvedicInsight.currentDosha.kapha}%</p>
                    <p className="font-semibold text-sm text-dark">Kapha 🌊</p>
                </div>
            </div>
        </div>
        <div>
            <h4 className="font-semibold text-center text-dark mb-2">Daily Recommendations</h4>
            <div className="space-y-2">
                {ayurvedicInsight.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-center bg-light p-2 rounded-lg">
                        <span className="text-xl mr-3">{rec.icon}</span>
                        <span className="text-gray-700">{rec.text}</span>
                    </div>
                ))}
            </div>
        </div>
    </Card>
);

const BillingCard: React.FC = () => {
    const handleGenerateBill = () => {
        generateBill({ patientName: patientProfile.name, ...billing });
    };

    return (
        <Card className="md:col-span-2">
            <CardTitle icon={<BillingIcon />} title="Billing" />
            <div className="grid md:grid-cols-2 gap-6">
                <div className="flex-grow overflow-y-auto max-h-48 pr-2">
                     {billing.items.map((item, i) => (
                        <div key={i} className="flex justify-between py-1 border-b">
                            <span className="text-gray-600">{item.item}</span>
                            <span className="font-semibold text-dark">₹{item.cost}</span>
                        </div>
                    ))}
                    <div className="flex justify-between pt-2 font-bold text-lg">
                        <span>Grand Total</span>
                        <span className="text-primary">₹{billing.grandTotal}</span>
                    </div>
                </div>
                 <div>
                    <h4 className="font-semibold text-dark mb-2">Expense Breakdown</h4>
                    <PieChart data={billing.breakdown} />
                </div>
            </div>
            <button onClick={handleGenerateBill} className="w-full mt-6 bg-accent text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors">
                Generate Bill PDF
            </button>
        </Card>
    );
};


// --- Helper Functions for PDF Generation (Simulation) ---
const generateAppointmentSlip = (details: any) => {
    const slipHtml = `
        <html>
            <head>
                <title>Appointment Slip</title>
                <style>
                    body { font-family: sans-serif; padding: 2rem; }
                    .container { border: 1px solid #ccc; padding: 2rem; border-radius: 8px; max-width: 600px; margin: auto; }
                    h1 { color: #14B8A6; }
                    p { line-height: 1.6; }
                    strong { color: #134E4A; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Appointment Confirmation</h1>
                    <p><strong>Patient:</strong> ${details.patientName}</p>
                    <p><strong>Doctor:</strong> ${details.doctor} (${details.specialty})</p>
                    <p><strong>Date:</strong> ${details.date}</p>
                    <p><strong>Time:</strong> ${details.time}</p>
                    <hr>
                    <p>Please arrive 15 minutes early. This slip is for your reference.</p>
                </div>
            </body>
        </html>
    `;
    const win = window.open("", "Appointment Slip", "width=800,height=600");
    win?.document.write(slipHtml);
    win?.document.close();
    win?.print();
};

const generateBill = (details: any) => {
    const itemsHtml = details.items.map((item: any) => `
        <tr>
            <td>${item.item}</td>
            <td style="text-align: right;">₹${item.cost.toFixed(2)}</td>
        </tr>
    `).join('');

    const billHtml = `
        <html>
            <head>
                <title>Invoice</title>
                <style>
                    body { font-family: sans-serif; padding: 2rem; }
                    .container { border: 1px solid #ccc; padding: 2rem; border-radius: 8px; max-width: 600px; margin: auto; }
                    h1 { color: #14B8A6; }
                    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
                    th, td { padding: 0.75rem; border-bottom: 1px solid #eee; text-align: left; }
                    .total { font-weight: bold; font-size: 1.2rem; color: #14B8A6; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Invoice</h1>
                    <p><strong>Patient:</strong> ${details.patientName}</p>
                    <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                    <table>
                        <thead><tr><th>Description</th><th style="text-align: right;">Amount</th></tr></thead>
                        <tbody>${itemsHtml}</tbody>
                        <tfoot>
                            <tr>
                                <td class="total">Grand Total</td>
                                <td class="total" style="text-align: right;">₹${details.grandTotal.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </body>
        </html>
    `;
    const win = window.open("", "Bill", "width=800,height=600");
    win?.document.write(billHtml);
    win?.document.close();
    win?.print();
};


// --- Main Dashboard Component ---
interface AyushHealthCardDashboardProps {
  onBack: () => void;
}

const AyushHealthCardDashboard: React.FC<AyushHealthCardDashboardProps> = ({ onBack }) => {
  return (
    <div className="w-full max-w-7xl mx-auto animate-fadeIn">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-dark">Ayush Health Card</h2>
        <button onClick={onBack} className="bg-white shadow-md text-primary font-semibold py-2 px-4 rounded-lg hover:bg-light">
          &larr; Back to Home
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
        <PatientProfileCard />
        <AppointmentCard />
        <PrescriptionCard />
        <AyurvedicInsightCard />
        <LabReportCard />
        <BillingCard />
      </div>
    </div>
  );
};

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


export default AyushHealthCardDashboard;