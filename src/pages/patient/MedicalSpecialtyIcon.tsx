import React from 'react';
import { 
  Stethoscope, 
  Ear, 
  HeartPulse, 
  Baby, 
  Activity, 
  Smile, 
  Bone, 
  Eye, 
  Brain, 
  Sparkles
} from 'lucide-react';

interface MedicalSpecialtyIconProps {
  id: string;
  className?: string;
  size?: number;
}

// Custom Lungs Icon designed to match Lucide styling
const LungIcon = ({ size = 32, strokeWidth = 1.5 }: { size?: number; strokeWidth?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Trachea */}
    <path d="M12 3v7" />
    
    {/* Left Bronchus & Left Lung Lobe */}
    <path d="M12 10c-1.2 1-2.5 1.5-3.5 1.5c-2.5 0-4.5 2-4.5 5c0 3 2 4 3.5 4c1.5 0 2.5-1 3.5-2c0.7-0.7 1-2.5 1-3.5c0-1.5-1-2.5-2-2.5" />
    <path d="M7.5 15.5c-0.8 0.4-1.2 1-1.2 1.6" />

    {/* Right Bronchus & Right Lung Lobe */}
    <path d="M12 10c1.2 1 2.5 1.5 3.5 1.5c2.5 0 4.5 2 4.5 5c0 3-2 4-3.5 4c-1.5 0-2.5-1-3.5-2c-0.7-0.7-1-2.5-1-3.5c0-1.5 1-2.5 2-2.5" />
    <path d="M16.5 15.5c0.8 0.4 1.2 1 1.2 1.6" />
  </svg>
);

export function MedicalSpecialtyIcon({ id, className = '', size = 32 }: MedicalSpecialtyIconProps) {
  // Map specialty IDs to Lucide/Custom Icons
  const getIcon = () => {
    switch (id) {
      case 'sp-general':
        return Stethoscope;
      case 'sp-ent':
        return Ear;
      case 'sp-cardio':
        return HeartPulse;
      case 'sp-pediatrics':
        return Baby;
      case 'sp-gastro':
        return Activity;
      case 'sp-dental':
        return Smile;
      case 'sp-derma':
        return Sparkles;
      case 'sp-ortho':
        return Bone;
      case 'sp-eyes':
        return Eye;
      case 'sp-pulmo':
        return LungIcon;
      case 'sp-neuro':
        return Brain;
      default:
        return Stethoscope;
    }
  };

  const IconComponent = getIcon();

  return (
    <div 
      className={`medical-specialty-icon flex items-center justify-center rounded-xl bg-sky-50 text-brand w-14 h-14 ${className}`}
      style={{
        backgroundColor: 'var(--color-primary-light)',
        color: 'var(--color-primary)',
      }}
    >
      <IconComponent size={size} strokeWidth={1.5} />
    </div>
  );
}
