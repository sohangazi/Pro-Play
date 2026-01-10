import React, { useState, useEffect } from 'react';
import { User, Transaction, Match, TransactionType, TransactionStatus, MatchStatus, Game, SecurityAlert } from '../types.ts';
import { MOCK_USERS, ADMIN_COMMISSION_PERCENT } from '../constants.ts';
import Wallet from './Wallet.tsx';
import AdminPanel from './AdminPanel.tsx';
import MatchArena from './MatchArena.tsx';
import Auth from './Auth.tsx';
import { Layout, Trophy, LogOut, ChevronRight, Menu, X, ShieldCheck, Wallet as WalletIcon, Gamepad2 } from 'lucide-react';

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [view, setView] = useState<'wallet' | 'admin' | 'arena'>('arena');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Load Data
  useEffect(() => {
    const savedUsers = localStorage.getItem('proplay_users');
    const savedUser = localStorage.getItem('proplay_user');
    const savedTx = localStorage.getItem('proplay_transactions');
    const savedMatches = localStorage.getItem('proplay_matches');
    
    const parsedUsers = savedUsers ? JSON.parse(savedUsers) : MOCK_USERS;
    setUsers(parsedUsers);
    
    if (savedUser) {
      const parsedCurrent = JSON.parse(savedUser);
      const syncUser = parsedUsers.find((u: User) => u.id === parsedCurrent.id);
      setCurrentUser(syncUser || parsedCurrent);
    }
    
    if (savedTx) setTransactions(JSON.parse(savedTx));
    if (savedMatches) setMatches(JSON.parse(savedMatches));
  }, []);

  // Persist Data
  useEffect(() => {
    if (users.length > 0) localStorage.setItem('proplay_users', JSON.stringify(users));
    localStorage.setItem('proplay_transactions', JSON.stringify(transactions));
    localStorage.setItem('proplay_matches', JSON.stringify(matches));
    if (currentUser) localStorage.setItem('proplay_user', JSON.stringify(currentUser));
  }, [users, transactions, matches, currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setView(user.isAdmin ? 'admin' : 'arena');
  };

  const handleRegister = (newUser: User) => {
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setView('arena');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('proplay_user');
    setView('arena');
    setIsSidebarOpen(false);
  };

  const updateUserBalance = (userId: string, delta: number) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, balance: u.balance + delta } : u));
    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, balance: prev.balance + delta } : null);
    }
  };

  const handleDeposit = (amount: number, method: 'bKash' | 'Nagad', txnId: string) => {
    if (!currentUser) return;
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      userId: currentUser.id,
      type: TransactionType.DEPOSIT,
      amount,
      method,
      status: TransactionStatus.PENDING,
      txnId,
      timestamp: Date.now()
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const handleWithdraw = (amount: number, method: 'bKash' | 'Nagad', phone: string) => {
    if (!currentUser || currentUser.balance < amount) return;
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      userId: currentUser.id,
      type: TransactionType.WITHDRAW,
      amount,
      method,
      status: TransactionStatus.PENDING,
      targetPhone: phone,
      timestamp: Date.now()
    };
    updateUserBalance(currentUser.id, -amount);
    setTransactions(prev => [newTx, ...prev]);
  };

  const handleAdminApprove = (txId: string) => {
    const tx = transactions.find(t => t.id === txId);
    if (!tx) return;
    setTransactions(prev => prev.map(t => t.id === txId ? { ...t, status: TransactionStatus.APPROVED } : t));
    if (tx.type === TransactionType.DEPOSIT) updateUserBalance(tx.userId, tx.amount);
  };

  const handleAdminReject = (txId: string) => {
    const tx = transactions.find(t => t.id === txId);
    if (!tx) return;
    setTransactions(prev => prev.map(t => t.id === txId ? { ...t, status: TransactionStatus.REJECTED } : t));
    if (tx.type === TransactionType.WITHDRAW) updateUserBalance(tx.userId, tx.amount);
  };

  const handleJoinMatch = (fee: number, title?: string, gameId?: string) => {
    if (!currentUser || currentUser.balance < fee) {
      alert("Insufficient balance!");
      return;
    }
    const newMatch: Match = {
      id: `match-${Date.now()}`,
      gameId: gameId || selectedGame?.id || 'g1',
      title: title || 'Custom Battle',
      player1Id: currentUser.id,
      entryFee: fee,
      totalPool: fee * 2,
      status: MatchStatus.ACTIVE,
      createdAt: Date.now()
    };
    updateUserBalance(currentUser.id, -fee);
    setMatches(prev => [newMatch, ...prev]);
  };

  const handleMatchComplete = (matchId: string, winnerId: string, commentary: string) => {
    setMatches(prev => prev.map(m => {
      if (m.id === matchId) {
        const prize = m.totalPool * (1 - ADMIN_COMMISSION_PERCENT/100);
        updateUserBalance(winnerId, prize);
        return { ...m, status: MatchStatus.COMPLETED, winnerId, commentary };
      }
      return m;
    }));
  };

  if (!currentUser) {
    return <Auth users={users} onLogin={handleLogin} onRegister={handleRegister} onSecurityAlert={() => {}} />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#020617] text-slate-200">
      {/* Sidebar Navigation */}
      <nav className={`fixed md:relative z-40 w-72 h-full glass border-r border-white/5 p-6 flex flex-col transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20"><Trophy className="text-white w-6 h-6" /></div>
          <span className="text-2xl font-black italic tracking-tighter text-white">PROPLAY</span>
        </div>
        
        <div className="flex-1 space-y-2">
          <button onClick={() => {setView('arena'); setSelectedGame(null); setIsSidebarOpen(false)}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${view === 'arena' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}>
            <Gamepad2 size={18} /> Game Arena
          </button>
          <button onClick={() => {setView('wallet'); setIsSidebarOpen(false)}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${view === 'wallet' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}>
            <WalletIcon size={18} /> Wallet
          </button>
          {currentUser.isAdmin && (
            <button onClick={() => {setView('admin'); setIsSidebarOpen(false)}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${view === 'admin' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}>
              <ShieldCheck size={18} /> Admin Panel
            </button>
          )}
        </div>

        <div className="pt-6 border-t border-white/5">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20"><Trophy size={20} className="text-indigo-400" /></div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{currentUser.name}</p>
              <p className="text-xs font-bold text-emerald-400">৳{currentUser.balance.toLocaleString()}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-rose-400 font-bold hover:bg-rose-400/5 transition-all">
            <LogOut size={18} /> LOGOUT
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-screen custom-scrollbar">
        <div className="sticky top-0 z-20 glass border-b border-white/5 px-6 py-4 md:hidden flex justify-between items-center">
          <h1 className="text-xl font-black italic">PROPLAY</h1>
          <button onClick={() => setIsSidebarOpen(true)}><Menu /></button>
        </div>
        
        <div className="p-6 md:p-10 max-w-6xl mx-auto w-full">
          {view === 'arena' && <MatchArena matches={matches} currentUser={currentUser} selectedGame={selectedGame} onSelectGame={setSelectedGame} onJoin={handleJoinMatch} onComplete={handleMatchComplete} />}
          {view === 'wallet' && <Wallet user={currentUser} transactions={transactions.filter(t => t.userId === currentUser.id)} onDeposit={handleDeposit} onWithdraw={handleWithdraw} />}
          {view === 'admin' && <AdminPanel transactions={transactions} users={users} securityAlerts={securityAlerts} onApprove={handleAdminApprove} onReject={handleAdminReject} />}
        </div>
      </main>
    </div>
  );
};

export default App;