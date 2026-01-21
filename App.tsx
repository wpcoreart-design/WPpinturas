
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Tool, ToolStatus, User, UserRole, Movement } from './types';
import { supabase } from './src/lib/supabase'; 
  LockClosedIcon, 
  WrenchScrewdriverIcon, 
  UserGroupIcon, 
  ArchiveBoxIcon, 
  ClockIcon, 
  ArrowRightOnRectangleIcon,
  TrashIcon,
  PlusIcon,
  UserPlusIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  FunnelIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

// --- SERVIÇO DE DADOS ---
const StorageService = {
  getData: () => {
    const data = localStorage.getItem('PINCELPRO_DATA_V3');
    if (!data) {
      const initial = {
        users: [{ id: '1', name: 'Gestor Geral', username: 'admin', password: '123', role: UserRole.ADMIN, active: true, totalDebt: 0 }],
        tools: [],
        history: []
      };
      localStorage.setItem('PINCELPRO_DATA_V3', JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  },
  save: (data: any) => {
    localStorage.setItem('PINCELPRO_DATA_V3', JSON.stringify(data));
    window.dispatchEvent(new Event('storage'));
  }
};

const CATEGORIES = ['Escadas', 'Desempenadeiras', 'Rolos', 'Lixas', 'Pistolas', 'Outros'];

const App: React.FC = () => {
    console.log('supabase:', supabase);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginForm, setLoginForm] = useState({ user: '', pass: '' });
  const [loginError, setLoginError] = useState('');

  const [users, setUsers] = useState<User[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [history, setHistory] = useState<Movement[]>([]);
  const [activeTab, setActiveTab] = useState<'tools' | 'users' | 'history' | 'debts'>('tools');
  const [categoryFilter, setCategoryFilter] = useState<string>('Todas');
  
  const [isToolModalOpen, setIsToolModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const loadData = useCallback(() => {
    const data = StorageService.getData();
    setUsers(data.users);
    setTools(data.tools.filter((t: Tool) => !t.isDeleted));
    setHistory(data.history);
  }, []);

  useEffect(() => {
    loadData();
    const session = sessionStorage.getItem('p_session');
    if (session) setCurrentUser(JSON.parse(session));
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, [loadData]);

  const persist = (u: User[], t: Tool[], h: Movement[]) => {
    StorageService.save({ users: u, tools: t, history: h });
    setUsers(u);
    setTools(t.filter(item => !item.isDeleted));
    setHistory(h);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const found = users.find(u => u.username === loginForm.user && u.password === loginForm.pass && u.active);
    if (found) {
      setCurrentUser(found);
      sessionStorage.setItem('p_session', JSON.stringify(found));
      setLoginError('');
    } else {
      setLoginError('Credenciais inválidas.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('p_session');
  };

  const toggleToolStatus = (toolId: string, action: 'retirada' | 'devolução', targetStatus: ToolStatus) => {
    if (!currentUser) return;
    const tool = tools.find(t => t.id === toolId);
    if (!tool) return;

    let days = 0;
    let cost = 0;

    if (action === 'devolução' && tool.withdrawDate) {
      const diff = Date.now() - tool.withdrawDate;
      days = Math.ceil(diff / (1000 * 60 * 60 * 24)) || 1;
      cost = days * tool.dailyRate;
    }

    const newMovement: Movement = {
      id: Math.random().toString(36).substr(2, 9),
      toolId,
      toolName: tool.name,
      userId: currentUser.id,
      userName: currentUser.name,
      action,
      timestamp: Date.now(),
      daysUsed: days,
      cost: cost
    };

    const newTools = tools.map(t => t.id === toolId ? { 
      ...t, 
      status: targetStatus, 
      withdrawDate: action === 'retirada' ? Date.now() : undefined,
      currentHolderId: action === 'retirada' ? currentUser.id : undefined,
      lastUpdate: Date.now() 
    } : t);

    const newUsers = users.map(u => u.id === currentUser.id ? { ...u, totalDebt: (u.totalDebt || 0) + cost } : u);
    persist(newUsers, newTools, [newMovement, ...history]);
  };

  const groupedTools = useMemo(() => {
    const filtered = categoryFilter === 'Todas' 
      ? tools 
      : tools.filter(t => t.category === categoryFilter);

    const groups: Record<string, Tool[]> = {};
    filtered.forEach(tool => {
      const cat = tool.category || 'Outros';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(tool);
    });
    return groups;
  }, [tools, categoryFilter]);

  const availableCategories = useMemo(() => {
    const cats = new Set(tools.map(t => t.category));
    return ['Todas', ...Array.from(cats)].sort();
  }, [tools]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
        <div className="bg-[#1F2933] w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl border border-slate-800">
          <div className="text-center mb-10">
            <div className="bg-[#22C55E] h-16 w-16 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg">
              <LockClosedIcon className="h-8 w-8 text-[#0F172A]" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tighter">PINCELPRO</h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Acesso à Obra</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="text" placeholder="Usuário" 
              className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-6 py-4 font-bold text-white outline-none focus:ring-2 focus:ring-[#22C55E] transition-all"
              value={loginForm.user} onChange={e => setLoginForm({...loginForm, user: e.target.value.toLowerCase()})} required
            />
            <input 
              type="password" placeholder="Senha" 
              className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-6 py-4 font-bold text-white outline-none focus:ring-2 focus:ring-[#22C55E] transition-all"
              value={loginForm.pass} onChange={e => setLoginForm({...loginForm, pass: e.target.value})} required
            />
            {loginError && <p className="text-rose-500 text-[10px] font-black uppercase text-center">{loginError}</p>}
            <button className="w-full bg-[#22C55E] text-[#0F172A] py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-[#16A34A] transition-all shadow-lg">Entrar</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F9FAFB] flex flex-col">
      <header className="bg-[#1F2933]/90 backdrop-blur-md border-b border-slate-800 px-6 py-5 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-[#22C55E] h-10 w-10 rounded-xl flex items-center justify-center">
              <WrenchScrewdriverIcon className="h-6 w-6 text-[#0F172A]" />
            </div>
            <div>
              <h1 className="font-black text-white tracking-tighter text-lg leading-none">PINCELPRO</h1>
              <span className="text-[9px] font-black text-[#22C55E] uppercase tracking-widest">Estoque Central</span>
            </div>
          </div>
          <div className="flex items-center space-x-5">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black uppercase text-white">{currentUser.name}</p>
              <p className="text-[10px] font-bold text-slate-500">{currentUser.role === UserRole.ADMIN ? 'Gestor' : 'Pintor'}</p>
            </div>
            <button onClick={handleLogout} className="p-2.5 bg-[#0F172A] text-slate-400 hover:text-rose-500 rounded-xl border border-slate-800 transition-all">
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <nav className="bg-[#0F172A] border-b border-slate-800 px-6 overflow-x-auto sticky top-[81px] z-30 scrollbar-hide">
        <div className="max-w-6xl mx-auto flex">
          <Tab label="Ferramentas" active={activeTab === 'tools'} onClick={() => setActiveTab('tools')} icon={<ArchiveBoxIcon className="h-4 w-4" />} />
          {currentUser.role === UserRole.ADMIN && (
            <>
              <Tab label="Equipe" active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<UserGroupIcon className="h-4 w-4" />} />
              <Tab label="Custos" active={activeTab === 'debts'} onClick={() => setActiveTab('debts')} icon={<CurrencyDollarIcon className="h-4 w-4" />} />
              <Tab label="Logs" active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<ClockIcon className="h-4 w-4" />} />
            </>
          )}
          {currentUser.role === UserRole.PAINTER && (
            <Tab label="Minha Posse" active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<ClockIcon className="h-4 w-4" />} />
          )}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto w-full p-6 flex-1 pb-20">
        {activeTab === 'tools' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight">Inventário</h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Controle de Saída e Devolução</p>
              </div>
              {currentUser.role === UserRole.ADMIN && (
                <button onClick={() => setIsToolModalOpen(true)} className="bg-[#22C55E] text-[#0F172A] px-5 py-3 rounded-2xl text-xs font-black uppercase flex items-center space-x-2 shadow-lg hover:scale-105 active:scale-95 transition-all">
                  <PlusIcon className="h-4 w-4 stroke-[3px]" /> <span>Novo Item</span>
                </button>
              )}
            </div>

            {/* Quick Filters */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
              <div className="bg-[#1F2933] p-1.5 rounded-2xl flex items-center space-x-1 border border-slate-800">
                <div className="p-2 text-[#22C55E]">
                  <FunnelIcon className="h-4 w-4" />
                </div>
                {availableCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      categoryFilter === cat 
                        ? 'bg-[#22C55E] text-[#0F172A] shadow-lg' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-12">
              {Object.keys(groupedTools).sort().map(category => (
                <div key={category} className="space-y-5">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#22C55E] bg-[#22C55E]/10 px-4 py-1.5 rounded-full border border-[#22C55E]/20">
                      {category}
                    </h3>
                    <div className="h-px flex-1 bg-slate-800"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {groupedTools[category].map(tool => (
                      <ToolCard 
                        key={tool.id} 
                        tool={tool} 
                        currentUser={currentUser} 
                        onAction={toggleToolStatus} 
                        onDelete={(id) => {
                          if(confirm('Excluir?')) persist(users, tools.map(t => t.id === id ? {...t, isDeleted: true} : t), history);
                        }} 
                      />
                    ))}
                  </div>
                </div>
              ))}
              {Object.keys(groupedTools).length === 0 && (
                <div className="py-20 text-center opacity-30 font-black uppercase text-xs tracking-widest">
                  Nenhum item encontrado.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'users' && currentUser.role === UserRole.ADMIN && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black uppercase tracking-tight">Pintores</h2>
              <button onClick={() => setIsUserModalOpen(true)} className="bg-[#22C55E] text-[#0F172A] px-5 py-3 rounded-2xl text-xs font-black uppercase flex items-center space-x-2">
                <UserPlusIcon className="h-4 w-4" /> <span>Adicionar</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {users.map(user => (
                <div key={user.id} className="bg-[#1F2933] p-6 rounded-[2.5rem] border border-slate-800 shadow-xl group">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-xl bg-[#0F172A] border border-slate-700 flex items-center justify-center font-black text-[#22C55E] text-lg">{user.name[0]}</div>
                      <div>
                        <h4 className="font-black text-white uppercase text-sm">{user.name}</h4>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">@{user.username}</span>
                      </div>
                    </div>
                    {user.id !== currentUser.id && (
                      <button 
                        onClick={() => persist(users.map(u => u.id === user.id ? {...u, active: !u.active} : u), tools, history)}
                        className={`p-2 rounded-lg transition-colors ${user.active ? 'text-slate-600 hover:text-rose-500' : 'text-rose-500 hover:text-green-500'}`}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  <div className="mt-6 flex justify-between items-center">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${user.active ? 'bg-green-500/10 text-[#22C55E] border-green-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                      {user.active ? 'Ativo' : 'Suspenso'}
                    </span>
                    <span className="text-[10px] font-black text-slate-500 uppercase">{user.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'debts' && currentUser.role === UserRole.ADMIN && (
          <div className="space-y-6">
            <h2 className="text-xl font-black uppercase tracking-tight">Custos Acumulados</h2>
            <div className="bg-[#1F2933] rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl">
              <table className="w-full text-left">
                <thead className="bg-[#0F172A] text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-slate-800">
                  <tr>
                    <th className="px-8 py-5">Colaborador</th>
                    <th className="px-8 py-5">Posse Atual</th>
                    <th className="px-8 py-5 text-right">Débito (R$)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {users.filter(u => u.role === UserRole.PAINTER).map(u => {
                    const activeTools = tools.filter(t => t.currentHolderId === u.id);
                    return (
                      <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-8 py-5 font-black text-white uppercase text-sm">{u.name}</td>
                        <td className="px-8 py-5 text-[10px] text-slate-400 uppercase font-bold">{activeTools.length > 0 ? activeTools.map(t => t.name).join(', ') : 'Nenhuma'}</td>
                        <td className="px-8 py-5 text-right font-black text-[#22C55E] text-lg">{(u.totalDebt || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <h2 className="text-xl font-black uppercase tracking-tight">Histórico de Movimentação</h2>
            <div className="space-y-4">
              {history
                .filter(m => currentUser.role === UserRole.ADMIN || m.userId === currentUser.id)
                .map(m => (
                <div key={m.id} className="bg-[#1F2933] p-5 rounded-2xl border border-slate-800 flex items-center justify-between shadow-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${m.action === 'retirada' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-[#22C55E]'}`}>
                      <ChevronRightIcon className={`h-5 w-5 ${m.action === 'devolução' ? 'rotate-180' : ''}`} />
                    </div>
                    <div>
                      <p className="text-sm font-bold">
                        <span className="text-[#22C55E] font-black uppercase">{m.userName}</span> 
                        <span className="text-slate-500 lowercase mx-2">{m.action === 'retirada' ? 'retirou' : 'devolveu'}</span>
                        <span className="text-white font-black uppercase">{m.toolName}</span>
                      </p>
                      <p className="text-[10px] font-bold text-slate-600 uppercase mt-0.5">{new Date(m.timestamp).toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                  {m.cost! > 0 && (
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-500 uppercase mb-0.5">{m.daysUsed} dias</p>
                      <p className="text-sm font-black text-[#22C55E]">R$ {m.cost?.toFixed(2)}</p>
                    </div>
                  )}
                </div>
              ))}
              {history.length === 0 && <p className="text-center py-20 opacity-20 font-black uppercase text-xs">Nenhum registro.</p>}
            </div>
          </div>
        )}
      </main>

      {isToolModalOpen && (
        <Modal title="Novo Patrimônio" onClose={() => setIsToolModalOpen(false)}>
          <ToolForm onAdd={t => { persist(users, [...tools, t], history); setIsToolModalOpen(false); }} />
        </Modal>
      )}

      {isUserModalOpen && (
        <Modal title="Novo Pintor" onClose={() => setIsUserModalOpen(false)}>
          <UserForm onAdd={u => { persist([...users, u], tools, history); setIsUserModalOpen(false); }} />
        </Modal>
      )}
    </div>
  );
};

const Tab = ({ label, active, onClick, icon }: any) => (
  <button onClick={onClick} className={`px-8 py-5 flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 shrink-0 ${active ? 'text-[#22C55E] border-[#22C55E]' : 'text-slate-500 border-transparent hover:text-slate-300'}`}>
    {icon} <span>{label}</span>
  </button>
);

const ToolCard = ({ tool, currentUser, onAction, onDelete }: any) => {
  const isHolder = tool.currentHolderId === currentUser.id;
  const isPainter = currentUser.role === UserRole.PAINTER;
  const isAdmin = currentUser.role === UserRole.ADMIN;

  return (
    <div className="bg-[#1F2933] p-6 rounded-[2.5rem] border border-slate-800 shadow-xl flex flex-col justify-between group hover:border-[#22C55E]/30 transition-all">
      <div>
        <div className="flex justify-between items-start mb-5">
          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border ${
            tool.status === ToolStatus.AVAILABLE ? 'bg-green-500/10 text-[#22C55E] border-green-500/20' :
            tool.status === ToolStatus.OUT ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}>{tool.status}</span>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold text-slate-700">PAT:{tool.id}</span>
            {isAdmin && (
              <button onClick={() => onDelete(tool.id)} className="p-1.5 text-slate-700 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"><TrashIcon className="h-4 w-4" /></button>
            )}
          </div>
        </div>
        <h3 className="text-lg font-black text-white uppercase tracking-tighter leading-tight mb-1">{tool.name}</h3>
        <div className="space-y-1 mb-6">
          <p className="text-[10px] font-black text-slate-500 uppercase truncate">Variação: <span className="text-white">{tool.model || 'Padrão'}</span></p>
          <p className="text-[10px] font-black text-[#22C55E] uppercase">Diária: R$ {tool.dailyRate.toFixed(2)}</p>
        </div>

        {tool.withdrawDate && (
          <div className="bg-[#0F172A] p-4 rounded-2xl mb-6 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-3.5 w-3.5 text-[#22C55E]" />
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Retirada:</div>
            </div>
            <div className="text-xs font-bold text-white">{new Date(tool.withdrawDate).toLocaleDateString()}</div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {tool.status === ToolStatus.AVAILABLE && isPainter && (
          <button onClick={() => onAction(tool.id, 'retirada', ToolStatus.OUT)} className="w-full py-4 bg-[#22C55E] text-[#0F172A] rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">Retirar Agora</button>
        )}
        {tool.status === ToolStatus.OUT && isHolder && (
          <button onClick={() => onAction(tool.id, 'devolução', ToolStatus.AVAILABLE)} className="w-full py-4 bg-white text-[#0F172A] rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">Devolver ao Estoque</button>
        )}
        {tool.status === ToolStatus.OUT && !isHolder && (
          <div className="bg-slate-800/30 p-4 rounded-2xl border border-slate-800 text-center">
             <p className="text-[9px] font-black text-slate-600 uppercase italic">Em uso por outro pintor</p>
          </div>
        )}
        {tool.status === ToolStatus.AVAILABLE && !isPainter && (
          <div className="text-center py-4 bg-[#0F172A] rounded-2xl border border-dashed border-slate-800">
            <p className="text-[9px] font-black text-slate-700 uppercase">Aguardando Pintor</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Modal = ({ title, onClose, children }: any) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
    <div className="bg-[#1F2933] w-full max-w-sm rounded-[3rem] p-10 shadow-2xl border border-slate-800">
      <h2 className="text-xl font-black text-white uppercase mb-8 tracking-tighter">{title}</h2>
      {children}
      <button onClick={onClose} className="mt-6 w-full text-center text-[10px] font-black text-slate-500 hover:text-slate-300 uppercase tracking-widest">Fechar</button>
    </div>
  </div>
);

const UserForm = ({ onAdd }: any) => {
  const [form, setForm] = useState({ name: '', username: '', password: '', role: UserRole.PAINTER });
  return (
    <div className="space-y-4">
      <input placeholder="Nome" className="w-full bg-[#0F172A] p-4 rounded-xl outline-none font-bold text-sm text-white border border-slate-700 focus:border-[#22C55E]" onChange={e => setForm({...form, name: e.target.value})} />
      <input placeholder="Usuário" className="w-full bg-[#0F172A] p-4 rounded-xl outline-none font-bold text-sm text-white border border-slate-700 focus:border-[#22C55E]" onChange={e => setForm({...form, username: e.target.value.toLowerCase()})} />
      <input placeholder="Senha" type="password" className="w-full bg-[#0F172A] p-4 rounded-xl outline-none font-bold text-sm text-white border border-slate-700 focus:border-[#22C55E]" onChange={e => setForm({...form, password: e.target.value})} />
      <button onClick={() => onAdd({ ...form, id: Date.now().toString(), active: true, totalDebt: 0 })} className="w-full py-5 bg-[#22C55E] text-[#0F172A] rounded-2xl font-black uppercase text-xs">Cadastrar</button>
    </div>
  );
};

const ToolForm = ({ onAdd }: any) => {
  const [form, setForm] = useState({ name: '', model: '', category: 'Escadas', dailyRate: 10 });
  const [otherCategory, setOtherCategory] = useState('');

  const handleSubmit = () => {
    if (!form.name) return alert('Nome obrigatório');
    const finalCategory = form.category === 'Outros' ? otherCategory : form.category;
    if (!finalCategory) return alert('Categoria obrigatória');

    onAdd({ 
      ...form, 
      category: finalCategory,
      id: Math.floor(Math.random() * 9000 + 1000).toString(), 
      status: ToolStatus.AVAILABLE, 
      lastUpdate: Date.now() 
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Item</label>
        <input placeholder="Ex: Escada de Alumínio" className="w-full bg-[#0F172A] p-4 rounded-xl outline-none font-bold text-sm text-white border border-slate-700 focus:border-[#22C55E]" onChange={e => setForm({...form, name: e.target.value})} />
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Variação / Modelo</label>
        <input placeholder="Ex: Dentada 10mm, 12 degraus" className="w-full bg-[#0F172A] p-4 rounded-xl outline-none font-bold text-sm text-white border border-slate-700 focus:border-[#22C55E]" onChange={e => setForm({...form, model: e.target.value})} />
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Categoria</label>
        <select 
          className="w-full bg-[#0F172A] p-4 rounded-xl outline-none font-bold text-sm text-white border border-slate-700 focus:border-[#22C55E]" 
          value={form.category}
          onChange={e => setForm({...form, category: e.target.value})}
        >
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {form.category === 'Outros' && (
        <input 
          placeholder="Digite a categoria" 
          className="w-full bg-[#0F172A] p-4 rounded-xl outline-none font-bold text-sm text-white border border-slate-700 focus:border-[#22C55E]" 
          value={otherCategory}
          onChange={e => setOtherCategory(e.target.value)}
        />
      )}

      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Valor Diária (R$)</label>
        <input type="number" step="0.5" className="w-full bg-[#0F172A] p-4 rounded-xl outline-none font-bold text-sm text-white border border-slate-700 focus:border-[#22C55E]" value={form.dailyRate} onChange={e => setForm({...form, dailyRate: parseFloat(e.target.value)})} />
      </div>

      <button onClick={handleSubmit} className="w-full py-5 bg-[#22C55E] text-[#0F172A] rounded-2xl font-black uppercase text-xs">Salvar</button>
    </div>
  );
};

export default App;
