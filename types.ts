
export enum ToolStatus {
  AVAILABLE = 'Disponível',
  IN_USE = 'Em Uso',
  OUT = 'Em Campo',
  PENDING_CONFERENCE = 'Aguardando Conferência',
  PENDING_RETURN = 'Aguardando Conferência',
  PENDING_WITHDRAWAL = 'Aguardando Retirada',
  DEFECTIVE = 'Com Defeito',
  MAINTENANCE = 'Manutenção',
  LOST = 'Perda/Sumida'
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'admin',
  PAINTER = 'pintor',
  CONFEREE = 'conferente'
}

export enum PainterType {
  EMPLOYEE = 'Funcionário',
  CONTRACTOR = 'Terceirizado'
}

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: UserRole;
  active: boolean;
  type?: PainterType;
}

// Alias for components expecting Painter
export type Painter = User;

export interface Tool {
  id: string;
  name: string;
  model: string;
  category: string;
  status: ToolStatus;
  currentHolderId?: string;
  lastUpdate: number;
  specifications?: string;
  location?: string;
}

export enum TransactionAction {
  RETIRADA = 'Retirada',
  SOLICITOU_DEVOLUCAO = 'Solicitou Devolução',
  CONFIRMOU_OK = 'Confirmou OK',
  CONFIRMOU_DEFEITO = 'Confirmou Defeito',
  REQUEST_WITHDRAWAL = 'Solicitou Retirada',
  APPROVE_WITHDRAWAL = 'Aprovou Retirada',
  REQUEST_RETURN = 'Solicitou Devolução',
  CONFIRM_RETURN_OK = 'Confirmou OK',
  CONFIRM_RETURN_DEFECT = 'Confirmou Defeito',
  MARK_LOST = 'Marcou como Perdida'
}

export interface Movement {
  id: string;
  toolId: string;
  toolName: string;
  userName: string;
  userId: string;
  painterName?: string;
  action: TransactionAction | string;
  timestamp: number;
  location?: string;
}

// Alias for components expecting Transaction
export type Transaction = Movement;
