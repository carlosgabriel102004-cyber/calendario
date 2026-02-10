
import React from 'react';
import { Task, TagDef } from '../types';
import { Check } from './Icons';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onClick: (task: Task) => void;
  availableTags: TagDef[];
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, onClick, availableTags }) => {
  const [hours, minutes] = task.startTime.split(':').map(Number);
  const top = (hours * 60 + minutes);
  const height = Math.max(task.duration, 24); // Altura mínima para legibilidade

  // Define as cores baseadas na prioridade (agora APENAS para a borda lateral grossa)
  const priorityStyles = {
    high: { border: '#ef4444' }, // Vermelho
    medium: { border: '#f59e0b' }, // Amarelo
    low: { border: '#10b981' }, // Verde
  };
  const pStyle = priorityStyles[task.priority] || priorityStyles.medium;

  // Cor da etiqueta (usada para o fundo claro, bordas finas e base do texto)
  const tagColor = task.tags && task.tags.length > 0
    ? availableTags.find(t => t.name === task.tags[0])?.color || '#3b82f6'
    : '#cbd5e1';

  return (
    <div
      onClick={() => onClick(task)}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        backgroundColor: `${tagColor}26`, // Fundo: cor da etiqueta clareada (15% de opacidade)
        borderColor: `${tagColor}4D`, // Borda: cor da etiqueta com um pouco mais de destaque (30%)
        borderLeftColor: pStyle.border, // Borda esquerda: cor da prioridade (Grossa)
      }}
      className={`absolute left-1 right-1 p-2 rounded-md border-l-[6px] shadow-sm text-xs cursor-pointer transition-all hover:brightness-95 hover:shadow-md border border-r border-y group overflow-hidden ${task.completed ? 'opacity-60 grayscale' : ''}`}
    >
      <div className="flex items-start gap-2 h-full">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(task.id);
          }}
          className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${task.completed ? 'bg-slate-500 border-slate-500 text-white' : 'bg-white border-slate-300 group-hover:border-slate-400 shadow-sm'}`}
        >
          {task.completed && <Check />}
        </button>
        <div className="flex flex-col flex-grow min-w-0">
          <span 
            className={`font-bold line-clamp-2 leading-tight break-words ${task.completed ? 'line-through text-slate-500' : ''}`}
            /* O filtro brightness(0.35) escurece a cor da etiqueta magicamente para criar um tom de texto perfeito e combinando! */
            style={task.completed ? undefined : { color: tagColor, filter: 'brightness(0.35)' }}
          >
            {task.title}
          </span>
          
          <div className="flex flex-wrap items-center gap-1 mt-0.5">
            {height >= 40 && (
              <span 
                className={`text-[10px] font-semibold ${task.completed ? 'text-slate-400' : ''}`}
                style={task.completed ? undefined : { color: tagColor, filter: 'brightness(0.45)' }}
              >
                {task.startTime}
              </span>
            )}
            
            {/* Indicador de que a nota tem descrição */}
            {task.description && height >= 40 && (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="w-3 h-3" 
                style={task.completed ? { color: '#94a3b8' } : { color: tagColor, filter: 'brightness(0.5)' }} 
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
