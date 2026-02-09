
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

  const periods = ['Manhã', 'Tarde', 'Noite'];
  
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 custom-scrollbar">
      <div className="max-w-4xl mx-auto space-y-8">
        {periods.map(period => {
          const periodTasks = tasks.filter(t => categorizeTask(t) === period);
          if (periodTasks.length === 0) return null;

          return (
            <section key={period} className="space-y-4">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-slate-800">{period}</h3>
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {periodTasks.length} {periodTasks.length === 1 ? 'tarefa' : 'tarefas'}
                </span>
              </div>
              
              <div className="grid gap-3">
                {periodTasks.map(task => (
                  <div 
                    key={task.id}
                    onClick={() => onEditTask(task)}
                    className={`group relative bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex gap-4 items-start ${task.completed ? 'opacity-60 bg-slate-50' : ''}`}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleTask(task.id);
                      }}
                      className={`mt-1 flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 hover:border-blue-400'}`}
                    >
                      {task.completed && <Check />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`text-base font-bold text-slate-800 truncate ${task.completed ? 'line-through text-slate-400' : ''}`}>
                          {task.title}
                        </h4>
                        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                          {task.startTime}
                        </span>
                      </div>
                      
                      {task.description && (
                        <p className={`text-sm text-slate-500 mb-3 line-clamp-2 italic ${task.completed ? 'text-slate-400' : ''}`}>
                          {task.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2">
                        <div className={`w-2 h-2 rounded-full mt-1.5 ${PRIORITY_INDICATORS[task.priority]}`} />
                        {task.tags?.map(tag => (
                          <span key={tag} className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            <Tag /> {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
        
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">📝</span>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Sua lista está limpa!</h3>
            <p className="text-slate-500 max-w-xs">Nenhuma tarefa agendada para este dia. Aproveite o seu tempo livre ou crie algo novo.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListView;
