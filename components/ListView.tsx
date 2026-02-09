
import React from 'react';
import { Task } from '../types';
import { PRIORITY_INDICATORS } from '../constants';
import { Check, Tag } from './Icons';

interface ListViewProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onEditTask: (task: Task) => void;
}

const ListView: React.FC<ListViewProps> = ({ tasks, onToggleTask, onEditTask }) => {
  const categorizeTask = (task: Task) => {
    const hour = parseInt(task.startTime.split(':')[0]);
    if (hour >= 0 && hour < 12) return 'Manhã';
    if (hour >= 12 && hour < 18) return 'Tarde';
    return 'Noite';
  };

  const periods = [
    { name: 'Manhã', emoji: '☀️', color: 'text-orange-500' },
    { name: 'Tarde', emoji: '🌤️', color: 'text-blue-500' },
    { name: 'Noite', emoji: '🌙', color: 'text-indigo-600' }
  ];
  
  return (
    <div className="flex-1 overflow-y-auto bg-slate-100 p-4 md:p-8 custom-scrollbar">
      <div className="max-w-3xl mx-auto space-y-10">
        {periods.map(period => {
          const periodTasks = tasks.filter(t => categorizeTask(t) === period.name);
          if (periodTasks.length === 0) return null;

          return (
            <section key={period.name} className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="text-2xl">{period.emoji}</span>
                <h3 className={`text-xl font-black uppercase tracking-tighter ${period.color}`}>{period.name}</h3>
                <div className="h-0.5 flex-1 bg-slate-200" />
                <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-slate-400 border border-slate-200 shadow-sm">
                  {periodTasks.length} {periodTasks.length === 1 ? 'Nota' : 'Notas'}
                </span>
              </div>
              
              <div className="space-y-4">
                {periodTasks.map(task => (
                  <div 
                    key={task.id}
                    onClick={() => onEditTask(task)}
                    className={`group relative bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex gap-5 items-start ${task.completed ? 'opacity-60 bg-slate-50 grayscale' : ''}`}
                  >
                    {/* Linha lateral estilo bloco de notas */}
                    <div className={`absolute left-0 top-6 bottom-6 w-1.5 rounded-r-full ${PRIORITY_INDICATORS[task.priority]}`} />

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleTask(task.id);
                      }}
                      className={`mt-1 flex-shrink-0 w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-slate-50 border-slate-200 hover:border-blue-400 hover:bg-white'}`}
                    >
                      {task.completed && <Check />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`text-lg font-bold text-slate-800 truncate leading-tight ${task.completed ? 'line-through text-slate-400' : ''}`}>
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-black text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg uppercase">
                            {task.startTime}
                          </span>
                        </div>
                      </div>
                      
                      {task.description ? (
                        <p className={`text-lg text-slate-600 mb-4 note-font leading-relaxed ${task.completed ? 'text-slate-400' : ''}`}>
                          {task.description}
                        </p>
                      ) : (
                        <div className="h-2" />
                      )}

                      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-50">
                        {task.tags?.map(tag => (
                          <span key={tag} className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm border border-blue-100">
                            <Tag /> {tag}
                          </span>
                        ))}
                        {task.repeat !== 'none' && (
                          <span className="flex items-center gap-1 text-[10px] font-black text-purple-600 bg-purple-50 px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm border border-purple-100">
                            🔄 Repetitiva
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
        
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in duration-700">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-lg border border-slate-100">
              <span className="text-5xl">☕</span>
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">Nada por enquanto!</h3>
            <p className="text-slate-500 max-w-xs font-medium">
              Sua lista de tarefas está limpa. Que tal planejar algo novo para este período?
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListView;
