
import React, { useState, useCallback, useEffect } from 'react';
import Calendar from './components/Calendar';
import TaskModal from './components/TaskModal';
import { Task, ViewType, RepeatType, RepeatConfig } from './types';
import { MONTHS } from './constants';
import { ChevronLeft, ChevronRight, Plus, Sparkles, Menu, Tag, Plus as PlusIcon } from './components/Icons';
import { suggestOptimizedSchedule } from './services/geminiService';

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('week');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('taskflow_tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [availableTags, setAvailableTags] = useState<string[]>(() => {
    const saved = localStorage.getItem('taskflow_tags');
    return saved ? JSON.parse(saved) : ['Trabalho', 'Pessoal', 'Saúde', 'Estudo'];
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Partial<Task> | undefined>();
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');

  useEffect(() => {
    localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('taskflow_tags', JSON.stringify(availableTags));
  }, [availableTags]);

  const handlePrev = () => {
    const d = new Date(currentDate);
    if (view === 'week') {
      d.setDate(d.getDate() - 7);
    } else {
      d.setMonth(d.getMonth() - 1);
    }
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (view === 'week') {
      d.setDate(d.getDate() + 7);
    } else {
      d.setMonth(d.getMonth() + 1);
    }
    setCurrentDate(d);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleToggleTask = useCallback((id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }, []);

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCreateTask = (date: Date, time: string) => {
    setEditingTask({ date: date.toISOString(), startTime: time, tags: [], repeat: 'none' });
    setIsModalOpen(true);
  };

  const handleDateClick = (date: Date) => {
    handleCreateTask(date, "09:00");
  };

  const generateRecurringTasks = (baseTask: Task, count: number = 12): Task[] => {
    const recurring: Task[] = [];
    const startDate = new Date(baseTask.date);
    
    for (let i = 1; i <= count; i++) {
      const nextDate = new Date(startDate);
      
      if (baseTask.repeat === 'daily') {
        nextDate.setDate(startDate.getDate() + i);
      } else if (baseTask.repeat === 'weekly') {
        nextDate.setDate(startDate.getDate() + (i * 7));
      } else if (baseTask.repeat === 'monthly') {
        nextDate.setMonth(startDate.getMonth() + i);
      } else if (baseTask.repeat === 'custom' && baseTask.repeatConfig) {
        const { interval, unit, daysOfWeek } = baseTask.repeatConfig;
        if (unit === 'day') {
          nextDate.setDate(startDate.getDate() + (i * interval));
        } else if (unit === 'week') {
          // If daysOfWeek specified, we'd need more complex logic to fill gaps.
          // Simple implementation: repeat the whole pattern
          nextDate.setDate(startDate.getDate() + (i * interval * 7));
        } else if (unit === 'month') {
          nextDate.setMonth(startDate.getMonth() + (i * interval));
        }
      } else {
        break;
      }

      recurring.push({
        ...baseTask,
        id: `${baseTask.id}-rec-${i}`,
        date: nextDate.toISOString(),
        parentId: baseTask.id
      });
    }
    return recurring;
  };

  const handleSaveTask = (taskData: Partial<Task>) => {
    if (editingTask?.id) {
      // Simple edit - just update the specific instance for now
      setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...taskData } as Task : t));
    } else {
      const rootId = Math.random().toString(36).substr(2, 9);
      const newTask: Task = {
        id: rootId,
        title: taskData.title || 'Sem título',
        description: taskData.description,
        date: taskData.date || new Date().toISOString(),
        startTime: taskData.startTime || '09:00',
        duration: taskData.duration || 30,
        completed: false,
        priority: taskData.priority || 'medium',
        tags: taskData.tags || [],
        repeat: taskData.repeat || 'none',
        repeatConfig: taskData.repeatConfig
      };

      let allNewTasks = [newTask];
      if (newTask.repeat !== 'none') {
        allNewTasks = [...allNewTasks, ...generateRecurringTasks(newTask)];
      }

      setTasks(prev => [...prev, ...allNewTasks]);
    }
    setIsModalOpen(false);
    setEditingTask(undefined);
  };

  const handleDeleteTask = (id: string) => {
    const taskToDelete = tasks.find(t => t.id === id);
    if (taskToDelete?.parentId || tasks.some(t => t.parentId === id)) {
      if (confirm('Deseja excluir todas as ocorrências desta tarefa recorrente?')) {
        const rootId = taskToDelete?.parentId || id;
        setTasks(prev => prev.filter(t => t.id !== rootId && t.parentId !== rootId));
      } else {
        setTasks(prev => prev.filter(t => t.id !== id));
      }
    } else {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
    setIsModalOpen(false);
    setEditingTask(undefined);
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTagInput.trim() && !availableTags.includes(newTagInput.trim())) {
      setAvailableTags(prev => [...prev, newTagInput.trim()]);
      setNewTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setAvailableTags(prev => prev.filter(t => t !== tag));
  };

  const optimizeSchedule = async () => {
    setIsOptimizing(true);
    try {
      const suggestions = await suggestOptimizedSchedule(tasks, currentDate);
      if (suggestions && suggestions.length > 0) {
        setTasks(prev => prev.map(t => {
          const suggestion = suggestions.find(s => s.id === t.id);
          return suggestion ? { ...t, startTime: suggestion.startTime } : t;
        }));
        alert('Agenda otimizada pela IA com sucesso!');
      }
    } catch (e) {
      console.error(e);
      alert('Falha ao otimizar agenda.');
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden text-slate-700 bg-white">
      <header className="flex items-center justify-between px-4 py-2 border-b bg-white/80 backdrop-blur-md z-30">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600 active:scale-90"
          >
            <Menu />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-bold shadow-blue-200 shadow-lg">T</div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800 hidden md:block">TaskFlow</h1>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <button 
              onClick={handleToday}
              className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all font-bold text-sm"
            >
              Hoje
            </button>
            <div className="flex gap-1 ml-2">
              <button onClick={handlePrev} className="p-2 hover:bg-slate-100 rounded-full transition-colors active:scale-75"><ChevronLeft /></button>
              <button onClick={handleNext} className="p-2 hover:bg-slate-100 rounded-full transition-colors active:scale-75"><ChevronRight /></button>
            </div>
            <h2 className="text-lg md:text-xl font-bold ml-2 min-w-[180px] text-slate-800">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex border border-slate-200 rounded-xl overflow-hidden bg-slate-50 p-1 mr-2">
            <button 
              onClick={() => setView('week')}
              className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${view === 'week' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Semana
            </button>
            <button 
              onClick={() => setView('month')}
              className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${view === 'month' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Mês
            </button>
          </div>

          <button 
            onClick={optimizeSchedule}
            disabled={isOptimizing}
            className={`flex items-center gap-2 px-3 md:px-5 py-2.5 rounded-xl font-bold transition-all text-sm md:text-base ${isOptimizing ? 'bg-indigo-100 text-indigo-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-blue-200 shadow-lg hover:shadow-xl active:scale-95'}`}
          >
            {isOptimizing ? 'Organizando...' : <><Sparkles /><span className="hidden md:inline">Otimizar com IA</span></>}
          </button>
          
          <button 
            onClick={() => { setEditingTask({ date: currentDate.toISOString() }); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 md:px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 shadow-lg hover:shadow-xl transition-all active:scale-95"
          >
            <Plus /><span className="hidden md:inline">Criar</span>
          </button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <aside className={`${sidebarOpen ? 'w-64 px-4 opacity-100' : 'w-0 px-0 opacity-0'} transition-all duration-500 border-r bg-slate-50 py-6 flex flex-col gap-8 overflow-y-auto overflow-x-hidden border-slate-200 scroll-smooth`}>
          <section>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5 px-2">Minhas Tags</h3>
            <div className="space-y-1.5 px-1">
              {availableTags.map(tag => (
                <div key={tag} className="flex items-center justify-between group px-3 py-2 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all cursor-default">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    {tag}
                  </div>
                  <button onClick={() => removeTag(tag)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all font-bold">×</button>
                </div>
              ))}
            </div>
            <form onSubmit={handleAddTag} className="mt-4 px-1 relative">
              <input 
                type="text" 
                placeholder="Adicionar nova..."
                className="w-full pl-3 pr-8 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
              />
              <button type="submit" className="absolute right-3 top-2 text-slate-400 hover:text-blue-600">
                <PlusIcon />
              </button>
            </form>
          </section>

          <section>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5 px-2">Prioridade Alta</h3>
            <div className="space-y-2.5 px-1">
              {tasks.filter(t => !t.completed && t.priority === 'high').slice(0, 5).map(task => (
                <div 
                  key={task.id} 
                  onClick={() => handleEditTask(task)}
                  className="p-3 bg-white border-l-4 border-l-rose-500 border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="font-bold text-xs truncate text-slate-800 group-hover:text-blue-600 transition-colors">{task.title}</div>
                  <div className="text-[10px] text-slate-400 mt-1 font-medium flex items-center gap-1">
                    <span className="bg-slate-100 px-1.5 rounded-md">{task.startTime}</span>
                    <span className="opacity-50">•</span>
                    <span>{new Date(task.date).toLocaleDateString('pt-BR', {day: 'numeric', month: 'short'})}</span>
                  </div>
                </div>
              ))}
              {tasks.filter(t => !t.completed && t.priority === 'high').length === 0 && (
                <div className="text-xs text-slate-400 text-center py-4 bg-slate-100/50 rounded-xl border border-dashed border-slate-200">
                  Nada urgente por aqui.
                </div>
              )}
            </div>
          </section>

          <section className="mt-auto px-1">
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-2xl border border-indigo-100 shadow-sm relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-12 h-12 bg-white/40 blur-2xl group-hover:scale-150 transition-transform duration-1000" />
              <h4 className="text-indigo-800 text-xs font-black mb-2 flex items-center gap-2">
                <Sparkles /> IA OPTIMIZER
              </h4>
              <p className="text-indigo-600 text-[11px] leading-relaxed font-medium">
                Sua agenda está muito cheia? Deixe a Gemini analisar suas prioridades e sugerir o melhor horário para cada tarefa.
              </p>
            </div>
          </section>
        </aside>

        <section className="flex-1 bg-white relative">
          <Calendar 
            currentDate={currentDate} 
            view={view}
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onEditTask={handleEditTask}
            onCreateTask={handleCreateTask}
            onDateClick={handleDateClick}
          />
        </section>
      </main>

      <TaskModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTask(undefined); }}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        initialData={editingTask}
        availableTags={availableTags}
      />
    </div>
  );
};

export default App;
