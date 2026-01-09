
import React, { useState } from 'react';
import { User, Transaction, TransactionStatus, TransactionType } from '../types';
import { CreditCard, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2, XCircle, Plus, Minus, Landmark, ShieldCheck, Trophy } from 'lucide-react';

interface WalletProps {
  user: User;
  transactions: Transaction[];
  onDeposit: (amount: number, method: 'bKash' | 'Nagad', txnId: string) => void;
  onWithdraw: (amount: number, method: 'bKash' | 'Nagad', phone: string) => void;
}

const Wallet: React.FC<WalletProps> = ({ user, transactions, onDeposit, onWithdraw }) => {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState<string>('');
  const [method, setMethod] = useState<'bKash' | 'Nagad'>('bKash');
  const [txnId, setTxnId] = useState<string>('');
  const [phone, setPhone] = useState<string>(user.phone || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;

    if (activeTab === 'deposit') {
      if (!txnId) return;
      onDeposit(val, method, txnId);
      setTxnId('');
    } else {
      if (!phone) return;
      onWithdraw(val, method, phone);
    }
    setAmount('');
  };

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-10">
      {/* Header Section */}
      <header className="space-y-1 px-1">
        <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-tight">
          Finances
        </h1>
        <p className="text-slate-400 font-medium text-sm md:text-lg">
          Secure deposits and instant payouts.
        </p>
      </header>

      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 md:gap-10">
        {/* Left Column: Balance & Actions */}
        <div className="lg:col-span-5 space-y-6">
          {/* ProPlay Card - Redesigned for No Overlap */}
          <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-white/10">
             <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-[60px]" />
             
             <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-indigo-100/60 font-bold uppercase tracking-widest text-[9px] md:text-[10px] mb-1">Total Assets</p>
                    <h2 className="text-3xl md:text-5xl font-black text-white italic break-all">
                      ৳{user.balance.toLocaleString()}
                    </h2>
                  </div>
                  <div className="w-10 h-10 md:w-14 md:h-14 bg-white/10 backdrop-blur-lg rounded-xl md:rounded-2xl flex items-center justify-center border border-white/20 shrink-0">
                    <Trophy className="text-white w-5 h-5 md:w-7 md:h-7" />
                  </div>
                </div>

                <div className="flex justify-between items-end gap-2">
                  <div className="overflow-hidden">
                    <p className="text-indigo-100/60 font-bold uppercase tracking-[0.2em] text-[7px] md:text-[8px] mb-1">Account Holder</p>
                    <p className="text-xs md:text-sm font-black text-white uppercase tracking-widest truncate">
                      {user.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full border border-white/5 shrink-0">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span className="text-[8px] md:text-[9px] font-black text-white uppercase tracking-widest">Verified</span>
                  </div>
                </div>
             </div>
          </div>

          {/* Action Tabs & Form */}
          <div className="glass p-5 md:p-8 rounded-[2rem] border-white/5 space-y-6">
            <div className="flex gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/5">
              <button 
                onClick={() => setActiveTab('deposit')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 md:py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${activeTab === 'deposit' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Plus className="w-3.5 h-3.5" /> Deposit
              </button>
              <button 
                onClick={() => setActiveTab('withdraw')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 md:py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${activeTab === 'withdraw' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Minus className="w-3.5 h-3.5" /> Payout
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button"
                  onClick={() => setMethod('bKash')}
                  className={`px-3 py-4 rounded-xl border-2 font-black transition-all text-[10px] uppercase tracking-widest flex flex-col items-center gap-2 ${method === 'bKash' ? 'bg-pink-600/10 border-pink-500 text-pink-500' : 'bg-[#020617] border-white/5 text-slate-500'}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${method === 'bKash' ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20' : 'bg-slate-800 text-slate-400'}`}>B</div>
                  bKash
                </button>
                <button 
                  type="button"
                  onClick={() => setMethod('Nagad')}
                  className={`px-3 py-4 rounded-xl border-2 font-black transition-all text-[10px] uppercase tracking-widest flex flex-col items-center gap-2 ${method === 'Nagad' ? 'bg-orange-600/10 border-orange-500 text-orange-500' : 'bg-[#020617] border-white/5 text-slate-500'}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${method === 'Nagad' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'bg-slate-800 text-slate-400'}`}>N</div>
                  Nagad
                </button>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Amount (৳)</label>
                <input 
                  type="number"
                  placeholder="0.00"
                  className="w-full bg-[#020617] border border-white/5 rounded-xl px-4 py-4 md:py-5 text-xl font-black text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              {activeTab === 'deposit' ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Verification Txn ID</label>
                    <input 
                      type="text"
                      placeholder="TXN..."
                      className="w-full bg-[#020617] border border-white/5 rounded-xl px-4 py-4 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                      value={txnId}
                      onChange={(e) => setTxnId(e.target.value)}
                      required
                    />
                  </div>
                  <div className="bg-indigo-500/5 p-3 rounded-xl border border-indigo-500/10">
                    <p className="text-[9px] md:text-[10px] text-indigo-400/80 leading-relaxed">
                      Send to: <span className="text-white font-bold">017XXXXXXXX</span> (Personal)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Receiver Number</label>
                  <input 
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    className="w-full bg-[#020617] border border-white/5 rounded-xl px-4 py-4 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              )}

              <button 
                type="submit"
                className="w-full py-4 md:py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-600/30 transition-all active:scale-[0.98] text-xs"
              >
                Confirm {activeTab === 'deposit' ? 'Deposit' : 'Payout'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Transaction History */}
        <div className="lg:col-span-7 space-y-4 md:space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="flex items-center gap-3 text-lg md:text-xl font-black text-white uppercase italic tracking-tight">
               <div className="w-1 h-5 md:h-6 bg-indigo-500 rounded-full" />
               Statement
            </h3>
            <span className="text-[9px] font-bold text-slate-500 bg-white/5 px-3 py-1 rounded-full uppercase">{transactions.length} items</span>
          </div>
          
          <div className="glass rounded-[2rem] overflow-hidden border-white/5">
            <div className="divide-y divide-white/5 max-h-[500px] md:max-h-[800px] overflow-y-auto custom-scrollbar">
              {transactions.length === 0 ? (
                <div className="py-20 text-center px-6">
                   <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Landmark className="text-slate-800 w-8 h-8" />
                   </div>
                   <p className="text-slate-600 font-bold uppercase tracking-widest text-[10px]">No activity recorded</p>
                </div>
              ) : (
                transactions.map((tx) => (
                  <div key={tx.id} className="p-4 md:p-6 hover:bg-white/5 transition-all">
                    <div className="flex flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3 md:gap-5 min-w-0">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 ${tx.type === TransactionType.DEPOSIT ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                          {tx.type === TransactionType.DEPOSIT ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-0.5">
                            <p className="font-black text-white uppercase tracking-tight text-xs md:text-sm truncate">
                              {tx.type === TransactionType.DEPOSIT ? 'Deposit' : 'Withdrawal'}
                            </p>
                            <span className={`text-[7px] md:text-[8px] px-1.5 py-0.5 rounded font-black uppercase border shrink-0 ${tx.method === 'bKash' ? 'border-pink-500/30 text-pink-400' : 'border-orange-500/30 text-orange-400'}`}>
                              {tx.method}
                            </span>
                          </div>
                          <p className="text-[8px] md:text-[9px] font-bold text-slate-500 tracking-widest">{new Date(tx.timestamp).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-base md:text-xl font-black italic ${tx.type === TransactionType.DEPOSIT ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {tx.type === TransactionType.DEPOSIT ? '+' : '-'}৳{tx.amount.toLocaleString()}
                        </p>
                        <div className="flex items-center justify-end gap-1.5 mt-1">
                          <div className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full ${tx.status === TransactionStatus.APPROVED ? 'bg-emerald-500' : tx.status === TransactionStatus.REJECTED ? 'bg-rose-500' : 'bg-amber-500 animate-pulse'}`} />
                          <span className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest ${
                            tx.status === TransactionStatus.APPROVED ? 'text-emerald-500' : 
                            tx.status === TransactionStatus.REJECTED ? 'text-rose-500' : 
                            'text-amber-500'
                          }`}>
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
