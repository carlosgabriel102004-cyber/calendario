
import React from 'react';
import { Task } from '../types';
import { PRIORITY_COLORS } from '../constants';
import { Check, Tag } from './Icons';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onClick: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, onClick }) => {
  const [hours, minutes] = task.startTime.split(':').map(Number);
  const top = (hours * 60 + minutes);
  const height = task.duration;

  return (
    <div
      onClick={() => onClick(task)}
      style={{ top: `${top}px`, height: `${height}px` }}
      className={`absolute left-1 right-1 p-2 rounded-md border-l-4 shadow-sm text-xs cursor-pointer transition-all hover:brightness-95 group overflow-hidden ${PRIORITY_COLORS[task.priority]} ${task.completed ? 'opacity-50 grayscale' : ''}`}
    >
      <div className="flex items-start gap-2 h-full">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(task.id);
          }}
          className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${task.completed ? 'bg-slate-500 border-slate-500' : 'bg-white border-slate-300 group-hover:border-slate-400'}`}
        >
          {task.completed && <Check />}
        </button>
        <div className="flex flex-col flex-grow min-w-0">
          <span className={`font-semibold truncate ${task.completed ? 'line-through' : ''}`}>{task.title}</span>
          <div className="flex items-center gap-1 mt-0.5">
            {height > 35 && <span className="text-[10px] opacity-75">{task.startTime}</span>}
            {task.tags && task.tags.length > 0 && height > 50 && (
              <div className="flex gap-1 overflow-hidden">
                {task.tags.map(tag => (
                  <span key={tag} className="text-[8px] bg-black/5 px-1 rounded truncate max-w-[40px]">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
