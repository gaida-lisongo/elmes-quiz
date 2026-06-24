export interface AgentRetrait {
  _id: string;
  amount: number;
  providerTxId?: string;
  status: 'EN_ATTENTE' | 'SUCCES' | 'ECHEC';
  createdAt: string;
}

export interface AgentTicket {
  _id: string;
  ticketId: string;
  assignedAt: string;
}

export interface AgentUser {
  _id: string;
  pseudo: string;
  telephone: string;
  email?: string;
  photo?: string;
  solde: number;
  role: 'PLAYER' | 'MOD' | 'ADMIN';
}

export interface AgentData {
  _id: string;
  userId: AgentUser;
  permissions: string[];
  retraits: AgentRetrait[];
  tickets: AgentTicket[];
  createdAt: string;
  updatedAt: string;
}
