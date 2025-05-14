import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
}

export default function Calendar({
  selectedDate,
  onDateSelect,
  minDate = new Date(),
  maxDate,
  disabledDates = []
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));
  
  // First day of month
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  // Last day of month
  const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  
  // Days from previous month to show
  const daysFromPrevMonth = firstDayOfMonth.getDay();
  // Get last day of previous month
  const lastDayOfPrevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0).getDate();
  
  // Format month name
  const monthName = currentMonth.toLocaleString('default', { month: 'long' });
  const year = currentMonth.getFullYear();
  
  // Next and previous month navigation
  const goToPreviousMonth = () => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentMonth(prevMonth);
  };
  
  const goToNextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentMonth(nextMonth);
  };
  
  const goToToday = () => {
    setCurrentMonth(new Date());
    onDateSelect(new Date());
  };
  
  // Check if a date is the selected date
  const isSelectedDate = (date: Date) => {
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };
  
  // Check if a date is disabled
  const isDisabled = (date: Date) => {
    // Check if date is before minDate
    if (minDate && date < new Date(minDate.setHours(0, 0, 0, 0))) {
      return true;
    }
    
    // Check if date is after maxDate
    if (maxDate && date > new Date(maxDate.setHours(23, 59, 59, 999))) {
      return true;
    }
    
    // Check if date is in disabledDates
    return disabledDates.some(disabledDate => 
      date.getDate() === disabledDate.getDate() &&
      date.getMonth() === disabledDate.getMonth() &&
      date.getFullYear() === disabledDate.getFullYear()
    );
  };
  
  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-4">
      <div className="flex justify-between items-center mb-4">
        <h5 className="font-medium">
          {monthName} {year}
        </h5>
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={goToPreviousMonth} 
            className="p-1 hover:bg-neutral-100 rounded"
          >
            <ChevronLeft className="h-4 w-4 text-neutral-600" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={goToToday} 
            className="text-sm text-primary hover:text-primary-dark"
          >
            Today
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={goToNextMonth} 
            className="p-1 hover:bg-neutral-100 rounded"
          >
            <ChevronRight className="h-4 w-4 text-neutral-600" />
          </Button>
        </div>
      </div>
      
      {/* Days of week */}
      <div className="grid grid-cols-7 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <div key={index} className="text-center text-sm font-medium text-neutral-600">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Previous month days */}
        {Array.from({ length: daysFromPrevMonth }).map((_, index) => {
          const day = lastDayOfPrevMonth - daysFromPrevMonth + index + 1;
          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, day);
          
          return (
            <div 
              key={`prev-${index}`} 
              className="text-center p-2 text-neutral-400 calendar-day"
              onClick={() => !isDisabled(date) && onDateSelect(date)}
            >
              {day}
            </div>
          );
        })}
        
        {/* Current month days */}
        {Array.from({ length: lastDayOfMonth.getDate() }).map((_, index) => {
          const day = index + 1;
          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
          const disabled = isDisabled(date);
          const selected = isSelectedDate(date);
          const today = new Date();
          const isToday = 
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
          
          return (
            <div 
              key={`current-${index}`} 
              className={`
                text-center p-2 cursor-pointer calendar-day rounded-full
                ${disabled ? 'text-neutral-400 cursor-not-allowed' : 'hover:bg-neutral-100'}
                ${selected ? 'bg-primary text-white hover:bg-primary' : ''}
                ${isToday && !selected ? 'border border-primary text-primary' : ''}
              `}
              onClick={() => !disabled && onDateSelect(date)}
            >
              {day}
            </div>
          );
        })}
        
        {/* Next month days */}
        {Array.from({ length: 42 - (daysFromPrevMonth + lastDayOfMonth.getDate()) }).map((_, index) => {
          const day = index + 1;
          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, day);
          
          return (
            <div 
              key={`next-${index}`} 
              className="text-center p-2 text-neutral-400 calendar-day"
              onClick={() => !isDisabled(date) && onDateSelect(date)}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}
