
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import Calendar from './components/Calendar';
import ListView from './components/ListView';
import TaskModal from './components/TaskModal';
import { Task, ViewType, TagDef } from './types';
import { MONTHS } from './constants';
import { ChevronLeft, ChevronRight, Plus, Sparkles, Menu, Tag, Plus as PlusIcon, Download, Upload } from './components/Icons';
import { suggestOptimizedSchedule } from './services/geminiService';

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('week');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('taskflow_tasks');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [availableTags, setAvailableTags] = useState<TagDef[]>(() => {
    try {
      const saved = localStorage.getItem('taskflow_tags');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: '1', name: 'Trabalho', color: '#ef4444' },
      { id: '2', name: 'Pessoal', color: '#3b82f6' },
      { id: '3', name: 'Saúde', color: '#10b981' },
      { id: '4', name: 'Estudo', color: '#8b5cf6' }
    ];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Partial<Task> | undefined>();
  const [isOptimizing, setIsOptimizing] = useState(false);
  
  const [newTagInput, setNewTagInput] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3b82f6');

  useEffect(() => {
    localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('taskflow_tags', JSON.stringify(availableTags));
  }, [availableTags]);

  const handleQuickAddTag = (name: string, color: string) => {
    if (!availableTags.some(t => t.name.toLowerCase() === name.toLowerCase())) {
      setAvailableTags(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        name: name,
        color: color
      }]);
    }
  };

  const handleExportBackup = () => {
    const data = { tasks, tags: availableTags };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TaskFlow_Backup.json`;
    a.click();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.tasks) setTasks(data.tasks);
        if (data.tags) setAvailableTags(data.tags);
        alert('Backup restaurado!');
      } catch(error) {
        alert('Erro ao importar.');
      }
    };
    reader.readAsText(file);
  };

  const handlePrev = () => {
    const d = new Date(currentDate);
    if (view === 'week') d.setDate(d.getDate() - 7);
    else if (view === 'month') d.setMonth(d.getMonth() - 1);
    else d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (view === 'week') d.setDate(d.getDate() + 7);
    else if (view === 'month') d.setMonth(d.getMonth() + 1);
    else d.setDate(d.getDate() + 1);
    setCurrentDate(d);
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

  const tasksForSelectedDate = useMemo(() => {
    const dateStr = currentDate.toISOString().split('T')[0];
    return tasks.filter(t => t.date.split('T')[0] === dateStr);
  }, [tasks, currentDate]);

  const generateRecurringTasks = (baseTask: Task, count: number = 12): Task[] => {
    const recurring: Task[] = [];
    const startDate = new Date(baseTask.date);
    for (let i = 1; i <= count; i++) {
      const nextDate = new Date(startDate);
      if (baseTask.repeat === 'daily') nextDate.setDate(startDate.getDate() + i);
      else if (baseTask.repeat === 'weekly') nextDate.setDate(startDate.getDate() + (i * 7));
      else if (baseTask.repeat === 'monthly') nextDate.setMonth(startDate.getMonth() + i);
      recurring.push({ ...baseTask, id: `${baseTask.id}-rec-${i}`, date: nextDate.toISOString(), parentId: baseTask.id });
    }
    return recurring;
  };

  const handleSaveTask = (taskData: Partial<Task>) => {
    if (editingTask?.id) {
      setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...taskData } as Task : t));
    } else {
      const newTask: Task = {
        id: Math.random().toString(36).substr(2, 9),
        title: taskData.title || 'Sem título',
        description: taskData.description,
        date: taskData.date || new Date().toISOString(),
        startTime: taskData.startTime || '09:00',
        duration: taskData.duration || 30,
        completed: false,
        priority: taskData.priority || 'medium',
        tags: taskData.tags || [],
        repeat: taskData.repeat || 'none'
      };
      let allNewTasks = [newTask];
      if (newTask.repeat !== 'none') allNewTasks = [...allNewTasks, ...generateRecurringTasks(newTask)];
      setTasks(prev => [...prev, ...allNewTasks]);
    }
    setIsModalOpen(false);
    setEditingTask(undefined);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id && t.parentId !== id));
    setIsModalOpen(false);
    setEditingTask(undefined);
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    handleQuickAddTag(newTagInput, newTagColor);
    setNewTagInput('');
  };

  const updateTagColor = (id: string, color: string) => {
    setAvailableTags(prev => prev.map(t => t.id === id ? { ...t, color } : t));
  };

  const removeTag = (id: string) => {
    setAvailableTags(prev => prev.filter(t => t.id !== id));
  };

  const optimizeSchedule = async () => {
    setIsOptimizing(true);
    try {
      const suggestions = await suggestOptimizedSchedule(tasks, currentDate);
      if (suggestions?.length > 0) {
        setTasks(prev => prev.map(t => {
          const sug = suggestions.find(s => s.id === t.id);
          return sug ? { ...t, startTime: sug.startTime } : t;
        }));
        alert('Otimizado!');
      }
    } catch (e) {
      alert('Erro ao otimizar.');
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden text-slate-700 bg-white">
      <header className="flex items-center justify-between px-4 py-2 border-b bg-white/80 backdrop-blur-md z-30">
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600 active:scale-90"><Menu /></button>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">T</div>
            <h1 className="text-xl font-black tracking-tighter text-slate-800 hidden md:block uppercase">TaskFlow</h1>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <button onClick={() => setCurrentDate(new Date())} className="px-4 py-1.5 border border-slate-200 rounded-xl hover:bg-slate-50 font-black text-xs uppercase transition-all">Hoje</button>
            <div className="flex gap-1 ml-2">
              <button onClick={handlePrev} className="p-2 hover:bg-slate-100 rounded-full active:scale-75 transition-all"><ChevronLeft /></button>
              <button onClick={handleNext} className="p-2 hover:bg-slate-100 rounded-full active:scale-75 transition-all"><ChevronRight /></button>
            </div>
            <h2 className="text-lg font-black ml-2 min-w-[180px] text-slate-800 uppercase tracking-tighter">
              {MONTHS[currentDate.getMonth()]} {view === 'list' ? currentDate.getDate() : ''} {currentDate.getFullYear()}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex border border-slate-200 rounded-xl overflow-hidden bg-slate-50 p-1 mr-2">
            {['list', 'week', 'month'].map((v) => (
              <button 
                key={v}
                onClick={() => setView(v as ViewType)} 
                className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${view === v ? 'bg-white shadow-md text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {v === 'list' ? 'Lista' : v === 'week' ? 'Semana' : 'Mês'}
              </button>
            ))}
          </div>

          <button onClick={optimizeSchedule} disabled={isOptimizing} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase transition-all ${isOptimizing ? 'bg-indigo-100 text-indigo-400' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100 shadow-xl'}`}>
            <Sparkles /> {isOptimizing ? '...' : <span className="hidden md:inline">Otimizar</span>}
          </button>
          <button onClick={() => { setEditingTask({ date: currentDate.toISOString() }); setIsModalOpen(true); }} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase hover:bg-slate-800 shadow-xl active:scale-95 transition-all">
            <Plus /> <span className="hidden md:inline">Novo</span>
          </button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <aside className={`${sidebarOpen ? 'w-64 px-4' : 'w-0 px-0 opacity-0'} transition-all duration-300 border-r bg-slate-50 py-6 flex flex-col gap-8 shrink-0 overflow-hidden`}>
          <section className="flex-1 overflow-y-auto custom-scrollbar">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5 px-2">Minhas Etiquetas</h3>
            <div className="space-y-2 px-1">
              {availableTags.map(tag => (
                <div key={tag.id} className="flex items-center justify-between group px-3 py-2 rounded-xl bg-white shadow-sm border border-slate-100 hover:border-slate-300 transition-all">
                  <div className="flex items-center gap-3">
                    <input type="color" value={tag.color} onChange={(e) => updateTagColor(tag.id, e.target.value)} className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent shrink-0" />
                    <span className="text-xs font-black text-slate-700 truncate uppercase tracking-tighter">{tag.name}</span>
                  </div>
                  <button onClick={() => removeTag(tag.id)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 font-bold px-1">×</button>
                </div>
              ))}
            </div>
            <form onSubmit={handleAddTag} className="mt-4 px-1">
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 focus-within:ring-2 focus-within:ring-blue-500">
                <input type="color" value={newTagColor} onChange={(e) => setNewTagColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer shrink-0 ml-1" />
                <input type="text" placeholder="Tag..." className="w-full text-[10px] font-black uppercase text-slate-700 bg-transparent outline-none p-1" value={newTagInput} onChange={(e) => setNewTagInput(e.target.value)} />
                <button type="submit" className="text-slate-400 hover:text-blue-600 p-1"><PlusIcon /></button>
              </div>
            </form>
          </section>

          <section className="pt-6 border-t border-slate-200">
            <div className="space-y-2 px-1">
              <button onClick={handleExportBackup} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase hover:bg-slate-700 transition-all shadow-md"><Download /> Backup</button>
              <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-xl text-[10px] font-black uppercase hover:bg-slate-50 transition-all shadow-sm"><Upload /> Restaurar</button>
              <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleImportBackup} />
            </div>
          </section>
        </aside>

        <section className="flex-1 bg-white relative flex flex-col min-w-0">
          {view === 'list' ? (
            <ListView tasks={tasksForSelectedDate} onToggleTask={handleToggleTask} onEditTask={handleEditTask} availableTags={availableTags} />
          ) : (
            <Calendar currentDate={currentDate} view={view} tasks={tasks} onToggleTask={handleToggleTask} onEditTask={handleEditTask} onCreateTask={handleCreateTask} onDateClick={(d) => { setCurrentDate(d); setView('list'); }} availableTags={availableTags} />
          )}
        </section>
      </main>

      <TaskModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTask(undefined); }}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        initialData={editingTask}
        availableTags={availableTags}
        onQuickAddTag={handleQuickAddTag}
      />
    </div>
  );
};

export default App;
