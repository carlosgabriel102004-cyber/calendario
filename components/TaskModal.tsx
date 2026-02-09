
import React, { useState, useEffect } from 'react';
import { Task, Priority, RepeatType, RepeatConfig, TagDef } from '../types';
import { Tag, Repeat as RepeatIcon, Plus } from './Icons';
import { WEEK_DAYS } from '../constants';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  onDelete?: (id: string) => void;
  initialData?: Partial<Task>;
  availableTags: TagDef[];
  onQuickAddTag?: (name: string, color: string) => void; // Nova prop para adicionar tag rápido
}

const TaskModal: React.FC<TaskModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete, 
  initialData, 
  availableTags,
  onQuickAddTag 
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [duration, setDuration] = useState(30);
  const [priority, setPriority] = useState<Priority>('medium');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [repeat, setRepeat] = useState<RepeatType>('none');
  const [customRepeat, setCustomRepeat] = useState<RepeatConfig>({ interval: 1, unit: 'day', daysOfWeek: [] });
  
  // Estados para criação rápida de tag
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [quickTagName, setQuickTagName] = useState('');

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
    }
  }, [initialData, isOpen]);

  const toggleTag = (tagName: string) => {
    setSelectedTags(prev => 
      prev.includes(tagName) ? prev.filter(t => t !== tagName) : [...prev, tagName]
    );
  };

  const handleQuickAddTag = () => {
    if (quickTagName.trim() && onQuickAddTag) {
      const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
      onQuickAddTag(quickTagName.trim(), randomColor);
      setSelectedTags(prev => [...prev, quickTagName.trim()]);
      setQuickTagName('');
      setIsAddingTag(false);
    }
  };

  if (!isOpen) return null;

  const inputClass = "w-full px-4 py-2.5 bg-slate-100 text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-500 font-medium";

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-8 max-h-[85vh] overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <span className="w-2 h-8 bg-blue-600 rounded-full" />
              {initialData?.id ? 'Editar Nota' : 'Nova Tarefa'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">×</button>
          </div>
          
          <div className="space-y-6">
            <input
              type="text"
              autoFocus
              className="w-full text-3xl font-black placeholder:text-slate-200 text-slate-800 outline-none bg-transparent mb-4"
              placeholder="O que vamos fazer?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Data</label>
                <input type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Horário</label>
                <input type="time" className={inputClass} value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Tag /> Etiquetas
                </label>
                <button 
                  onClick={() => setIsAddingTag(!isAddingTag)}
                  className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase flex items-center gap-1 transition-colors"
                >
                  <Plus /> Criar Nova
                </button>
              </div>

              {isAddingTag && (
                <div className="flex gap-2 mb-4 animate-in slide-in-from-top-1 duration-200">
                  <input 
                    type="text"
                    placeholder="Nome da etiqueta..."
                    className="flex-1 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-xl text-xs font-bold text-blue-900 outline-none"
                    value={quickTagName}
                    onChange={(e) => setQuickTagName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleQuickAddTag()}
                  />
                  <button 
                    onClick={handleQuickAddTag}
                    className="px-4 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold"
                  >
                    Add
                  </button>
                </div>
              )}

              <div className="flex flex-wrap gap-2 min-h-[40px] p-1">
                {availableTags.map(tag => {
                  const isSelected = selectedTags.includes(tag.name);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.name)}
                      style={{
                        backgroundColor: isSelected ? tag.color : 'transparent',
                        color: isSelected ? '#ffffff' : tag.color,
                        borderColor: isSelected ? tag.color : `${tag.color}44`
                      }}
                      className={`px-4 py-2 rounded-2xl text-[11px] font-black transition-all border-2 ${isSelected ? 'shadow-lg scale-105' : 'hover:bg-slate-50'}`}
                    >
                      {tag.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Repetição</label>
                <select className={inputClass} value={repeat} onChange={(e) => setRepeat(e.target.value as RepeatType)}>
                  <option value="none">Não repetir</option>
                  <option value="daily">Todo dia</option>
                  <option value="weekly">Toda semana</option>
                  <option value="monthly">Todo mês</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Prioridade</label>
                <select className={inputClass} value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
                  <option value="low">Baixa 🟢</option>
                  <option value="medium">Média 🟡</option>
                  <option value="high">Alta 🔴</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Descrição / Notas</label>
              <textarea
                className={`${inputClass} min-h-[120px] resize-none note-font text-lg`}
                placeholder="Escreva seus pensamentos ou detalhes aqui..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-6 flex justify-between items-center border-t border-slate-100">
          {initialData?.id ? (
            <button onClick={() => onDelete?.(initialData.id!)} className="px-6 py-3 text-rose-500 font-black text-xs uppercase hover:bg-rose-50 rounded-2xl transition-colors">Excluir</button>
          ) : <div />}
          
          <div className="flex gap-3">
            <button onClick={onClose} className="px-6 py-3 text-slate-400 font-black text-xs uppercase hover:bg-slate-200 rounded-2xl transition-colors">Cancelar</button>
            <button
              onClick={() => onSave({ title, date, startTime, duration, priority, description, tags: selectedTags, repeat, repeatConfig: customRepeat })}
              disabled={!title || !date}
              className="px-10 py-3 bg-slate-900 text-white font-black text-xs uppercase rounded-2xl hover:bg-blue-600 shadow-xl transition-all disabled:opacity-30 active:scale-95"
            >
              Salvar Nota
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
