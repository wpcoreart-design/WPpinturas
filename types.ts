
export enum ToolStatus {
  AVAILABLE = 'Disponível',
  IN_USE = 'Em Uso',
  DEFECTIVE = 'Com Defeito',
  MAINTENANCE = 'Manutenção',
  OUT = 'Em Campo',
  LOST = 'Sumida',
  PENDING_RETURN = 'Pendente Devolução',
  PENDING_WITHDRAWAL = 'Pendente Saída'
}

export enum PainterType {
  EMPLOYEE = 'Funcionário',
  CONTRACTOR = 'Prestador'
}

export enum UserRole {
  MANAGER = 'Manager',
  PAINTER = 'Painter'
}

export enum TransactionAction {
  REQUEST_WITHDRAWAL = 'Solicitou Retirada',
  APPROVE_WITHDRAWAL = 'Aprovar Saída',
  REQUEST_RETURN = 'Solicitou Devolução',
  CONFIRM_RETURN_OK = 'Confirmou Devolução OK',
  CONFIRM_RETURN_DEFECT = 'Confirmar Devolução com Defeito',
  MARK_LOST = 'Marcar como Perdida'
}

export interface Tool {
  id: string;
  name: string;
  model: string;
  specifications?: string;
  category: string;
  status: ToolStatus;
  currentHolderId?: string;
  lastUpdate: number;
  location?: string;
}

export interface Painter {
  id: string;
  name: string;
  type: PainterType;
}

export interface Movement {
  id: string;
  toolId: string;
  toolName: string;
  painterName: string;
  type: 'Retirada' | 'Devolução OK' | 'Defeito';
  timestamp: number;
  notes?: string;
}

export interface Transaction {
  id: string;
  toolId: string;
  toolName: string;
  painterId?: string;
  painterName: string;
  action: TransactionAction;
  timestamp: number;
  location?: string;
  notes?: string;
}
