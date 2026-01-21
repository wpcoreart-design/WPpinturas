
import React, { useState, useEffect, useCallback } from 'react';
import { Tool, ToolStatus, User, UserRole, Movement } from './types';
import { 
  LockClosedIcon, 
  WrenchScrewdriverIcon, 
  UserGroupIcon, 
  ArchiveBoxIcon, 
  ClockIcon, 
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon,
  CheckBadgeIcon,
  UserPlusIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

/**
 * SIMULAÇÃO DE API CENTRAL
 * Em produção, estas funções chamariam fetch('https://sua-api.com/...')
 */
const CentralDB = {
  getStore: () => {
    const data = localStorage.getItem('PINCELPRO_CENTRAL_DB');
    if (!data) {
      const initialUsers = [{ id: '1', name: 'Administrador', username: 'admin', password: '123', role: UserRole.ADMIN, active: true }];
      const initial = { users: initialUsers, tools: [], history: [] };
      localStorage.setItem('PINCELPRO_CENTRAL_DB', JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  },
  save: (data: any) => {
    localStorage.setItem('PINCELPRO_CENTRAL_DB', JSON.stringify(data));
    window.dispatchEvent(new Event('storage')); // Sincroniza abas
  }
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'inventory' | 'users' | 'history' | 'my_tools'>('inventory');
  const [isLoading, setIsLoading] = useState(false);
  
  const [users, setUsers] = useState<User[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [history, setHistory] = useState<Movement[]>([]);

  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isToolModalOpen, setIsToolModalOpen] = useState(false);

  // Sincronização com o "Banco Central"
  const syncData = useCallback(async () => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 400)); // Simula latência de rede
    const data = CentralDB.getStore();
    setUsers(data.users);
    setTools(data.tools);
    setHistory(data.history);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    syncData();
    const session = localStorage.getItem('p_session');
    if (session) setCurrentUser(JSON.parse(session));

    window.addEventListener('storage', syncData);
    return () => window.removeEventListener('storage', syncData);
  }, [syncData]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.username === loginForm.username && u.password === loginForm.password && u.active);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('p_session', JSON.stringify(user));
      setLoginError('');
      setActiveTab(user.role === UserRole.PAINTER ? 'my_tools' : 'inventory');
    } else {
      setLoginError('Usuário ou senha incorretos.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('p_session');
  };

  const updateCentral = (newUsers: User[], newTools: Tool[], newHistory: Movement[]) => {
    CentralDB.save({ users: newUsers, tools: newTools, history: newHistory });
    setUsers(newUsers);
    setTools(newTools);
    setHistory(newHistory);
  };

  const registerAction = (toolId: string, action: Movement['action'], targetStatus: ToolStatus) => {
    if (!currentUser) return;
    const tool = tools.find(t => t.id === toolId);
    if (!tool) return;

    const newMovement: Movement = {
      id: Math.random().toString(36).substr(2, 9),
      toolId,
      toolName: tool.name,
      userId: currentUser.id,
      userName: currentUser.name,
      action,
      timestamp: Date.now()
    };

    const newTools = tools.map(t => t.id === toolId ? { 
      ...t, 
      status: targetStatus, 
      currentHolderId: action === 'retirada' ? currentUser.id : (targetStatus === ToolStatus.AVAILABLE ? undefined : t.currentHolderId),
      lastUpdate: Date.now() 
    } : t);

    updateCentral(users, newTools, [newMovement, ...history]);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
        <div className="bg-[#1E293B] w-full max-w-sm rounded-[2rem] p-10 shadow-2xl border border-slate-800">
          <div className="text-center mb-8">
            <div className="bg-[#22C55E] h-16 w-16 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-green-900/20">
              <LockClosedIcon className="h-8 w-8 text-[#0F172A]" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tighter">PINCELPRO</h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">Sistema Central de Pintura</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="text" placeholder="Usuário" 
              className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-6 py-4 font-bold text-white outline-none focus:ring-2 focus:ring-[#22C55E] transition-all"
              value={loginForm.username} onChange={e => setLoginForm({...loginForm, username: e.target.value.toLowerCase()})} required
            />
            <input 
              type="password" placeholder="Senha" 
              className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-6 py-4 font-bold text-white outline-none focus:ring-2 focus:ring-[#22C55E] transition-all"
              value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} required
            />
            {loginError && <p className="text-rose-500 text-[10px] font-black uppercase text-center">{loginError}</p>}
            <button className="w-full bg-[#22C55E] text-[#0F172A] py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-[#16A34A] transition-all transform active:scale-95">Entrar</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col">
      <header className="bg-[#1E293B]/50 backdrop-blur-md border-b border-slate-800 px-6 py-4 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-[#22C55E] h-9 w-9 rounded-xl flex items-center justify-center shadow-lg shadow-green-900/20">
              <WrenchScrewdriverIcon className="h-5 w-5 text-[#0F172A]" />
            </div>
            <h1 className="font-black text-white tracking-tighter text-lg">PINCELPRO</h1>
            <div className={`h-2 w-2 rounded-full ${isLoading ? 'bg-amber-400 animate-pulse' : 'bg-[#22C55E]'}`}></div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black uppercase text-white leading-none">{currentUser.name}</p>
              <p className="text-[10px] font-bold text-[#22C55E] uppercase mt-1 tracking-widest">{currentUser.role}</p>
            </div>
            <button onClick={handleLogout} className="p-2 hover:text-rose-500 transition-colors"><ArrowRightOnRectangleIcon className="h-6 w-6" /></button>
          </div>
        </div>
      </header>

      <nav className="bg-[#0F172A] border-b border-slate-800 px-6 sticky top-[73px] z-20">
        <div className="max-w-6xl mx-auto flex">
          {currentUser.role !== UserRole.PAINTER && (
            <Tab label="Estoque" active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon={<ArchiveBoxIcon className="h-4 w-4" />} />
          )}
          <Tab label="Meus Itens" active={activeTab === 'my_tools'} onClick={() => setActiveTab('my_tools')} icon={<ShieldCheckIcon className="h-4 w-4" />} />
          {currentUser.role === UserRole.ADMIN && (
            <>
              <Tab label="Equipe" active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<UserGroupIcon className="h-4 w-4" />} />
              <Tab label="Histórico" active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<ClockIcon className="h-4 w-4" />} />
            </>
          )}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto w-full p-6 flex-1">
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black uppercase tracking-tight">Canteiro Central</h2>
              {currentUser.role === UserRole.ADMIN && (
                <button onClick={() => setIsToolModalOpen(true)} className="bg-[#22C55E] text-[#0F172A] px-5 py-3 rounded-2xl text-xs font-black uppercase flex items-center space-x-2">
                  <PlusIcon className="h-4 w-4 stroke-[3px]" /> <span>Novo Patrimônio</span>
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {tools.map(tool => (
                <ToolCard key={tool.id} tool={tool} currentUser={currentUser} users={users} onAction={registerAction} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'my_tools' && (
          <div className="space-y-6">
            <h2 className="text-xl font-black uppercase tracking-tight">Sob minha Guarda</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {tools.filter(t => t.currentHolderId === currentUser.id).map(tool => (
                <ToolCard key={tool.id} tool={tool} currentUser={currentUser} users={users} onAction={registerAction} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'users' && currentUser.role === UserRole.ADMIN && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black uppercase tracking-tight">Gestão de Equipe</h2>
              <button onClick={() => setIsUserModalOpen(true)} className="bg-[#22C55E] text-[#0F172A] px-5 py-3 rounded-2xl text-xs font-black uppercase flex items-center space-x-2">
                <UserPlusIcon className="h-4 w-4 stroke-[3px]" /> <span>Cadastrar Pintor</span>
              </button>
            </div>
            <div className="bg-[#1E293B] rounded-[2rem] border border-slate-800 overflow-hidden shadow-xl">
              <table className="w-full text-left">
                <thead className="bg-slate-800/50 border-b border-slate-700">
                  <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    <th className="px-8 py-5">Colaborador</th>
                    <th className="px-8 py-5">Login</th>
                    <th className="px-8 py-5">Nível</th>
                    <th className="px-8 py-5 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-8 py-5 font-bold text-white">{u.name}</td>
                      <td className="px-8 py-5 font-mono text-xs text-slate-400">{u.username}</td>
                      <td className="px-8 py-5"><span className="bg-slate-800 px-3 py-1 rounded text-[10px] font-black uppercase border border-slate-700">{u.role}</span></td>
                      <td className="px-8 py-5 text-right">
                        <button onClick={() => updateCentral(users.map(usr => usr.id === u.id ? {...usr, active: !usr.active} : usr), tools, history)} className={`text-[9px] font-black uppercase px-4 py-2 rounded-xl border ${u.active ? 'text-[#22C55E] border-[#22C55E]/30' : 'text-rose-500 border-rose-500/30'}`}>
                          {u.active ? 'Ativo' : 'Desligado'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'history' && currentUser.role === UserRole.ADMIN && (
          <div className="space-y-6">
            <h2 className="text-xl font-black uppercase tracking-tight">Registro de Movimentações</h2>
            <div className="space-y-3">
              {history.map(m => (
                <div key={m.id} className="bg-[#1E293B] p-5 rounded-2xl border border-slate-800 flex items-center justify-between shadow-lg">
                  <div className="flex items-center space-x-4">
                    <div className="bg-slate-800 h-10 w-10 rounded-xl flex items-center justify-center text-[#22C55E]"><ClockIcon className="h-5 w-5" /></div>
                    <div>
                      <p className="text-sm font-bold text-white"><span className="text-[#22C55E]">{m.userName}</span> {m.action.replace('_', ' ')} <span className="text-white opacity-60">{m.toolName}</span></p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{new Date(m.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {isUserModalOpen && (
        <Modal title="Cadastrar Pintor" onClose={() => setIsUserModalOpen(false)}>
          <UserForm onAdd={u => { updateCentral([...users, u], tools, history); setIsUserModalOpen(false); }} />
        </Modal>
      )}
      {isToolModalOpen && (
        <Modal title="Novo Patrimônio" onClose={() => setIsToolModalOpen(false)}>
          <ToolForm onAdd={t => { updateCentral(users, [...tools, t], history); setIsToolModalOpen(false); }} />
        </Modal>
      )}
    </div>
  );
};

// Subcomponentes Customizados

const Tab = ({ label, active, onClick, icon }: any) => (
  <button onClick={onClick} className={`px-8 py-5 flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${active ? 'text-[#22C55E] border-[#22C55E]' : 'text-slate-500 border-transparent hover:text-slate-300'}`}>
    {icon} <span>{label}</span>
  </button>
);

const ToolCard = ({ tool, currentUser, users, onAction }: any) => {
  const holder = users.find((u: User) => u.id === tool.currentHolderId);
  const isHolder = tool.currentHolderId === currentUser.id;
  const isPainter = currentUser.role === UserRole.PAINTER;
  
  return (
    <div className="bg-[#1E293B] p-6 rounded-[2rem] border border-slate-800 shadow-xl flex flex-col justify-between hover:border-[#22C55E]/30 transition-all">
      <div>
        <div className="flex justify-between items-start mb-4">
          <span className={`px-2.5 py-1 rounded text-[9px] font-black uppercase border ${
            tool.status === ToolStatus.AVAILABLE ? 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20' :
            tool.status === ToolStatus.OUT ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
          }`}>{tool.status.replace('_', ' ')}</span>
          <span className="text-[10px] font-bold text-slate-600">#{tool.id}</span>
        </div>
        <h3 className="text-lg font-black text-white uppercase tracking-tight">{tool.name}</h3>
        <p className="text-[10px] text-slate-500 font-bold uppercase mb-5">{tool.category} • {tool.model}</p>
        {holder && (
          <div className="bg-[#0F172A] p-3 rounded-xl mb-6 border border-slate-800 flex items-center space-x-3">
            <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-[#22C55E]">{holder.name[0]}</div>
            <p className="text-[11px] font-bold text-slate-300">{holder.name}</p>
          </div>
        )}
      </div>
      <div className="space-y-2">
        {tool.status === ToolStatus.AVAILABLE && !isPainter && (
           <p className="text-[9px] text-slate-500 text-center uppercase font-black italic">Aguardando Pintor retirar</p>
        )}
        {tool.status === ToolStatus.AVAILABLE && isPainter && (
          <button onClick={() => onAction(tool.id, 'retirada', ToolStatus.OUT)} className="w-full py-4 bg-[#22C55E] text-[#0F172A] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all">Retirar Ativo</button>
        )}
        {tool.status === ToolStatus.OUT && isHolder && (
          <button onClick={() => onAction(tool.id, 'solicitou_devolucao', ToolStatus.PENDING_RETURN)} className="w-full py-4 bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">Sinalizar Devolução</button>
        )}
        {tool.status === ToolStatus.PENDING_RETURN && currentUser.role !== UserRole.PAINTER && (
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => onAction(tool.id, 'confirmou_ok', ToolStatus.AVAILABLE)} className="bg-[#22C55E] text-[#0F172A] py-3 rounded-xl flex flex-col items-center justify-center"><CheckBadgeIcon className="h-4 w-4" /><span className="text-[8px] font-black uppercase">Tudo OK</span></button>
            <button onClick={() => onAction(tool.id, 'confirmou_defeito', ToolStatus.DEFECTIVE)} className="bg-rose-500 text-white py-3 rounded-xl flex flex-col items-center justify-center"><ExclamationCircleIcon className="h-4 w-4" /><span className="text-[8px] font-black uppercase">Avaria</span></button>
          </div>
        )}
      </div>
    </div>
  );
};

const Modal = ({ title, onClose, children }: any) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
    <div className="bg-[#1E293B] w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl border border-slate-800 animate-in fade-in zoom-in duration-200">
      <h2 className="text-xl font-black text-white uppercase mb-8 tracking-tighter">{title}</h2>
      {children}
      <button onClick={onClose} className="mt-6 w-full text-center text-[10px] font-black text-slate-500 hover:text-slate-300 uppercase tracking-widest">Fechar Janela</button>
    </div>
  </div>
);

const UserForm = ({ onAdd }: any) => {
  const [form, setForm] = useState({ name: '', username: '', password: '', role: UserRole.PAINTER });
  return (
    <div className="space-y-4">
      <input placeholder="Nome Completo" className="w-full bg-[#0F172A] p-4 rounded-xl outline-none font-bold text-sm text-white border border-slate-700" onChange={e => setForm({...form, name: e.target.value})} />
      <input placeholder="Username" className="w-full bg-[#0F172A] p-4 rounded-xl outline-none font-bold text-sm text-white border border-slate-700" onChange={e => setForm({...form, username: e.target.value.toLowerCase()})} />
      <input placeholder="Senha" type="password" className="w-full bg-[#0F172A] p-4 rounded-xl outline-none font-bold text-sm text-white border border-slate-700" onChange={e => setForm({...form, password: e.target.value})} />
      <select className="w-full bg-[#0F172A] p-4 rounded-xl outline-none font-bold text-sm text-white border border-slate-700" onChange={e => setForm({...form, role: e.target.value as UserRole})}>
        <option value={UserRole.PAINTER}>Pintor</option>
        <option value={UserRole.CONFEREE}>Conferente</option>
        <option value={UserRole.ADMIN}>Administrador</option>
      </select>
      <button onClick={() => onAdd({ ...form, id: Date.now().toString(), active: true })} className="w-full py-5 bg-[#22C55E] text-[#0F172A] rounded-2xl font-black uppercase text-xs">Confirmar Cadastro</button>
    </div>
  );
};

const ToolForm = ({ onAdd }: any) => {
  const [form, setForm] = useState({ name: '', model: '', category: 'Pintura' });
  return (
    <div className="space-y-4">
      <input placeholder="Nome da Ferramenta" className="w-full bg-[#0F172A] p-4 rounded-xl outline-none font-bold text-sm text-white border border-slate-700" onChange={e => setForm({...form, name: e.target.value})} />
      <input placeholder="Modelo/Especificação" className="w-full bg-[#0F172A] p-4 rounded-xl outline-none font-bold text-sm text-white border border-slate-700" onChange={e => setForm({...form, model: e.target.value})} />
      <select className="w-full bg-[#0F172A] p-4 rounded-xl outline-none font-bold text-sm text-white border border-slate-700" onChange={e => setForm({...form, category: e.target.value})}>
        <option>Pintura</option>
        <option>Acesso</option>
        <option>Preparação</option>
        <option>Manual</option>
      </select>
      <button onClick={() => onAdd({ ...form, id: Math.floor(Math.random() * 9000 + 1000).toString(), status: ToolStatus.AVAILABLE, lastUpdate: Date.now() })} className="w-full py-5 bg-[#22C55E] text-[#0F172A] rounded-2xl font-black uppercase text-xs">Salvar Patrimônio</button>
    </div>
  );
};

export default App;
