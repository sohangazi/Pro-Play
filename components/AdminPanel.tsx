
import React, { useState } from 'react';
import { Transaction, TransactionStatus, TransactionType, SecurityAlert, User } from '../types';
import { Check, X, ShieldAlert, Search, Calendar, Landmark, Smartphone, History, ShieldX, UserX, Clock, ShieldCheck, Users, Mail, Key, Phone, CreditCard } from 'lucide-react';

interface AdminPanelProps {
  transactions: Transaction[];
  securityAlerts: SecurityAlert[];
  users: User[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ transactions, securityAlerts, users, onApprove, onReject }) => {
  const [activeTab, setActiveTab] = useState<'finance' | 'security' | 'users'>('finance');
  const pendingTransactions = transactions.filter(t => t.status === TransactionStatus.PENDING);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center border border-rose-500/20">
                <ShieldAlert className="text-rose-500 w-7 h-7" />
             </div>
             <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Command Center</h1>
          </div>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest ml-1">Platform Integrity Oversight</p>
        </div>
        
        <div className="flex p-1 bg-black/40 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
           <button 
             onClick={() => setActiveTab('finance')}
             className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${activeTab === 'finance' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
           >
             <History className="w-4 h-4" /> Finance
           </button>
           <button 
             onClick={() => setActiveTab('users')}
             className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${activeTab === 'users' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
           >
             <Users className="w-4 h-4" /> Users
           </button>
           <button 
             onClick={() => setActiveTab('security')}
             className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${activeTab === 'security' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
           >
             <ShieldX className="w-4 h-4" /> Security {securityAlerts.length > 0 && <span className="bg-white text-rose-600 px-1.5 py-0.5 rounded-full text-[8px]">{securityAlerts.length}</span>}
           </button>
        </div>
      </header>

      {activeTab === 'finance' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            <div className="glass border-white/5 rounded-3xl p-6">
               <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Queue Size</p>
               <p className="text-3xl font-black text-white">{pendingTransactions.length}</p>
            </div>
            <div className="glass border-emerald-500/10 rounded-3xl p-6">
               <p className="text-emerald-500/50 text-[10px] font-black uppercase tracking-widest mb-1">Total Deposits</p>
               <p className="text-3xl font-black text-emerald-500">৳{transactions.filter(t => t.type === TransactionType.DEPOSIT && t.status === TransactionStatus.APPROVED).reduce((a,b) => a + b.amount, 0).toLocaleString()}</p>
            </div>
            <div className="glass border-rose-500/10 rounded-3xl p-6">
               <p className="text-rose-500/50 text-[10px] font-black uppercase tracking-widest mb-1">Total Payouts</p>
               <p className="text-3xl font-black text-rose-500">৳{transactions.filter(t => t.type === TransactionType.WITHDRAW && t.status === TransactionStatus.APPROVED).reduce((a,b) => a + b.amount, 0).toLocaleString()}</p>
            </div>
          </div>

          <div className="glass rounded-[2.5rem] overflow-hidden border-white/5">
            <div className="hidden lg:grid grid-cols-12 bg-black/40 border-b border-white/5 px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
              <div className="col-span-3">Entity / Timestamp</div>
              <div className="col-span-2">Entry Type</div>
              <div className="col-span-2">Credit</div>
              <div className="col-span-3">Auth Key</div>
              <div className="col-span-2 text-right">Verification</div>
            </div>

            <div className="divide-y divide-white/5">
              {pendingTransactions.length === 0 ? (
                <div className="py-24 text-center">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Check className="w-8 h-8 text-slate-800" />
                  </div>
                  <p className="text-slate-600 font-black uppercase tracking-widest text-[10px]">Financial Queue Empty</p>
                </div>
              ) : (
                pendingTransactions.map(tx => (
                  <div key={tx.id} className="grid grid-cols-1 lg:grid-cols-12 px-8 py-6 gap-4 items-center hover:bg-white/5 transition-colors group">
                    <div className="lg:col-span-3 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                        <Smartphone className="w-6 h-6 text-slate-400" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-black text-white text-sm truncate uppercase tracking-tight">{tx.userId.split('-')[0]}..{tx.userId.slice(-4)}</p>
                        <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1.5 mt-0.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(tx.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="lg:col-span-2">
                      <div className="flex items-center gap-2">
                         <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase border ${tx.type === TransactionType.DEPOSIT ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
                           {tx.type}
                         </span>
                         <span className="text-[10px] font-black text-slate-500 uppercase">{tx.method}</span>
                      </div>
                    </div>

                    <div className="lg:col-span-2">
                      <span className="text-xl font-black text-white italic">৳{tx.amount.toLocaleString()}</span>
                    </div>

                    <div className="lg:col-span-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-[8px] text-slate-600 uppercase font-black tracking-widest">Digital Signature</span>
                        <code className="text-[10px] text-indigo-400 font-mono tracking-wider">{tx.txnId || tx.targetPhone}</code>
                      </div>
                    </div>

                    <div className="lg:col-span-2 flex items-center justify-end gap-3">
                      <button 
                        onClick={() => onReject(tx.id)}
                        className="w-10 h-10 rounded-xl bg-white/5 text-slate-400 hover:bg-rose-500/20 hover:text-rose-500 transition-all flex items-center justify-center border border-white/5"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => onApprove(tx.id)}
                        className="w-10 h-10 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
                 <div className="w-1.5 h-6 bg-emerald-600 rounded-full" />
                 User Database
              </h3>
              <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20 uppercase tracking-widest">
                {users.length} Profiles
              </span>
           </div>

           <div className="glass rounded-[2.5rem] border-white/5 overflow-hidden">
             <div className="divide-y divide-white/5">
                {users.map((user) => (
                  <div key={user.id} className="p-6 md:p-8 hover:bg-white/5 transition-all">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-start gap-5">
                         <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 shrink-0">
                            <UserX className="w-7 h-7 text-indigo-400" />
                         </div>
                         <div className="space-y-3">
                            <div>
                               <h4 className="text-lg font-black text-white uppercase tracking-tight leading-none mb-1">{user.name} {user.isAdmin && <span className="text-amber-500 text-[10px] ml-2">(ADMIN)</span>}</h4>
                               <div className="flex items-center gap-2 text-slate-500">
                                  <Mail className="w-3.5 h-3.5" />
                                  <span className="text-xs font-bold">{user.email}</span>
                               </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                               <div className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-xl border border-white/5">
                                  <Key className="w-3.5 h-3.5 text-rose-500" />
                                  <span className="text-[10px] text-slate-300 font-black uppercase tracking-widest">Pass:</span>
                                  <code className="text-xs text-white font-mono">{user.password || 'N/A'}</code>
                               </div>
                               <div className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-xl border border-white/5">
                                  <Phone className="w-3.5 h-3.5 text-indigo-500" />
                                  <span className="text-[10px] text-slate-300 font-black uppercase tracking-widest">Phone:</span>
                                  <span className="text-xs text-white font-bold">{user.phone || 'N/A'}</span>
                               </div>
                            </div>
                         </div>
                      </div>

                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2 border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                         <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Account Balance</p>
                         <div className="flex items-center gap-2">
                            <span className="text-2xl font-black text-emerald-500 italic">৳{user.balance.toLocaleString()}</span>
                         </div>
                         <div className="flex items-center gap-1 mt-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Active Profile</span>
                         </div>
                      </div>
                    </div>
                  </div>
                ))}
             </div>
           </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
          <div className="flex items-center justify-between px-2">
             <h3 className="text-xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
                <div className="w-1.5 h-6 bg-rose-600 rounded-full" />
                Intrusion Alerts
             </h3>
             <span className="text-[10px] font-black text-rose-500 bg-rose-500/10 px-4 py-1.5 rounded-full border border-rose-500/20 uppercase tracking-widest">
                {securityAlerts.length} Critical Events
             </span>
          </div>

          <div className="glass rounded-[2.5rem] border-rose-500/10 overflow-hidden">
            <div className="divide-y divide-white/5">
               {securityAlerts.length === 0 ? (
                 <div className="py-32 text-center">
                    <div className="w-20 h-20 bg-emerald-500/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/10">
                       <ShieldCheck className="w-10 h-10 text-emerald-500" />
                    </div>
                    <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">No Security Threats Detected</p>
                 </div>
               ) : (
                 securityAlerts.map(alert => (
                   <div key={alert.id} className="p-8 hover:bg-rose-500/5 transition-all group border-l-4 border-l-rose-600/0 hover:border-l-rose-600">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                         <div className="flex items-start gap-5">
                            <div className="w-14 h-14 bg-rose-600/10 rounded-2xl flex items-center justify-center shrink-0 border border-rose-600/20 group-hover:scale-110 transition-transform">
                               <UserX className="w-7 h-7 text-rose-500" />
                            </div>
                            <div className="space-y-1">
                               <div className="flex items-center gap-3">
                                  <h4 className="text-lg font-black text-white uppercase tracking-tight">{alert.email}</h4>
                                  <span className="bg-rose-600 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest">BANNED 30m</span>
                               </div>
                               <p className="text-xs text-rose-400 font-bold leading-relaxed">
                                  Suspicious activity: {alert.attempts} consecutive failed login attempts detected. 
                                  User ID has been temporarily blacklisted to prevent brute-force attacks.
                               </p>
                               <div className="flex items-center gap-4 pt-2">
                                  <div className="flex items-center gap-1.5 text-slate-500">
                                     <Clock className="w-3.5 h-3.5" />
                                     <span className="text-[10px] font-black uppercase">{new Date(alert.timestamp).toLocaleString()}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-slate-500">
                                     <ShieldAlert className="w-3.5 h-3.5" />
                                     <span className="text-[10px] font-black uppercase">IP Trace: SIM-PROX-{alert.id.slice(-4)}</span>
                                  </div>
                               </div>
                            </div>
                         </div>
                         <button className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest border border-white/5 transition-all shrink-0">
                            Clear Log
                         </button>
                      </div>
                   </div>
                 ))
               )}
            </div>
          </div>
          
          <div className="bg-amber-500/5 border border-amber-500/20 p-6 rounded-[2rem] flex items-start gap-4">
             <ShieldAlert className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
             <div className="space-y-1">
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Security Protocol Note</p>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                   All locked accounts are automatically released after 30 minutes. 
                   As an admin, you can manually override blocks in the "Users" management tab.
                </p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
