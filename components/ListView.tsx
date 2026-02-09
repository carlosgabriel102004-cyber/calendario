
import React from 'react';
import { Task, TagDef } from '../types';
import { PRIORITY_INDICATORS } from '../constants';
import { Check, Tag } from './Icons';

interface ListViewProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  availableTags: TagDef[];
}

const ListView: React.FC<ListViewProps> = ({ tasks, onToggleTask, onEditTask, availableTags }) => {
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
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8 custom-scrollbar notebook-lines">
      <div className="max-w-3xl mx-auto space-y-12">
        {periods.map(period => {
          const periodTasks = tasks.filter(t => categorizeTask(t) === period.name);
          if (periodTasks.length === 0) return null;

          return (
            <section key={period.name} className="space-y-6">
              <div className="flex items-center gap-4 bg-white/50 backdrop-blur-sm p-2 rounded-2xl sticky top-0 z-10">
                <span className="text-3xl drop-shadow-sm">{period.emoji}</span>
                <h3 className={`text-2xl font-black uppercase tracking-tighter ${period.color}`}>{period.name}</h3>
                <div className="h-0.5 flex-1 bg-slate-200/50" />
                <span className="bg-white px-4 py-1.5 rounded-full text-xs font-black text-slate-400 border border-slate-200 shadow-sm uppercase">
                  {periodTasks.length} {periodTasks.length === 1 ? 'Nota' : 'Notas'}
                </span>
              </div>
              
              <div className="space-y-6">
                {periodTasks.map(task => (
                  <div 
                    key={task.id}
                    onClick={() => onEditTask(task)}
                    className={`group relative bg-white border border-slate-200 rounded-[2rem] p-6 md:p-8 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 cursor-pointer flex gap-6 items-start ${task.completed ? 'opacity-60 bg-slate-50 grayscale' : ''}`}
                  >
                    <div className={`absolute left-0 top-10 bottom-10 w-2 rounded-r-full shadow-sm ${PRIORITY_INDICATORS[task.priority]}`} />

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleTask(task.id);
                      }}
                      className={`mt-1 flex-shrink-0 w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white shadow-emerald-100 shadow-lg' : 'bg-slate-50 border-slate-200 hover:border-blue-400 hover:bg-white'}`}
                    >
                      {task.completed && <Check />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className={`text-xl font-bold text-slate-800 truncate leading-none ${task.completed ? 'line-through text-slate-400' : ''}`}>
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-black text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl uppercase tracking-tight">
                            {task.startTime}
                          </span>
                        </div>
                      </div>
                      
                      {task.description ? (
                        <div className="relative mb-4">
                          <p className={`text-xl text-slate-600 note-font leading-relaxed ${task.completed ? 'text-slate-400' : ''}`}>
                            {task.description}
                          </p>
                          <div className="absolute -bottom-1 left-0 right-0 h-px bg-blue-100/50" />
                        </div>
                      ) : (
                        <div className="h-4" />
                      )}

                      <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-50">
                        {task.tags?.map(tagName => {
                          const tagDef = availableTags.find(t => t.name === tagName);
                          const color = tagDef ? tagDef.color : '#3b82f6';
                          return (
                            <span 
                              key={tagName} 
                              style={{ backgroundColor: `${color}1A`, color: color, borderColor: `${color}33` }}
                              className="flex items-center gap-1.5 text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-tighter shadow-sm border"
                            >
                              <Tag /> {tagName}
                            </span>
                          );
                        })}
                        {task.repeat !== 'none' && (
                          <span className="flex items-center gap-1 text-[10px] font-black text-purple-600 bg-purple-50 px-3 py-1.5 rounded-xl uppercase tracking-tighter shadow-sm border border-purple-100">
                            🔄 Recorrente
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
          <div className="flex flex-col items-center justify-center py-40 text-center animate-in fade-in zoom-in duration-700">
            <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center mb-8 shadow-2xl border border-slate-100 rotate-12">
              <span className="text-6xl">📝</span>
            </div>
            <h3 className="text-3xl font-black text-slate-800 mb-3 tracking-tighter">Sua folha está em branco!</h3>
            <p className="text-slate-500 max-w-xs font-medium text-lg leading-snug">
              Nenhuma tarefa anotada para hoje. Que tal começar a planejar agora?
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListView;
