
export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
  GAME_ENTRY = 'GAME_ENTRY',
  GAME_WIN = 'GAME_WIN'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum MatchStatus {
  WAITING = 'WAITING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED'
}

export interface Game {
  id: string;
  name: string;
  image: string;
  activePlayers: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  balance: number;
  isAdmin: boolean;
  phone?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  method: 'bKash' | 'Nagad';
  status: TransactionStatus;
  txnId?: string;
  targetPhone?: string;
  timestamp: number;
}

export interface Match {
  id: string;
  gameId: string;
  title: string;
  player1Id: string;
  player2Id?: string;
  entryFee: number;
  totalPool: number;
  winnerId?: string;
  status: MatchStatus;
  createdAt: number;
  commentary?: string;
}

export interface AppState {
  currentUser: User;
  users: User[];
  transactions: Transaction[];
  matches: Match[];
}
