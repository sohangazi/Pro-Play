
import React, { useState, useEffect } from 'react';
// Corrected paths to parent directory for types and constants
import { User, Transaction, Match, TransactionType, TransactionStatus, MatchStatus, Game, SecurityAlert } from '../types.ts';
import { MOCK_USERS, MOCK_GAMES, ADMIN_COMMISSION_PERCENT } from '../constants.ts';
// Corrected paths to components in the same directory
import Wallet from './Wallet.tsx';
import AdminPanel from './AdminPanel.tsx';
import MatchArena from './MatchArena.tsx';
import Auth from './Auth.tsx';
import { Layout, Wallet as WalletIcon, ShieldCheck, Trophy, LogOut, User as UserIcon, Gamepad2, ChevronRight, Bell, Menu, X, ShieldAlert } from 'lucide-react';

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [view, setView] = useState<'wallet' | 'admin' | 'arena'>('arena');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Initial Load
  useEffect(() => {
    const savedUsers = localStorage.getItem('proplay_users');
    const savedUser = localStorage.getItem('proplay_user');
    const savedTx = localStorage.getItem('proplay_transactions');
    const savedMatches = localStorage.getItem('proplay_matches');
    const savedAlerts = localStorage.getItem('proplay_security_alerts');
    
    const parsedUsers = savedUsers ? JSON.parse(savedUsers) : MOCK_USERS;
    setUsers(parsedUsers);
    
    if (savedUser) {
      const parsedCurrent = JSON.parse(savedUser);
      const syncUser = parsedUsers.find((u: User) => u.id === parsedCurrent.id);
      setCurrentUser(syncUser || parsedCurrent);
    }
    
    if (savedTx) setTransactions(JSON.parse(savedTx));
    if (savedMatches) setMatches(JSON.parse(savedMatches));
    if (savedAlerts) setSecurityAlerts(JSON.parse(savedAlerts));
  }, []);

  // Save State to LocalStorage
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem('proplay_users', JSON.stringify(users));
    }
    localStorage.setItem('proplay_transactions', JSON.stringify(transactions));
    localStorage.setItem('proplay_matches', JSON.stringify(matches));
    localStorage.setItem('proplay_security_alerts', JSON.stringify(securityAlerts));
    
    if (currentUser) {
      localStorage.setItem('proplay_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('proplay_user');
    }
  }, [users, transactions, matches, currentUser, securityAlerts]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setView(user.isAdmin ? 'admin' : 'arena');
  };

  const handleRegister = (newUser: User) => {
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setView('arena');
  };

  const handleSecurityAlert = (alert: Omit<SecurityAlert, 'id'>) => {
    const newAlert: SecurityAlert = { ...alert, id: `alert-${Date.now()}` };
    setSecurityAlerts(prev => [newAlert, ...prev]);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('arena');
    setIsSidebarOpen(false);
  };

  const handleDepositRequest = (amount: number, method: 'bKash' | 'Nagad', txnId: string) => {
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

  const handleWithdrawRequest = (amount: number, method: 'bKash' | 'Nagad', phone: string) => {
    if (!currentUser || currentUser.balance < amount) {
      alert("Insufficient balance!");
      return;
    }
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

  const updateUserBalance = (userId: string, delta: number) => {
    setUsers(prevUsers => {
      const updated = prevUsers.map(u => u.id === userId ? { ...u, balance: Math.max(0, u.balance + delta) } : u);
      if (currentUser && userId === currentUser.id) {
        const synced = updated.find(u => u.id === userId);
        if (synced) setCurrentUser(synced);
      }
      return updated;
    });
  };

  const handleAdminApprove = (txId: string) => {
    const tx = transactions.find(t => t.id === txId);
    if (!tx || tx.status !== TransactionStatus.PENDING) return;
    setTransactions(prev => prev.map(t => t.id === txId ? { ...t, status: TransactionStatus.APPROVED } : t));
    if (tx.type === TransactionType.DEPOSIT) {
      updateUserBalance(tx.userId, tx.amount);
    }
  };

  const handleAdminReject = (txId: string) => {
    const tx = transactions.find(t => t.id === txId);
    if (!tx || tx.status !== TransactionStatus.PENDING) return;
    setTransactions(prev => prev.map(t => t.id === txId ? { ...t, status: TransactionStatus.REJECTED } : t));
    if (tx.type === TransactionType.WITHDRAW) {
      updateUserBalance(tx.userId, tx.amount);
    }
  };

  const handleMatchComplete = (matchId: string, winnerId: string, commentary: string) => {
    setMatches(prev => prev.map(m => {
      if (m.id === matchId) {
        const netWinnings = m.totalPool * (1 - ADMIN_COMMISSION_PERCENT / 100);
        updateUserBalance(winnerId, netWinnings);
        return { ...m, status: MatchStatus.COMPLETED, winnerId, commentary };
      }
      return m;
    }));
  };

  const createMatch = (entryFee: number, title?: string, gameId?: string) => {
    if (!currentUser || currentUser.balance < entryFee) {
      alert("Insufficient balance! Please deposit and wait for admin approval.");
      return;
    }
    const targetGame = gameId || selectedGame?.id || 'g1';
    const newMatch: Match = {
      id: `match-${Date.now()}`,
      gameId: targetGame,
      title: title || `Quick Battle - ৳${entryFee}`,
      player1Id: currentUser.id,
      entryFee,
      totalPool: entryFee * 2,
      status: MatchStatus.ACTIVE,
      createdAt: Date.now()
    };
    updateUserBalance(currentUser.id, -entryFee);
    setMatches(prev => [newMatch, ...prev]);
  };

  if (!currentUser) {
    return (
      <Auth 
        users={users} 
        onLogin={handleLogin} 
        onRegister={handleRegister}
        onSecurityAlert={handleSecurityAlert} 
      />
    );
  }

  const NavigationItems = () => (
    <>
      <button onClick={() => { setView('arena'); setSelectedGame(null); setIsSidebarOpen(false); }} className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all ${view === 'arena' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
        <div className="flex items-center gap-3"><Layout className="w-5 h-5" /><span className="font-semibold text-sm">Game Arena</span></div>
        <ChevronRight className={`w-4 h-4 transition-opacity ${view === 'arena' ? 'opacity-100' : 'opacity-0'}`} />
      </button>
      <button onClick={() => { setView('wallet'); setIsSidebarOpen(false); }} className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all ${view === 'wallet' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
        <div className="flex items-center gap-3"><WalletIcon className="w-5 h-5" /><span className="font-semibold text-sm">My Wallet</span></div>
        <ChevronRight className={`w-4 h-4 transition-opacity ${view === 'wallet' ? 'opacity-100' : 'opacity-0'}`} />
      </button>
      {currentUser.isAdmin && (
        <button onClick={() => { setView('admin'); setIsSidebarOpen(false); }} className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all ${view === 'admin' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
          <div className="flex items-center gap-3"><ShieldCheck className="w-5 h-5" /><span className="font-semibold text-sm">Admin HQ</span></div>
          <ChevronRight className={`w-4 h-4 transition-opacity ${view === 'admin' ? 'opacity-100' : 'opacity-0'}`} />
        </button>
      )}
    </>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#020617] text-slate-200 overflow-x-hidden">
      {isSidebarOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden" onClick={() => setIsSidebarOpen(false)} />}
      <nav className={`fixed inset-y-0 left-0 w-72 glass border-r border-white/5 p-6 flex flex-col z-40 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20 rotate-3"><Trophy className="text-white w-7 h-7" /></div>
            <div><span className="text-2xl font-black tracking-tighter text-white uppercase block leading-none">PROPLAY</span><span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Elite Gaming Hub</span></div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-500"><X className="w-6 h-6" /></button>
        </div>
        <div className="flex-1 space-y-1.5"><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-3">Main Menu</p><NavigationItems /></div>
        <div className="pt-6 border-t border-white/5 mt-auto">
          <div className="bg-white/5 p-4 rounded-3xl mb-4 border border-white/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20"><UserIcon className="w-5 h-5 text-indigo-400" /></div>
              <div className="overflow-hidden"><p className="text-sm font-bold text-white truncate">{currentUser.name}</p><p className="text-xs font-medium text-emerald-400">৳{currentUser.balance.toLocaleString()}</p></div>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 w-full opacity-20" /></div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-slate-500 hover:text-rose-400 hover:bg-rose-400/5 transition-all text-xs font-bold"><LogOut className="w-4 h-4" />LOGOUT</button>
        </div>
      </nav>
      <main className="flex-1 overflow-y-auto custom-scrollbar flex flex-col h-screen">
        <div className="sticky top-0 z-20 glass border-b border-white/5 px-4 md:px-10 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-400"><Menu className="w-6 h-6" /></button>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /><span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Live Servers</span></div>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            {currentUser.isAdmin && securityAlerts.length > 0 && <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-full animate-pulse"><ShieldAlert className="w-3 h-3 text-rose-500" /><span className="text-[9px] font-black text-rose-500 uppercase">{securityAlerts.length} Alerts</span></div>}
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20"><span className="text-xs font-black text-emerald-400 uppercase">৳{currentUser.balance.toLocaleString()}</span></div>
          </div>
        </div>
        <div className="p-4 md:p-10 max-w-6xl mx-auto w-full flex-1">
          {view === 'arena' && <MatchArena selectedGame={selectedGame} onSelectGame={setSelectedGame} matches={matches} onJoin={createMatch} onComplete={handleMatchComplete} currentUser={currentUser} />}
          {view === 'wallet' && <Wallet user={currentUser} transactions={transactions.filter(t => t.userId === currentUser.id)} onDeposit={handleDepositRequest} onWithdraw={handleWithdrawRequest} />}
          {view === 'admin' && <AdminPanel transactions={transactions} users={users} securityAlerts={securityAlerts} onApprove={handleAdminApprove} onReject={handleAdminReject} />}
        </div>
      </main>
    </div>
  );
};

export default App;
