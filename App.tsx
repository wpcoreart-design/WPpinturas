
import React, { useState, useEffect } from 'react';
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
  UserPlusIcon
} from '@heroicons/react/24/outline';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'inventory' | 'users' | 'history' | 'my_tools'>('inventory');
  
  // Data State
  const [users, setUsers] = useState<User[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [history, setHistory] = useState<Movement[]>([]);
  
  // UI State
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isToolModalOpen, setIsToolModalOpen] = useState(false);

  // Initial Load
  useEffect(() => {
    const savedUsers = localStorage.getItem('p_users');
    const savedTools = localStorage.getItem('p_tools');
    const savedHistory = localStorage.getItem('p_history');
    const savedSession = localStorage.getItem('p_session');

    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      const defaultAdmin: User = { id: '1', name: 'Administrador', username: 'admin', password: '123', role: UserRole.ADMIN, active: true };
      setUsers([defaultAdmin]);
    }

    if (savedTools) setTools(JSON.parse(savedTools));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedSession) setCurrentUser(JSON.parse(savedSession));
  }, []);

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('p_users', JSON.stringify(users));
    localStorage.setItem('p_tools', JSON.stringify(tools));
    localStorage.setItem('p_history', JSON.stringify(history));
  }, [users, tools, history]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.username === loginForm.username && u.password === loginForm.password && u.active);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('p_session', JSON.stringify(user));
      setLoginError('');
      // Direcionar para aba inicial correta baseado no role
      if (user.role === UserRole.PAINTER) setActiveTab('my_tools');
      else setActiveTab('inventory');
    } else {
      setLoginError('Credenciais inválidas ou conta desativada.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('p_session');
  };

  const registerMovement = (toolId: string, action: Movement['action'], targetStatus: ToolStatus, userId?: string) => {
    const tool = tools.find(t => t.id === toolId);
    if (!tool || !currentUser) return;

    const newMovement: Movement = {
      id: Math.random().toString(36).substr(2, 9),
      toolId,
      toolName: tool.name,
      userId: userId || currentUser.id,
      userName: users.find(u => u.id === (userId || currentUser.id))?.name || 'Desconhecido',
      action,
      timestamp: Date.now()
    };

    setHistory([newMovement, ...history]);
    setTools(tools.map(t => t.id === toolId ? { 
      ...t, 
      status: targetStatus, 
      currentHolderId: action === 'Retirada' ? (userId || currentUser.id) : (action === 'Solicitou Devolução' ? t.currentHolderId : undefined),
      lastUpdate: Date.now() 
    } : t));
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl">
          <div className="text-center mb-8">
            <div className="bg-orange-600 h-16 w-16 rounded-3xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-orange-200">
              <LockClosedIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tighter">PINCELPRO</h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Acesso Restrito</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="text" 
              placeholder="Usuário" 
              className="w-full bg-slate-100 border-none rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              value={loginForm.username}
              onChange={e => setLoginForm({...loginForm, username: e.target.value})}
              required
            />
            <input 
              type="password" 
              placeholder="Senha" 
              className="w-full bg-slate-100 border-none rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              value={loginForm.password}
              onChange={e => setLoginForm({...loginForm, password: e.target.value})}
              required
            />
            {loginError && <p className="text-rose-600 text-[10px] font-black uppercase text-center">{loginError}</p>}
            <button className="w-full bg-slate-800 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all">Entrar</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-600 h-8 w-8 rounded-lg flex items-center justify-center">
              <WrenchScrewdriverIcon className="h-5 w-5 text-white" />
            </div>
            <h1 className="font-black text-slate-800 tracking-tight">PINCELPRO</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-slate-800 uppercase">{currentUser.name}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{currentUser.role}</p>
            </div>
            <button onClick={handleLogout} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
              <ArrowRightOnRectangleIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-slate-100 px-6 overflow-x-auto">
        <div className="max-w-6xl mx-auto flex">
          {currentUser.role !== UserRole.PAINTER && (
            <Tab label="Inventário" active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon={<ArchiveBoxIcon className="h-4 w-4" />} />
          )}
          <Tab label="Meus Itens" active={activeTab === 'my_tools'} onClick={() => setActiveTab('my_tools')} icon={<ShieldCheckIcon className="h-4 w-4" />} />
          {currentUser.role === UserRole.ADMIN && (
            <>
              <Tab label="Usuários" active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<UserGroupIcon className="h-4 w-4" />} />
              <Tab label="Histórico" active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<ClockIcon className="h-4 w-4" />} />
            </>
          )}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto w-full p-6 flex-1">
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-800 uppercase">Estoque Geral</h2>
              {currentUser.role === UserRole.ADMIN && (
                <button onClick={() => setIsToolModalOpen(true)} className="bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-black uppercase flex items-center space-x-2">
                  <ArchiveBoxIcon className="h-4 w-4" /> <span>Novo Item</span>
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tools.map(tool => (
                <ToolCard 
                  key={tool.id} 
                  tool={tool} 
                  currentUser={currentUser} 
                  users={users} 
                  onAction={registerMovement}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'my_tools' && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-slate-800 uppercase">Sob minha Responsabilidade</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tools.filter(t => t.currentHolderId === currentUser.id).map(tool => (
                <ToolCard 
                  key={tool.id} 
                  tool={tool} 
                  currentUser={currentUser} 
                  users={users} 
                  onAction={registerMovement}
                />
              ))}
              {tools.filter(t => t.currentHolderId === currentUser.id).length === 0 && (
                <div className="col-span-full py-20 text-center opacity-20">
                  <ShieldCheckIcon className="h-16 w-16 mx-auto mb-4" />
                  <p className="font-black uppercase">Nenhuma ferramenta com você.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'users' && currentUser.role === UserRole.ADMIN && (
          <div className="space-y-6">
             <div className="flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-800 uppercase">Gestão de Equipe</h2>
              <button onClick={() => setIsUserModalOpen(true)} className="bg-orange-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase flex items-center space-x-2">
                <UserPlusIcon className="h-4 w-4" /> <span>Cadastrar Usuário</span>
              </button>
            </div>
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr className="text-[10px] font-black uppercase text-slate-400">
                    <th className="px-6 py-4">Nome</th>
                    <th className="px-6 py-4">Username</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map(u => (
                    <tr key={u.id}>
                      <td className="px-6 py-4 font-bold text-slate-800">{u.name}</td>
                      <td className="px-6 py-4 font-mono text-xs">{u.username}</td>
                      <td className="px-6 py-4"><span className="bg-slate-100 px-2 py-1 rounded text-[10px] font-black uppercase">{u.role}</span></td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => setUsers(users.map(usr => usr.id === u.id ? {...usr, active: !usr.active} : usr))}
                          className={`text-[9px] font-black uppercase ${u.active ? 'text-emerald-500' : 'text-rose-500'}`}
                        >
                          {u.active ? 'Ativo' : 'Desativado'}
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
            <h2 className="text-xl font-black text-slate-800 uppercase">Linha do Tempo</h2>
            <div className="space-y-4">
              {history.map(m => (
                <div key={m.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                      <ClockIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{m.userName} {m.action.toLowerCase()} {m.toolName}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(m.timestamp).toLocaleString()}</p>
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
        <Modal title="Novo Usuário" onClose={() => setIsUserModalOpen(false)}>
           <UserForm onAdd={u => { setUsers([...users, u]); setIsUserModalOpen(false); }} />
        </Modal>
      )}

      {isToolModalOpen && (
        <Modal title="Nova Ferramenta" onClose={() => setIsToolModalOpen(false)}>
           <ToolForm onAdd={t => { setTools([...tools, t]); setIsToolModalOpen(false); }} />
        </Modal>
      )}
    </div>
  );
};

const Tab = ({ label, active, onClick, icon }: any) => (
  <button 
    onClick={onClick}
    className={`px-6 py-4 flex items-center space-x-2 text-xs font-black uppercase tracking-tighter transition-all border-b-2 ${
      active ? 'text-orange-600 border-orange-600' : 'text-slate-400 border-transparent hover:text-slate-600'
    }`}
  >
    {icon} <span>{label}</span>
  </button>
);

const ToolCard = ({ tool, currentUser, users, onAction }: any) => {
  const holder = users.find((u: User) => u.id === tool.currentHolderId);
  const canWithdraw = tool.status === ToolStatus.AVAILABLE && currentUser.role !== UserRole.CONFEREE;
  const canRequestReturn = tool.status === ToolStatus.IN_USE && tool.currentHolderId === currentUser.id;
  const canConfer = tool.status === ToolStatus.PENDING_CONFERENCE && currentUser.role !== UserRole.PAINTER;

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-4">
          <span className={`px-2 py-1 rounded text-[8px] font-black uppercase ${
            tool.status === ToolStatus.AVAILABLE ? 'bg-emerald-50 text-emerald-600' :
            tool.status === ToolStatus.IN_USE ? 'bg-blue-50 text-blue-600' :
            tool.status === ToolStatus.PENDING_CONFERENCE ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
          }`}>{tool.status}</span>
          <span className="text-[10px] font-mono text-slate-300">#{tool.id}</span>
        </div>
        <h3 className="text-lg font-black text-slate-800 leading-tight mb-1 uppercase tracking-tight">{tool.name}</h3>
        <p className="text-[10px] text-slate-400 font-black uppercase mb-4">{tool.category} • {tool.model}</p>

        {holder && (
          <div className="bg-slate-50 p-3 rounded-xl mb-6 border border-slate-100 flex items-center space-x-2">
            <div className="h-6 w-6 rounded-full bg-orange-100 flex items-center justify-center text-[10px] font-bold text-orange-600">{holder.name[0]}</div>
            <div>
              <p className="text-[8px] font-black text-slate-300 uppercase leading-none">Em posse de:</p>
              <p className="text-xs font-bold text-slate-700">{holder.name}</p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {canWithdraw && (
          <button 
            onClick={() => onAction(tool.id, 'Retirada', ToolStatus.IN_USE)}
            className="w-full py-3 bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black"
          >
            Retirar Agora
          </button>
        )}

        {canRequestReturn && (
          <button 
            onClick={() => onAction(tool.id, 'Solicitou Devolução', ToolStatus.PENDING_CONFERENCE)}
            className="w-full py-3 bg-orange-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
          >
            Sinalizar Devolução
          </button>
        )}

        {canConfer && (
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => onAction(tool.id, 'Confirmou OK', ToolStatus.AVAILABLE)}
              className="flex flex-col items-center justify-center py-3 bg-emerald-600 text-white rounded-xl"
            >
              <CheckBadgeIcon className="h-4 w-4 mb-1" />
              <span className="text-[9px] font-black uppercase">Tudo OK</span>
            </button>
            <button 
              onClick={() => onAction(tool.id, 'Confirmou Defeito', ToolStatus.DEFECTIVE)}
              className="flex flex-col items-center justify-center py-3 bg-rose-600 text-white rounded-xl"
            >
              <ExclamationCircleIcon className="h-4 w-4 mb-1" />
              <span className="text-[9px] font-black uppercase">Defeito</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Modal = ({ title, onClose, children }: any) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
    <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl relative">
      <h2 className="text-xl font-black text-slate-800 uppercase mb-6 tracking-tight">{title}</h2>
      {children}
      <button onClick={onClose} className="mt-4 w-full text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">Fechar</button>
    </div>
  </div>
);

const UserForm = ({ onAdd }: any) => {
  const [form, setForm] = useState({ name: '', username: '', password: '', role: UserRole.PAINTER });
  return (
    <div className="space-y-3">
      <input placeholder="Nome Completo" className="w-full bg-slate-50 p-4 rounded-xl outline-none font-bold text-sm" onChange={e => setForm({...form, name: e.target.value})} />
      <input placeholder="Username" className="w-full bg-slate-50 p-4 rounded-xl outline-none font-bold text-sm" onChange={e => setForm({...form, username: e.target.value})} />
      <input placeholder="Senha" type="password" className="w-full bg-slate-50 p-4 rounded-xl outline-none font-bold text-sm" onChange={e => setForm({...form, password: e.target.value})} />
      <select className="w-full bg-slate-50 p-4 rounded-xl outline-none font-bold text-sm" onChange={e => setForm({...form, role: e.target.value as UserRole})}>
        <option value={UserRole.PAINTER}>Pintor</option>
        <option value={UserRole.CONFEREE}>Conferente</option>
        <option value={UserRole.ADMIN}>Administrador</option>
      </select>
      <button onClick={() => onAdd({ ...form, id: Date.now().toString(), active: true })} className="w-full py-4 bg-orange-600 text-white rounded-xl font-black uppercase text-xs">Salvar</button>
    </div>
  );
};

const ToolForm = ({ onAdd }: any) => {
  const [form, setForm] = useState({ name: '', model: '', category: 'Acesso' });
  return (
    <div className="space-y-3">
      <input placeholder="Nome da Ferramenta" className="w-full bg-slate-50 p-4 rounded-xl outline-none font-bold text-sm" onChange={e => setForm({...form, name: e.target.value})} />
      <input placeholder="Modelo" className="w-full bg-slate-50 p-4 rounded-xl outline-none font-bold text-sm" onChange={e => setForm({...form, model: e.target.value})} />
      <select className="w-full bg-slate-50 p-4 rounded-xl outline-none font-bold text-sm" onChange={e => setForm({...form, category: e.target.value})}>
        <option>Acesso</option>
        <option>Pintura Mecanizada</option>
        <option>Preparação</option>
        <option>Manual</option>
      </select>
      <button onClick={() => onAdd({ ...form, id: Math.floor(Math.random() * 9000 + 1000).toString(), status: ToolStatus.AVAILABLE, lastUpdate: Date.now() })} className="w-full py-4 bg-slate-800 text-white rounded-xl font-black uppercase text-xs">Adicionar</button>
    </div>
  );
};

export default App;
