
import React from 'react';
import { Transaction, TransactionStatus, TransactionType } from '../types';
import { Check, X, ShieldAlert, Search, Calendar, Landmark, Smartphone } from 'lucide-react';

interface AdminPanelProps {
  transactions: Transaction[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ transactions, onApprove, onReject }) => {
  const pendingTransactions = transactions.filter(t => t.status === TransactionStatus.PENDING);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 md:mb-2">
             <ShieldAlert className="text-rose-500 w-5 h-5 md:w-6 md:h-6" />
             <h1 className="text-2xl md:text-3xl font-bold text-white uppercase italic tracking-tighter">Admin HQ</h1>
          </div>
          <p className="text-slate-400 text-sm">Review transaction verification requests.</p>
        </div>
        <div className="relative group">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
           <input 
              type="text" 
              placeholder="Search ID..." 
              className="bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full sm:w-64"
           />
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
         <div className="bg-slate-900/50 border border-slate-800 rounded-2xl md:rounded-3xl p-5 md:p-6">
            <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-widest mb-1">Queue</p>
            <p className="text-2xl md:text-3xl font-black text-white">{pendingTransactions.length}</p>
         </div>
         <div className="bg-slate-900/50 border border-slate-800 rounded-2xl md:rounded-3xl p-5 md:p-6">
            <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-widest mb-1">Deposits</p>
            <p className="text-2xl md:text-3xl font-black text-emerald-500">
              {pendingTransactions.filter(t => t.type === TransactionType.DEPOSIT).length}
            </p>
         </div>
         <div className="bg-slate-900/50 border border-slate-800 rounded-2xl md:rounded-3xl p-5 md:p-6">
            <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-widest mb-1">Payouts</p>
            <p className="text-2xl md:text-3xl font-black text-rose-500">
              {pendingTransactions.filter(t => t.type === TransactionType.WITHDRAW).length}
            </p>
         </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl md:rounded-3xl overflow-hidden">
        {/* Desktop Header */}
        <div className="hidden lg:grid grid-cols-12 bg-slate-950 border-b border-slate-800 px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          <div className="col-span-3">User / Date</div>
          <div className="col-span-2">Entry</div>
          <div className="col-span-2">Amount</div>
          <div className="col-span-3">Verification</div>
          <div className="col-span-2 text-right">Review</div>
        </div>

        <div className="divide-y divide-slate-800">
          {pendingTransactions.length === 0 ? (
            <div className="py-20 text-center text-slate-500 font-medium italic">
              All requests processed. Queue empty.
            </div>
          ) : (
            pendingTransactions.map(tx => (
              <div key={tx.id} className="grid grid-cols-1 lg:grid-cols-12 px-5 md:px-6 py-5 md:py-6 gap-4 items-center hover:bg-slate-800/30 transition-colors">
                {/* Mobile & Desktop: User Info */}
                <div className="lg:col-span-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                    <Smartphone className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm truncate max-w-[150px]">{tx.userId}</p>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(tx.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Entry Details */}
                <div className="lg:col-span-2 flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${tx.type === TransactionType.DEPOSIT ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                    {tx.type}
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold border ${tx.method === 'bKash' ? 'border-pink-500/50 text-pink-500' : 'border-orange-500/50 text-orange-500'}`}>
                    {tx.method}
                  </span>
                </div>

                {/* Amount */}
                <div className="lg:col-span-2">
                  <span className="text-lg font-black text-white italic">৳{tx.amount}</span>
                </div>

                {/* Verification */}
                <div className="lg:col-span-3">
                  {tx.type === TransactionType.DEPOSIT ? (
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] text-slate-500 uppercase font-black">Submitted Txn ID</span>
                      <code className="text-[11px] text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded w-fit font-mono">{tx.txnId}</code>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] text-slate-500 uppercase font-black">Target Wallet</span>
                      <p className="text-xs text-slate-200 font-mono tracking-wider">{tx.targetPhone}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="lg:col-span-2 flex items-center justify-start lg:justify-end gap-3 mt-2 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-white/5">
                  <button 
                    onClick={() => onReject(tx.id)}
                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 lg:w-10 h-10 px-4 lg:px-0 rounded-xl bg-slate-800 text-slate-400 hover:bg-rose-500/20 hover:text-rose-500 transition-all text-xs font-bold"
                  >
                    <X className="w-5 h-5" />
                    <span className="lg:hidden">REJECT</span>
                  </button>
                  <button 
                    onClick={() => onApprove(tx.id)}
                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 lg:w-10 h-10 px-4 lg:px-0 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all text-xs font-bold"
                  >
                    <Check className="w-5 h-5" />
                    <span className="lg:hidden">APPROVE</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
