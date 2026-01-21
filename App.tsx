
import React, { useState, useEffect, useMemo } from 'react';
import { Tool, Painter, Movement, ToolStatus, PainterType } from './types';
import { 
  WrenchScrewdriverIcon, 
  UserGroupIcon, 
  ArrowsRightLeftIcon, 
  PlusIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArchiveBoxIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tools' | 'painters' | 'history'>('tools');
  const [tools, setTools] = useState<Tool[]>([]);
  const [painters, setPainters] = useState<Painter[]>([]);
  const [history, setHistory] = useState<Movement[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPainterModalOpen, setIsPainterModalOpen] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    const savedTools = localStorage.getItem('pincelpro_tools');
    const savedPainters = localStorage.getItem('pincelpro_painters');
    const savedHistory = localStorage.getItem('pincelpro_history');

    if (savedTools) setTools(JSON.parse(savedTools));
    else setTools([
      { id: '1', name: 'Escada Articulada 12D', model: 'Articulada', category: 'Acesso', status: ToolStatus.AVAILABLE, lastUpdate: Date.now() },
      { id: '2', name: 'Máquina Airless Graco', model: '390 PC', category: 'Pintura', status: ToolStatus.AVAILABLE, lastUpdate: Date.now() },
      { id: '3', name: 'Lixadeira de Parede', model: 'W750', category: 'Preparação', status: ToolStatus.DEFECTIVE, lastUpdate: Date.now() }
    ]);

    if (savedPainters) setPainters(JSON.parse(savedPainters));
    else setPainters([
      { id: 'p1', name: 'Ricardo Oliveira', type: PainterType.EMPLOYEE },
      { id: 'p2', name: 'Marcos Silva', type: PainterType.CONTRACTOR }
    ]);

    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  // Salvar automaticamente
  useEffect(() => {
    localStorage.setItem('pincelpro_tools', JSON.stringify(tools));
    localStorage.setItem('pincelpro_painters', JSON.stringify(painters));
    localStorage.setItem('pincelpro_history', JSON.stringify(history));
  }, [tools, painters, history]);

  const registerMovement = (toolId: string, type: 'Retirada' | 'Devolução OK' | 'Defeito', painterId?: string) => {
    const tool = tools.find(t => t.id === toolId);
    const painter = painters.find(p => p.id === (painterId || tool?.currentHolderId));
    
    if (!tool || (!painter && type === 'Retirada')) return;

    const newMovement: Movement = {
      id: Math.random().toString(36).substr(2, 9),
      toolId,
      toolName: tool.name,
      painterName: painter?.name || 'Sistema',
      type,
      timestamp: Date.now()
    };

    setHistory([newMovement, ...history]);
    setTools(tools.map(t => {
      if (t.id === toolId) {
        return {
          ...t,
          status: type === 'Retirada' ? ToolStatus.IN_USE : 
                  type === 'Devolução OK' ? ToolStatus.AVAILABLE : ToolStatus.DEFECTIVE,
          currentHolderId: type === 'Retirada' ? painterId : undefined,
          lastUpdate: Date.now()
        };
      }
      return t;
    }));
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-orange-600 text-white p-6 shadow-lg">
        <div className="app-container flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <WrenchScrewdriverIcon className="h-8 w-8" />
            <h1 className="text-2xl font-extrabold tracking-tighter">PINCELPRO</h1>
          </div>
          <div className="text-xs font-bold bg-orange-700 px-3 py-1 rounded-full uppercase tracking-widest">Controle de Frota</div>
        </div>
      </header>

      <main className="app-container p-4 md:p-8">
        {/* Navigation Tabs */}
        <div className="flex bg-white rounded-2xl p-1 shadow-sm mb-8 border border-slate-200">
          <TabButton active={activeTab === 'tools'} onClick={() => setActiveTab('tools')} icon={<ArchiveBoxIcon className="h-5 w-5" />} label="Ferramentas" />
          <TabButton active={activeTab === 'painters'} onClick={() => setActiveTab('painters')} icon={<UserGroupIcon className="h-5 w-5" />} label="Pintores" />
          <TabButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<ArrowsRightLeftIcon className="h-5 w-5" />} label="Histórico" />
        </div>

        {activeTab === 'tools' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Estoque de Obra</h2>
              <button onClick={() => setIsModalOpen(true)} className="bg-orange-600 text-white px-4 py-2 rounded-xl font-bold flex items-center space-x-2 hover:bg-orange-700 transition-colors">
                <PlusIcon className="h-5 w-5" />
                <span>Nova Ferramenta</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tools.map(tool => (
                <ToolCard 
                  key={tool.id} 
                  tool={tool} 
                  painters={painters} 
                  onAction={registerMovement}
                  onDelete={(id) => setTools(tools.filter(t => t.id !== id))}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'painters' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Equipe de Pintura</h2>
              <button onClick={() => setIsPainterModalOpen(true)} className="bg-slate-800 text-white px-4 py-2 rounded-xl font-bold flex items-center space-x-2">
                <PlusIcon className="h-5 w-5" />
                <span>Adicionar Pintor</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {painters.map(painter => (
                <div key={painter.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-xl">{painter.name[0]}</div>
                    <div>
                      <h3 className="font-bold text-slate-800">{painter.name}</h3>
                      <p className="text-xs text-slate-400 font-bold uppercase">{painter.type}</p>
                    </div>
                  </div>
                  <button onClick={() => setPainters(painters.filter(p => p.id !== painter.id))} className="text-slate-300 hover:text-rose-500"><TrashIcon className="h-5 w-5" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Ferramenta</th>
                  <th className="px-6 py-4">Pintor</th>
                  <th className="px-6 py-4">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map(item => (
                  <tr key={item.id} className="text-sm">
                    <td className="px-6 py-4 text-slate-400 font-medium">{new Date(item.timestamp).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">{item.toolName}</td>
                    <td className="px-6 py-4 text-slate-600 font-semibold">{item.painterName}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${
                        item.type === 'Retirada' ? 'bg-blue-50 text-blue-600' : 
                        item.type === 'Devolução OK' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>{item.type}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modais */}
      {isModalOpen && (
        <Modal title="Nova Ferramenta" onClose={() => setIsModalOpen(false)}>
          <ToolForm onSubmit={(tool) => { setTools([...tools, tool]); setIsModalOpen(false); }} />
        </Modal>
      )}
      
      {isPainterModalOpen && (
        <Modal title="Novo Pintor" onClose={() => setIsPainterModalOpen(false)}>
          <PainterForm onSubmit={(painter) => { setPainters([...painters, painter]); setIsPainterModalOpen(false); }} />
        </Modal>
      )}
    </div>
  );
};

// --- Subcomponentes ---

const ToolCard = ({ tool, painters, onAction, onDelete }: { tool: Tool, painters: Painter[], onAction: any, onDelete: any }) => {
  const holder = painters.find(p => p.id === tool.currentHolderId);

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-4">
          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
            tool.status === ToolStatus.AVAILABLE ? 'bg-emerald-50 text-emerald-600' :
            tool.status === ToolStatus.IN_USE ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'
          }`}>{tool.status}</span>
          <button onClick={() => onDelete(tool.id)} className="text-slate-200 hover:text-rose-500"><TrashIcon className="h-4 w-4" /></button>
        </div>
        <h3 className="text-lg font-extrabold text-slate-800 leading-tight mb-1 uppercase tracking-tight">{tool.name}</h3>
        <p className="text-xs text-slate-400 font-bold uppercase mb-4">{tool.category}</p>
        
        {holder && (
          <div className="bg-slate-50 p-3 rounded-xl mb-6 border border-slate-100">
            <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest">Em posse de:</p>
            <p className="text-sm font-bold text-slate-700">{holder.name}</p>
          </div>
        )}
      </div>

      <div className="space-y-2 mt-4">
        {tool.status === ToolStatus.AVAILABLE && (
          <div className="flex flex-col space-y-2">
            <select 
              className="w-full bg-slate-100 border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500"
              onChange={(e) => onAction(tool.id, 'Retirada', e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>Selecionar Pintor...</option>
              {painters.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        )}

        {tool.status === ToolStatus.IN_USE && (
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => onAction(tool.id, 'Devolução OK')} 
              className="flex items-center justify-center space-x-1 bg-emerald-600 text-white py-3 rounded-xl text-[10px] font-black uppercase"
            >
              <CheckCircleIcon className="h-4 w-4" />
              <span>Devolver OK</span>
            </button>
            <button 
              onClick={() => onAction(tool.id, 'Defeito')} 
              className="flex items-center justify-center space-x-1 bg-rose-600 text-white py-3 rounded-xl text-[10px] font-black uppercase"
            >
              <ExclamationTriangleIcon className="h-4 w-4" />
              <span>Defeito</span>
            </button>
          </div>
        )}

        {tool.status === ToolStatus.DEFECTIVE && (
          <button 
            onClick={() => onAction(tool.id, 'Devolução OK')} 
            className="w-full bg-slate-800 text-white py-3 rounded-xl text-[10px] font-black uppercase"
          >
            Consertado / Voltar
          </button>
        )}
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl transition-all ${
      active ? 'bg-orange-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 font-semibold'
    }`}
  >
    {icon}
    <span className="text-sm font-bold">{label}</span>
  </button>
);

const Modal = ({ title, children, onClose }: any) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
    <div className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl">
      <h2 className="text-xl font-black text-slate-800 uppercase mb-6">{title}</h2>
      {children}
      <button onClick={onClose} className="mt-4 w-full text-slate-400 font-bold uppercase text-xs">Cancelar</button>
    </div>
  </div>
);

const ToolForm = ({ onSubmit }: any) => {
  const [name, setName] = useState('');
  const [model, setModel] = useState('');
  const [cat, setCat] = useState('Geral');
  return (
    <div className="space-y-4">
      <input autoFocus placeholder="Nome da Ferramenta" className="w-full p-4 bg-slate-100 rounded-2xl outline-none font-bold" onChange={e => setName(e.target.value)} />
      <input placeholder="Modelo" className="w-full p-4 bg-slate-100 rounded-2xl outline-none font-bold" onChange={e => setModel(e.target.value)} />
      <select className="w-full p-4 bg-slate-100 rounded-2xl outline-none font-bold" onChange={e => setCat(e.target.value)}>
        <option>Acesso</option>
        <option>Pintura</option>
        <option>Preparação</option>
        <option>Elétrica</option>
        <option>Outros</option>
      </select>
      <button onClick={() => onSubmit({ id: Date.now().toString(), name, model, category: cat, status: ToolStatus.AVAILABLE, lastUpdate: Date.now() })} className="w-full bg-orange-600 text-white py-4 rounded-2xl font-black uppercase">Adicionar</button>
    </div>
  );
};

const PainterForm = ({ onSubmit }: any) => {
  const [name, setName] = useState('');
  const [type, setType] = useState(PainterType.EMPLOYEE);
  return (
    <div className="space-y-4">
      <input autoFocus placeholder="Nome Completo" className="w-full p-4 bg-slate-100 rounded-2xl outline-none font-bold" onChange={e => setName(e.target.value)} />
      <div className="flex space-x-2">
        <button onClick={() => setType(PainterType.EMPLOYEE)} className={`flex-1 py-3 rounded-xl text-xs font-bold ${type === PainterType.EMPLOYEE ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500'}`}>Funcionário</button>
        <button onClick={() => setType(PainterType.CONTRACTOR)} className={`flex-1 py-3 rounded-xl text-xs font-bold ${type === PainterType.CONTRACTOR ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500'}`}>Prestador</button>
      </div>
      <button onClick={() => onSubmit({ id: 'p' + Date.now(), name, type })} className="w-full bg-orange-600 text-white py-4 rounded-2xl font-black uppercase">Cadastrar</button>
    </div>
  );
};

export default App;
