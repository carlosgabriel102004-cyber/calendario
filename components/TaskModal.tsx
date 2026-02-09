
import React, { useState, useEffect } from 'react';
import { Task, Priority, RepeatType, RepeatConfig } from '../types';
import { Tag, Repeat as RepeatIcon } from './Icons';
import { WEEK_DAYS } from '../constants';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  onDelete?: (id: string) => void;
  initialData?: Partial<Task>;
  availableTags: string[];
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, onDelete, initialData, availableTags }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [duration, setDuration] = useState(30);
  const [priority, setPriority] = useState<Priority>('medium');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [repeat, setRepeat] = useState<RepeatType>('none');
  const [customRepeat, setCustomRepeat] = useState<RepeatConfig>({ interval: 1, unit: 'day', daysOfWeek: [] });

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDate(initialData.date?.split('T')[0] || '');
      setStartTime(initialData.startTime || '09:00');
      setDuration(initialData.duration || 30);
      setPriority(initialData.priority || 'medium');
      setDescription(initialData.description || '');
      setSelectedTags(initialData.tags || []);
      setRepeat(initialData.repeat || 'none');
      setCustomRepeat(initialData.repeatConfig || { interval: 1, unit: 'day', daysOfWeek: [] });
    } else {
      setTitle('');
      setDate(new Date().toISOString().split('T')[0]);
      setStartTime('09:00');
      setDuration(30);
      setPriority('medium');
      setDescription('');
      setSelectedTags([]);
      setRepeat('none');
      setCustomRepeat({ interval: 1, unit: 'day', daysOfWeek: [] });
    }
  }, [initialData, isOpen]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const toggleDay = (dayIndex: number) => {
    setCustomRepeat(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek?.includes(dayIndex)
        ? prev.daysOfWeek.filter(d => d !== dayIndex)
        : [...(prev.daysOfWeek || []), dayIndex]
    }));
  };

  if (!isOpen) return null;

  const inputClass = "w-full px-4 py-2.5 bg-slate-100 text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-500 font-medium";

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-8 max-h-[85vh] overflow-y-auto custom-scrollbar">
          <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-3">
            <div className="w-2 h-8 bg-blue-600 rounded-full" />
            {initialData?.id ? 'Editar Tarefa' : 'Nova Tarefa'}
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Título da Tarefa</label>
              <input
                type="text"
                autoFocus
                className={inputClass}
                placeholder="Ex: Reunião de Planejamento"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Data de Início</label>
                <input
                  type="date"
                  className={inputClass}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Horário</label>
                <input
                  type="time"
                  className={inputClass}
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Repetição</label>
                <div className="relative">
                  <select
                    className={`${inputClass} appearance-none pr-10`}
                    value={repeat}
                    onChange={(e) => setRepeat(e.target.value as RepeatType)}
                  >
                    <option value="none">Não repetir</option>
                    <option value="daily">Diariamente</option>
                    <option value="weekly">Semanalmente</option>
                    <option value="monthly">Mensalmente</option>
                    <option value="custom">Personalizado...</option>
                  </select>
                  <div className="absolute right-3 top-3 pointer-events-none text-slate-500">
                    <RepeatIcon />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Prioridade</label>
                <select
                  className={inputClass}
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>
            </div>

            {repeat === 'custom' && (
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-blue-900 whitespace-nowrap">Repetir a cada</span>
                  <input 
                    type="number" 
                    min="1"
                    className="w-16 px-2 py-1 bg-white border border-blue-200 rounded-lg text-center font-bold text-blue-900"
                    value={customRepeat.interval}
                    onChange={(e) => setCustomRepeat(prev => ({ ...prev, interval: parseInt(e.target.value) || 1 }))}
                  />
                  <select 
                    className="bg-transparent font-bold text-blue-900 outline-none cursor-pointer"
                    value={customRepeat.unit}
                    onChange={(e) => setCustomRepeat(prev => ({ ...prev, unit: e.target.value as any }))}
                  >
                    <option value="day">Dias</option>
                    <option value="week">Semanas</option>
                    <option value="month">Meses</option>
                  </select>
                </div>
                
                {customRepeat.unit === 'week' && (
                  <div>
                    <span className="text-xs font-bold text-blue-800 uppercase mb-2 block">Nos dias:</span>
                    <div className="flex gap-1 justify-between">
                      {WEEK_DAYS.map((day, i) => (
                        <button
                          key={day}
                          onClick={() => toggleDay(i)}
                          className={`w-8 h-8 rounded-full text-[10px] font-bold transition-all ${customRepeat.daysOfWeek?.includes(i) ? 'bg-blue-600 text-white' : 'bg-white text-blue-400 hover:bg-blue-100'}`}
                        >
                          {day[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Tag /> Tags de Organização
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedTags.includes(tag) ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Notas e Detalhes</label>
              <textarea
                className={`${inputClass} min-h-[100px] resize-none`}
                placeholder="Adicione observações importantes aqui..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-6 flex justify-between items-center border-t border-slate-100">
          {initialData?.id ? (
            <button
              onClick={() => onDelete?.(initialData.id!)}
              className="px-6 py-2.5 text-rose-600 font-bold hover:bg-rose-50 rounded-2xl transition-colors"
            >
              Excluir
            </button>
          ) : <div />}
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-2xl transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => onSave({ title, date, startTime, duration, priority, description, tags: selectedTags, repeat, repeatConfig: customRepeat })}
              disabled={!title || !date}
              className="px-10 py-2.5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:shadow-none active:scale-95"
            >
              Salvar Tarefa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
