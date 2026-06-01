import { useState } from 'react';

const data = [
  { time: '08:00', count: 14, x: 70, y: 155 },
  { time: '09:00', count: 35, x: 170, y: 72 },
  { time: '10:00', count: 26, x: 250, y: 112 },
  { time: '11:00', count: 10, x: 340, y: 168 },
  { time: '14:00', count: 6, x: 430, y: 190 },
  { time: '15:00', count: 32, x: 515, y: 102 },
  { time: '16:00', count: 17, x: 625, y: 145 },
];

export default function PatientFlowChart() {
  const [activePoint, setActivePoint] = useState(data[5]);

  return (
    <svg viewBox="0 0 650 220" className="h-full w-full touch-pan-y" role="img" aria-label="Biểu đồ lưu lượng bệnh nhân theo giờ">
      <defs>
        <linearGradient id="flowFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.03" />
        </linearGradient>
      </defs>
      {[40, 85, 130, 175].map((y) => (
        <line key={y} x1="45" x2="625" y1={y} y2={y} stroke="#e5eaf0" />
      ))}
      <path d="M70 155 C120 150 115 60 170 72 C215 82 205 110 250 112 C300 116 285 166 340 168 C390 170 395 198 430 190 C475 180 455 95 515 102 C555 106 550 150 625 145 L625 200 L70 200 Z" fill="url(#flowFill)" />
      <path d="M70 155 C120 150 115 60 170 72 C215 82 205 110 250 112 C300 116 285 166 340 168 C390 170 395 198 430 190 C475 180 455 95 515 102 C555 106 550 150 625 145" fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />

      <line x1={activePoint.x} x2={activePoint.x} y1="40" y2="200" stroke="#0f172a" strokeDasharray="4 6" strokeOpacity="0.22" />
      <rect x={Math.min(Math.max(activePoint.x - 32, 46), 558)} y={Math.max(activePoint.y - 52, 12)} width="64" height="32" rx="7" fill="#111827" />
      <text x={Math.min(Math.max(activePoint.x, 78), 590)} y={Math.max(activePoint.y - 31, 34)} textAnchor="middle" fill="white" fontSize="14" fontWeight="800">
        {activePoint.count} ca
      </text>

      {data.map((point) => {
        const active = point.time === activePoint.time;

        return (
          <g
            key={point.time}
            role="button"
            tabIndex={0}
            aria-label={`${point.time}: ${point.count} ca`}
            onPointerEnter={() => setActivePoint(point)}
            onPointerDown={() => setActivePoint(point)}
            onFocus={() => setActivePoint(point)}
            className="cursor-pointer outline-none"
          >
            <circle cx={point.x} cy={point.y} r="15" fill="transparent" />
            <circle cx={point.x} cy={point.y} r={active ? '7' : '5'} fill="white" stroke={active ? '#0ea5e9' : '#10b981'} strokeWidth={active ? '4' : '3'} />
          </g>
        );
      })}

      {data.map((point) => (
        <text key={point.time} x={point.x} y="216" textAnchor="middle" fill={point.time === activePoint.time ? '#2A93D5' : '#64748b'} fontSize="13" fontWeight={point.time === activePoint.time ? '800' : '500'}>
          {point.time}
        </text>
      ))}
    </svg>
  );
}
