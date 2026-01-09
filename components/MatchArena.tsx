
import React, { useState } from 'react';
import { Match, MatchStatus, User, Game } from '../types';
import { MOCK_GAMES } from '../constants';
import { generateMatchCommentary } from '../services/geminiService';
import { Sword, Users, Timer, Sparkles, MessageSquareQuote, Trophy, Gamepad2, Plus, ArrowLeft, Zap, Flame, User as UserIcon } from 'lucide-react';

interface MatchArenaProps {
  matches: Match[];
  currentUser: User;
  selectedGame: Game | null;
  onSelectGame: (game: Game | null) => void;
  onJoin: (fee: number, title?: string, gameId?: string) => void;
  onComplete: (matchId: string, winnerId: string, commentary: string) => void;
}

const MatchArena: React.FC<MatchArenaProps> = ({ 
  matches, 
  currentUser, 
  selectedGame, 
  onSelectGame, 
  onJoin, 
  onComplete 
}) => {
  const [loadingMatchId, setLoadingMatchId] = useState<string | null>(null);
  const [showHostForm, setShowHostForm] = useState(false);
  const [hostData, setHostData] = useState({ title: '', fee: '50' });

  const simulateMatch = async (match: Match) => {
    setLoadingMatchId(match.id);
    await new Promise(r => setTimeout(r, 2000));

    const isP1Winner = Math.random() > 0.5;
    const winnerName = isP1Winner ? currentUser.name : 'Challenger Bot';
    const winnerId = isP1Winner ? currentUser.id : 'bot-1';

    const commentary = await generateMatchCommentary(currentUser.name, 'Challenger Bot', winnerName);
    onComplete(match.id, winnerId, commentary);
    setLoadingMatchId(null);
  };

  const handleHostMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostData.title || !hostData.fee) return;
    onJoin(parseFloat(hostData.fee), hostData.title, selectedGame?.id);
    setShowHostForm(false);
    setHostData({ title: '', fee: '50' });
  };

  if (!selectedGame) {
    return (
      <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <header className="space-y-2">
          <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none">
            Choose Your <span className="text-indigo-500">Battle</span>
          </h1>
          <p className="text-slate-400 font-medium text-base md:text-lg">Daily tournaments with high stakes and rewards.</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {MOCK_GAMES.map(game => (
            <button 
              key={game.id}
              onClick={() => onSelectGame(game)}
              className="group relative bg-slate-900/50 border border-white/5 rounded-3xl md:rounded-[2.5rem] overflow-hidden hover:border-indigo-500/50 transition-all transform hover:-translate-y-2"
            >
              <div className="h-40 md:h-56 overflow-hidden relative">
                <img src={game.image} alt={game.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-80" />
                
                <div className="absolute top-3 left-3">
                  <div className="bg-white/10 backdrop-blur-md px-2 py-0.5 md:px-3 md:py-1 rounded-full border border-white/10">
                    <span className="flex items-center gap-1.5 text-[9px] md:text-[10px] font-bold text-white uppercase">
                      <Zap className="w-2.5 h-2.5 md:w-3 md:h-3 text-amber-400 fill-amber-400" />
                      Instant Payout
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-5 md:p-6 relative">
                <div className="flex justify-between items-end mb-2">
                  <h3 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">{game.name}</h3>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-[#020617] bg-slate-800" />
                    ))}
                  </div>
                  <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest">+{game.activePlayers} Queuing</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const filteredMatches = matches.filter(m => m.gameId === selectedGame.id);

  return (
    <div className="space-y-6 md:space-y-8 animate-in slide-in-from-right-10 duration-700">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-indigo-600/5 border border-indigo-500/10 p-5 md:p-8 rounded-3xl md:rounded-[2.5rem]">
        <div className="flex items-center gap-4 md:gap-6">
           <button onClick={() => { onSelectGame(null); setShowHostForm(false); }} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl md:rounded-2xl transition-all text-slate-300">
              <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
           </button>
           <div>
              <div className="flex items-center gap-2 mb-1">
                 <Flame className="w-3 h-3 md:w-4 md:h-4 text-orange-500 fill-orange-500" />
                 <span className="text-[9px] md:text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Active Lobby</span>
              </div>
              <h1 className="text-2xl md:text-4xl font-black text-white italic tracking-tighter uppercase leading-none">{selectedGame.name}</h1>
           </div>
        </div>
        <div className="grid grid-cols-2 lg:flex gap-2 md:gap-3">
           <button 
             onClick={() => setShowHostForm(!showHostForm)}
             className="px-4 md:px-8 py-3 md:py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl md:rounded-2xl font-bold transition-all flex items-center justify-center gap-2 border border-white/10 text-xs md:text-base"
           >
             <Plus className="w-4 h-4 md:w-5 md:h-5" />
             HOST
           </button>
           <button 
             onClick={() => onJoin(100)}
             className="px-4 md:px-8 py-3 md:py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl md:rounded-2xl font-bold shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 text-xs md:text-base"
           >
             <Sword className="w-4 h-4 md:w-5 md:h-5" />
             JOIN
           </button>
        </div>
      </header>

      {showHostForm && (
        <form onSubmit={handleHostMatch} className="glass p-5 md:p-8 rounded-3xl md:rounded-[2.5rem] animate-in slide-in-from-top-6 duration-500 border-indigo-500/30">
          <div className="flex items-center gap-3 mb-6 md:mb-8">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-500/20 rounded-lg md:rounded-xl flex items-center justify-center">
              <Plus className="text-indigo-400 w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h3 className="text-xl md:text-2xl font-black text-white uppercase italic">Setup Tournament</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="space-y-2">
              <label className="block text-[9px] md:text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Lobby Name</label>
              <input 
                value={hostData.title}
                onChange={(e) => setHostData({...hostData, title: e.target.value})}
                placeholder="PRO NIGHT BATTLE" 
                className="w-full bg-[#020617] border border-white/5 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold placeholder:text-slate-700 text-sm" 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[9px] md:text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Entry Fee</label>
              <select 
                value={hostData.fee}
                onChange={(e) => setHostData({...hostData, fee: e.target.value})}
                className="w-full bg-[#020617] border border-white/5 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold appearance-none cursor-pointer text-sm"
              >
                <option value="50">৳50 (Prize Pool: ৳90)</option>
                <option value="100">৳100 (Prize Pool: ৳180)</option>
                <option value="500">৳500 (Prize Pool: ৳900)</option>
                <option value="1000">৳1000 (Prize Pool: ৳1800)</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end items-center gap-4 md:gap-6">
            <button type="button" onClick={() => setShowHostForm(false)} className="text-[10px] md:text-sm font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest">Cancel</button>
            <button type="submit" className="px-6 md:px-10 py-3 md:py-4 bg-indigo-600 text-white font-black rounded-xl md:rounded-2xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 uppercase tracking-widest text-xs md:text-sm">Upload Match</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
        {/* Active Matches Section */}
        <section className="lg:col-span-8 space-y-4 md:space-y-6">
           <div className="flex items-center justify-between px-2">
              <h2 className="flex items-center gap-3 text-lg md:text-xl font-black text-white uppercase italic tracking-tight">
                 <div className="w-1 h-5 md:h-6 bg-indigo-500 rounded-full" />
                 Open Lobbies
              </h2>
              <span className="text-[9px] md:text-[10px] font-bold text-slate-500 bg-white/5 px-3 py-1 rounded-full">
                {filteredMatches.filter(m => m.status !== MatchStatus.COMPLETED).length} ACTIVE
              </span>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {filteredMatches.filter(m => m.status !== MatchStatus.COMPLETED).length === 0 ? (
                <div className="md:col-span-2 bg-slate-900/20 border-2 border-dashed border-white/5 rounded-3xl md:rounded-[2.5rem] py-16 md:py-20 text-center">
                   <div className="w-16 h-16 md:w-20 md:h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                      <Gamepad2 className="w-8 h-8 md:w-10 md:h-10 text-slate-700" />
                   </div>
                   <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No Active Matches Found</p>
                </div>
              ) : (
                filteredMatches.filter(m => m.status !== MatchStatus.COMPLETED).map(match => (
                  <div key={match.id} className="group glass p-5 md:p-7 rounded-3xl md:rounded-[2.5rem] border-white/5 hover:border-indigo-500/30 transition-all transform hover:-translate-y-1">
                     <div className="flex justify-between items-start mb-5 md:mb-6">
                        <div className="overflow-hidden mr-2">
                          <h4 className="font-black text-base md:text-lg text-white group-hover:text-indigo-400 transition-colors uppercase leading-tight mb-1 truncate">{match.title}</h4>
                          <span className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ranked Match</span>
                        </div>
                        <div className="bg-indigo-600/10 text-indigo-400 px-2 py-1 md:px-3 md:py-1.5 rounded-xl border border-indigo-500/20 shrink-0">
                          <p className="text-[7px] md:text-[8px] font-black uppercase text-center leading-none mb-0.5">Prize</p>
                          <p className="text-xs md:text-sm font-black italic">৳{match.totalPool * 0.9}</p>
                        </div>
                     </div>

                     <div className="flex items-center justify-between gap-4 mb-6 md:mb-8 py-3 md:py-4 bg-white/5 rounded-2xl">
                        <div className="text-center flex-1">
                           <div className="w-10 h-10 md:w-14 md:h-14 bg-indigo-500/20 rounded-xl md:rounded-2xl mx-auto mb-1.5 flex items-center justify-center border border-indigo-500/30">
                              <UserIcon className="text-indigo-400 w-5 h-5 md:w-7 md:h-7" />
                           </div>
                           <p className="text-[8px] md:text-[10px] font-black text-white uppercase truncate px-1">{currentUser.name.split(' ')[0]}</p>
                        </div>
                        <div className="text-lg md:text-2xl font-black text-slate-800 italic">VS</div>
                        <div className="text-center flex-1">
                           <div className="w-10 h-10 md:w-14 md:h-14 bg-white/5 rounded-xl md:rounded-2xl mx-auto mb-1.5 flex items-center justify-center border border-white/5">
                              <Users className="text-slate-700 w-5 h-5 md:w-7 md:h-7" />
                           </div>
                           <p className="text-[8px] md:text-[10px] font-black text-slate-600 uppercase">BOT-X</p>
                        </div>
                     </div>

                     <button 
                        disabled={loadingMatchId === match.id}
                        onClick={() => simulateMatch(match)}
                        className={`w-full py-3 md:py-4 rounded-xl md:rounded-2xl font-black uppercase tracking-widest transition-all text-xs md:text-sm ${
                          loadingMatchId === match.id 
                            ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/20 active:scale-95'
                        }`}
                     >
                        {loadingMatchId === match.id ? (
                          <div className="flex items-center justify-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" />
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce delay-100" />
                          </div>
                        ) : 'Enter Arena'}
                     </button>
                  </div>
                ))
              )}
           </div>
        </section>

        {/* Results / History Section */}
        <section className="lg:col-span-4 space-y-4 md:space-y-6">
           <h2 className="flex items-center gap-3 text-lg md:text-xl font-black text-white uppercase italic tracking-tight px-2">
              <div className="w-1 h-5 md:h-6 bg-amber-500 rounded-full" />
              Recent Winnings
           </h2>
           <div className="space-y-4 max-h-[400px] md:max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredMatches.filter(m => m.status === MatchStatus.COMPLETED).length === 0 ? (
                <div className="text-center py-12 md:py-20 bg-white/5 rounded-3xl md:rounded-[2.5rem] border border-white/5">
                   <Trophy className="w-8 h-8 md:w-10 md:h-10 text-slate-800 mx-auto mb-4" />
                   <p className="text-slate-600 text-[10px] md:text-xs font-bold uppercase tracking-widest">No History</p>
                </div>
              ) : (
                filteredMatches.filter(m => m.status === MatchStatus.COMPLETED).map(match => (
                  <div key={match.id} className="bg-slate-900/40 border border-white/5 p-4 md:p-6 rounded-2xl md:rounded-[2rem] hover:bg-white/5 transition-all">
                     <div className="flex items-center justify-between mb-3 md:mb-4">
                        <div className="flex items-center gap-3 overflow-hidden">
                           <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center shrink-0 ${match.winnerId === currentUser.id ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                              <Trophy className="w-4 h-4 md:w-5 md:h-5" />
                           </div>
                           <div className="overflow-hidden">
                              <p className="text-[10px] md:text-xs font-black text-white uppercase leading-none mb-1 truncate">{match.title}</p>
                              <p className="text-[9px] md:text-[10px] font-medium text-slate-500">{new Date(match.createdAt).toLocaleDateString()}</p>
                           </div>
                        </div>
                        <div className="text-right shrink-0">
                           <p className={`text-sm md:text-base font-black italic ${match.winnerId === currentUser.id ? 'text-emerald-500' : 'text-slate-600'}`}>
                              {match.winnerId === currentUser.id ? `+৳${match.totalPool * 0.9}` : `-৳${match.entryFee}`}
                           </p>
                        </div>
                     </div>
                     {match.commentary && (
                       <div className="bg-[#020617] p-3 md:p-4 rounded-xl md:rounded-2xl border border-white/5">
                          <div className="flex items-start gap-2 md:gap-3">
                             <MessageSquareQuote className="w-3 h-3 md:w-4 md:h-4 text-indigo-500 shrink-0 mt-0.5" />
                             <p className="text-[10px] md:text-[11px] text-slate-400 leading-relaxed italic">"{match.commentary}"</p>
                          </div>
                       </div>
                     )}
                  </div>
                ))
              )}
           </div>
        </section>
      </div>
    </div>
  );
};

export default MatchArena;
