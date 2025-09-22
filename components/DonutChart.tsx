import React from 'react';

interface ChartSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  title: string;
  segments: ChartSegment[];
  centerLabel: string;
  centerValue: string;
}

const DonutChart: React.FC<DonutChartProps> = ({ title, segments, centerLabel, centerValue }) => {
  const size = 150;
  const strokeWidth = 15;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Sanitize segments to ensure all values are non-negative for chart rendering.
  const sanitizedSegments = segments.map(segment => ({
    ...segment,
    value: Math.max(0, segment.value)
  }));

  const totalValue = sanitizedSegments.reduce((sum, segment) => sum + segment.value, 0);
  const scale = totalValue > 0 ? 100 / totalValue : 0;

  let accumulatedPercentage = 0;

  return (
    <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm h-full">
      <h4 className="text-lg font-bold text-dark mb-4">{title}</h4>
      <div className="relative w-40 h-40">
        <svg viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb" // gray-200
            strokeWidth={strokeWidth}
          />
          {sanitizedSegments.map((segment, index) => {
            const percentValue = title === 'Macronutrients' ? segment.value * scale : segment.value;
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
            <span className="text-3xl font-bold text-dark">{centerValue}</span>
            <span className="text-sm text-gray-500">{centerLabel}</span>
        </div>
      </div>
      <div className="flex justify-center flex-wrap mt-4 gap-x-4 gap-y-1">
        {sanitizedSegments.map((segment) => (
          <div key={segment.label} className="flex items-center text-sm">
            <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: segment.color }}></span>
            <span className="text-gray-600">{segment.label}: {segment.value}{title === 'Macronutrients' ? 'g' : '%'}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonutChart;