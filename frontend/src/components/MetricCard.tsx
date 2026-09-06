import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  borderColorClass?: string; // e.g. 'border-l-red-500'
  iconColorClass?: string;
  subtitle?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  borderColorClass = 'border-l-blue-600',
  iconColorClass = 'text-slate-400',
  subtitle,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs border-l-4 ${borderColorClass} flex items-center justify-between transition-all ${
        onClick ? 'cursor-pointer hover:shadow-sm hover:border-slate-300' : ''
      }`}
    >
      <div>
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
          {title}
        </div>
        <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {value}
        </div>
        {subtitle && (
          <div className="text-xs text-slate-400 mt-1 font-medium">
            {subtitle}
          </div>
        )}
      </div>

      <div className={`p-3 rounded-lg bg-slate-50 border border-slate-100 ${iconColorClass}`}>
        <Icon className="w-6 h-6 stroke-[1.8]" />
      </div>
    </div>
  );
};
