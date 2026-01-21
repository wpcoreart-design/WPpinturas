
export enum ToolStatus {
  AVAILABLE = 'disponível',
  OUT = 'em campo',
  PENDING_RETURN = 'aguardando conferência',
  DEFECTIVE = 'defeito',
  MAINTENANCE = 'manutenção',
  LOST = 'perdida',
  PENDING_WITHDRAWAL = 'aguardando retirada'
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'admin',
  PAINTER = 'pintor'
}

export enum PainterType {
  EMPLOYEE = 'CLT',
  CONTRACTOR = 'Parceiro'
}

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: UserRole;
  active: boolean;
  totalDebt?: number; // Valor acumulado de aluguéis
  type?: PainterType;
}

export type Painter = User;

export interface Tool {
  id: string;
  name: string;
  model: string;
  category: string;
  status: ToolStatus;
  dailyRate: number; // Valor do aluguel por dia
  currentHolderId?: string;
  lastUpdate: number;
  withdrawDate?: number; // Timestamp de quando foi retirada
  isDeleted?: boolean; // Exclusão lógica
  location?: string;
  specifications?: string;
}

export enum TransactionAction {
  REQUEST_WITHDRAWAL = 'Solicitou Retirada',
  APPROVE_WITHDRAWAL = 'Aprovação de Saída',
  REQUEST_RETURN = 'Solicitou Devolução',
  CONFIRM_RETURN_OK = 'Confirmou OK',
  CONFIRM_RETURN_DEFECT = 'Confirmou com Defeito',
  MARK_LOST = 'Registrada Perda'
}

export interface Movement {
  id: string;
  toolId: string;
  toolName: string;
  userId: string;
  userName: string;
  painterName?: string;
  action: TransactionAction | 'retirada' | 'devolução' | 'manutenção';
  timestamp: number;
  daysUsed?: number;
  cost?: number; // Custo calculado deste aluguel
  statusAtTime?: ToolStatus;
  location?: string;
}

export type Transaction = Movement;
