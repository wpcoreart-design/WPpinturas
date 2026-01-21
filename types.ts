
// PincelPro - Central Types Definition

export enum ToolStatus {
  AVAILABLE = 'disponível',
  OUT = 'emprestado',
  PENDING_RETURN = 'aguardando_conferencia',
  DEFECTIVE = 'defeito',
  LOST = 'perdido',
  /** Status used for tools awaiting approval of withdrawal */
  PENDING_WITHDRAWAL = 'pendente_retirada'
}

export enum UserRole {
  ADMIN = 'admin',
  PAINTER = 'pintor',
  CONFEREE = 'conferente',
  /** Manager role used in Dashboard and ToolInventory components */
  MANAGER = 'manager'
}

/** Type of employment or contract for painters */
export enum PainterType {
  EMPLOYEE = 'CLT',
  CONTRACTOR = 'Terceirizado'
}

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: UserRole;
  active: boolean;
}

/** Interface representing a Painter, extending base User */
export interface Painter extends User {
  type?: PainterType;
}

export interface Tool {
  id: string;
  name: string;
  model: string;
  category: string;
  status: ToolStatus;
  currentHolderId?: string;
  lastUpdate: number;
  /** Optional specifications/notes about the tool */
  specifications?: string;
  /** Current location or site where the tool is being used */
  location?: string;
}

/** Predefined actions for tool movement records */
export enum TransactionAction {
  REQUEST_WITHDRAWAL = 'Solicitou Retirada',
  APPROVE_WITHDRAWAL = 'Aprovou Retirada',
  REQUEST_RETURN = 'Solicitou Devolução',
  CONFIRM_RETURN_OK = 'Confirmou OK',
  CONFIRM_RETURN_DEFECT = 'Confirmou Defeito',
  MARK_LOST = 'Perda/Sumida'
}

/** Interface for tool movement transactions used in various components */
export interface Transaction {
  id: string;
  toolId: string;
  toolName: string;
  userId?: string;
  userName?: string;
  painterId?: string;
  painterName?: string;
  action: TransactionAction | string;
  timestamp: number;
  location?: string;
  notes?: string;
}

/** Alias for Movement used in App.tsx, unified with Transaction interface */
export interface Movement extends Transaction {
  userId: string;
  userName: string;
  /** Union of strings used in App.tsx and TransactionAction enum values */
  action: TransactionAction | 'retirada' | 'solicitou_devolucao' | 'confirmou_ok' | 'confirmou_defeito';
}
