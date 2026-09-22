'use client';

import React from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface ReportDateSelectorProps {
  selectedDate: string; // YYYY-MM-DD
  onDateChange: (newDate: string) => void;
}

export const ReportDateSelector: React.FC<ReportDateSelectorProps> = ({
  selectedDate,
  onDateChange,
}) => {
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    onDateChange(new Date().toISOString().split('T')[0]);
  };

  const formattedDisplay = new Date(selectedDate).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Calendar className="w-5 h-5 text-brand-600" />
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Selected Report Date
          </span>
          <span className="text-sm font-bold text-slate-900">{formattedDisplay}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handlePrevDay} icon={<ChevronLeft className="w-4 h-4" />}>
          Prev Day
        </Button>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => e.target.value && onDateChange(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 bg-white"
        />
        <Button variant="outline" size="sm" onClick={handleNextDay}>
          Next Day <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
        <Button variant="secondary" size="sm" onClick={handleToday}>
          Today
        </Button>
      </div>
    </div>
  );
};
