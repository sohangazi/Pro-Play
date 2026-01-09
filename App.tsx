
import React, { useState, useEffect } from 'react';
import { User, Transaction, Match, TransactionType, TransactionStatus, MatchStatus, Game } from './types';
import { MOCK_USERS, MOCK_GAMES, ADMIN_COMMISSION_PERCENT } from './constants';
import Wallet from './components/Wallet';
import AdminPanel from './components/AdminPanel';
import MatchArena from './components/MatchArena';
import { Layout, Wallet as WalletIcon, ShieldCheck, Trophy, LogOut, User as UserIcon, Gamepad2, ChevronRight, Bell, Menu, X } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [view, setView] = useState<'wallet' | 'admin' | 'arena'>('arena');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const savedTx = localStorage.getItem('proplay_transactions');
    const savedMatches = localStorage.getItem('proplay_matches');
    if (savedTx) setTransactions(JSON.parse(savedTx));
    if (savedMatches) setMatches(JSON.parse(savedMatches));
  }, []);

  useEffect(() => {
    localStorage.setItem('proplay_transactions', JSON.stringify(transactions));
    localStorage.setItem('proplay_matches', JSON.stringify(matches));
  }, [transactions, matches]);

  const handleDepositRequest = (amount: number, method: 'bKash' | 'Nagad', txnId: string) => {
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
    if (currentUser.balance < amount) {
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
    setCurrentUser(prev => ({ ...prev, balance: prev.balance - amount }));
    setTransactions(prev => [newTx, ...prev]);
  };

  const handleAdminApprove = (txId: string) => {
    setTransactions(prev => prev.map(tx => {
      if (tx.id === txId && tx.status === TransactionStatus.PENDING) {
        if (tx.type === TransactionType.DEPOSIT && tx.userId === currentUser.id) {
          setCurrentUser(curr => ({ ...curr, balance: curr.balance + tx.amount }));
        }
        return { ...tx, status: TransactionStatus.APPROVED };
      }
      return tx;
    }));
  };

  const handleAdminReject = (txId: string) => {
    setTransactions(prev => prev.map(tx => {
      if (tx.id === txId && tx.status === TransactionStatus.PENDING) {
        if (tx.type === TransactionType.WITHDRAW && tx.userId === currentUser.id) {
          setCurrentUser(curr => ({ ...curr, balance: curr.balance + tx.amount }));
        }
        return { ...tx, status: TransactionStatus.REJECTED };
      }
      return tx;
    }));
  };

  const handleMatchComplete = (matchId: string, winnerId: string, commentary: string) => {
    setMatches(prev => prev.map(m => {
      if (m.id === matchId) {
        const netWinnings = m.totalPool * (1 - ADMIN_COMMISSION_PERCENT / 100);
        if (winnerId === currentUser.id) {
          setCurrentUser(curr => ({ ...curr, balance: curr.balance + netWinnings }));
        }
        return { ...m, status: MatchStatus.COMPLETED, winnerId, commentary };
      }
      return m;
    }));
  };

  const createMatch = (entryFee: number, title?: string, gameId?: string) => {
    if (currentUser.balance < entryFee) {
      alert("Insufficient balance!");
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
    setCurrentUser(prev => ({ ...prev, balance: prev.balance - entryFee }));
    setMatches(prev => [newMatch, ...prev]);
  };

  const NavigationItems = () => (
    <>
      <button 
        onClick={() => { setView('arena'); setSelectedGame(null); setIsSidebarOpen(false); }}
        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group ${view === 'arena' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
      >
        <div className="flex items-center gap-3">
          <Layout className="w-5 h-5" />
          <span className="font-semibold text-sm">Game Arena</span>
        </div>
        <ChevronRight className={`w-4 h-4 transition-opacity ${view === 'arena' ? 'opacity-100' : 'opacity-0'}`} />
      </button>
      
      <button 
        onClick={() => { setView('wallet'); setIsSidebarOpen(false); }}
        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group ${view === 'wallet' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
      >
        <div className="flex items-center gap-3">
          <WalletIcon className="w-5 h-5" />
          <span className="font-semibold text-sm">My Wallet</span>
        </div>
        <ChevronRight className={`w-4 h-4 transition-opacity ${view === 'wallet' ? 'opacity-100' : 'opacity-0'}`} />
      </button>

      {currentUser.isAdmin && (
        <button 
          onClick={() => { setView('admin'); setIsSidebarOpen(false); }}
          className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group ${view === 'admin' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
        >
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5" />
            <span className="font-semibold text-sm">Admin HQ</span>
          </div>
          <ChevronRight className={`w-4 h-4 transition-opacity ${view === 'admin' ? 'opacity-100' : 'opacity-0'}`} />
        </button>
      )}
    </>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#020617] text-slate-200 overflow-x-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <nav className={`
        fixed inset-y-0 left-0 w-72 glass border-r border-white/5 p-6 flex flex-col z-40 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20 rotate-3">
              <Trophy className="text-white w-7 h-7" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tighter text-white uppercase block leading-none">PROPLAY</span>
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Elite Gaming Hub</span>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-500">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 space-y-1.5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-3">Main Menu</p>
          <NavigationItems />
        </div>

        <div className="pt-6 border-t border-white/5 mt-auto">
          <div className="bg-white/5 p-4 rounded-3xl mb-4 border border-white/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                <UserIcon className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
                <p className="text-xs font-medium text-emerald-400">৳{currentUser.balance.toLocaleString()}</p>
              </div>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 w-3/4" />
            </div>
          </div>
          <button 
            onClick={() => setCurrentUser(MOCK_USERS.find(u => u.id !== currentUser.id) || MOCK_USERS[0])}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-slate-500 hover:text-rose-400 hover:bg-rose-400/5 transition-all text-xs font-bold"
          >
            <LogOut className="w-4 h-4" />
            SWITCH ACCOUNT
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar flex flex-col h-screen">
        {/* Top Header */}
        <div className="sticky top-0 z-20 glass border-b border-white/5 px-4 md:px-10 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-400"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Global Servers Live</span>
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <button className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-[#020617]" />
            </button>
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Season 4</span>
              <span className="text-xs font-black text-indigo-400">DIAMOND TIER</span>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="p-4 md:p-10 max-w-6xl mx-auto w-full flex-1">
          {view === 'arena' && (
            <MatchArena 
              selectedGame={selectedGame}
              onSelectGame={setSelectedGame}
              matches={matches} 
              onJoin={createMatch} 
              onComplete={handleMatchComplete}
              currentUser={currentUser}
            />
          )}
          {view === 'wallet' && (
            <Wallet 
              user={currentUser} 
              transactions={transactions.filter(t => t.userId === currentUser.id)}
              onDeposit={handleDepositRequest}
              onWithdraw={handleWithdrawRequest}
            />
          )}
          {view === 'admin' && (
            <AdminPanel 
              transactions={transactions} 
              onApprove={handleAdminApprove} 
              onReject={handleAdminReject} 
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
