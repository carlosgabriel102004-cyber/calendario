
import React, { useMemo } from 'react';
import { Task, ViewType, TagDef } from '../types';
import { WEEK_DAYS } from '../constants';
import TaskCard from './TaskCard';

interface CalendarProps {
  currentDate: Date;
  view: ViewType;
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  onCreateTask: (date: Date, time: string) => void;
  onDateClick: (date: Date) => void;
  availableTags: TagDef[];
}

const Calendar: React.FC<CalendarProps> = ({ 
  currentDate, 
  view,
  tasks, 
  onToggleTask, 
  onEditTask, 
  onCreateTask,
  onDateClick,
  availableTags
}) => {
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  const getTasksForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(t => t.date.split('T')[0] === dateStr);
  };

  // --- Week View Logic ---
  const weekDays = useMemo(() => {
    const days = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  }, [currentDate]);

  // --- Month View Logic ---
  const monthDays = useMemo(() => {
    const days = [];
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    // Padding for days before the first of the month
    const startPadding = firstDayOfMonth.getDay();
    for (let i = startPadding; i > 0; i--) {
      const day = new Date(firstDayOfMonth);
      day.setDate(firstDayOfMonth.getDate() - i);
      days.push(day);
    }

    // Days of the actual month
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
    }

    // Padding for days after the last of the month
    const endPadding = 42 - days.length; // 6 rows of 7 days
    for (let i = 1; i <= endPadding; i++) {
      const day = new Date(lastDayOfMonth);
      day.setDate(lastDayOfMonth.getDate() + i);
      days.push(day);
    }

    return days;
  }, [currentDate]);

  if (view === 'month') {
    return (
      <div className="flex flex-col h-full bg-white border-l">
        <div className="grid grid-cols-7 border-b sticky top-0 bg-white z-10">
          {WEEK_DAYS.map((day, i) => (
            <div key={i} className="text-center py-2 text-xs font-semibold text-slate-500 uppercase">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 flex-1 overflow-y-auto custom-scrollbar">
          {monthDays.map((day, i) => {
            const dayTasks = getTasksForDay(day);
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            
            return (
              <div 
                key={i} 
                onClick={() => onDateClick(day)}
                className={`min-h-[120px] border-b border-r last:border-r-0 p-1 hover:bg-slate-50 transition-colors cursor-pointer flex flex-col ${!isCurrentMonth ? 'bg-slate-50/50' : ''}`}
              >
                <div className="flex justify-center mb-1">
                  <span className={`text-xs font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday(day) ? 'bg-blue-600 text-white' : isCurrentMonth ? 'text-slate-700' : 'text-slate-300'}`}>
                    {day.getDate()}
                  </span>
                </div>
                <div className="flex flex-col gap-1 overflow-hidden">
                  {dayTasks.slice(0, 3).map(task => (
                    <div 
                      key={task.id}
                      className={`text-[10px] px-1.5 py-0.5 rounded truncate border-l-2 ${task.completed ? 'bg-slate-100 text-slate-400 line-through' : 'bg-blue-50 text-blue-800 border-blue-400'}`}
                    >
                      {task.startTime} {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-[9px] text-slate-400 font-medium pl-1">
                      + {dayTasks.length - 3} mais
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Week View (Default)
  const hours = Array.from({ length: 24 }, (_, i) => i);
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex border-b sticky top-0 bg-white z-20">
        <div className="w-16 flex-shrink-0 border-r" />
        {weekDays.map((day, i) => (
          <div key={i} className="flex-1 text-center py-4 border-r last:border-r-0">
            <div className={`text-xs font-medium uppercase mb-1 ${isToday(day) ? 'text-blue-600' : 'text-slate-500'}`}>
              {WEEK_DAYS[i]}
            </div>
            <div className={`text-2xl inline-flex items-center justify-center w-10 h-10 rounded-full ${isToday(day) ? 'bg-blue-600 text-white' : 'text-slate-700'}`}>
              {day.getDate()}
            </div>
          </div>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        <div className="flex">
          <div className="w-16 flex-shrink-0">
            {hours.map(hour => (
              <div key={hour} className="h-[60px] pr-2 text-right relative">
                <span className="text-[10px] text-slate-400 -top-2 absolute right-2">
                  {hour > 0 ? `${hour}:00` : ''}
                </span>
              </div>
            ))}
          </div>
          {weekDays.map((day, i) => (
            <div key={i} className="flex-1 border-r last:border-r-0 relative min-h-[1440px]">
              {hours.map(hour => (
                <div 
                  key={hour} 
                  onClick={() => onCreateTask(day, `${hour.toString().padStart(2, '0')}:00`)}
                  className="h-[60px] border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                />
              ))}
              {getTasksForDay(day).map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onToggle={onToggleTask} 
                  onClick={onEditTask} 
                  availableTags={availableTags}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
