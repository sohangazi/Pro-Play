
import React, { useState, useEffect } from 'react';
import { User, SecurityAlert } from '../types.ts';
import { INITIAL_COINS } from '../constants.ts';
import { Trophy, Mail, Lock, User as UserIcon, Phone, ArrowRight, AlertCircle, ShieldAlert } from 'lucide-react';

interface AuthProps {
  users: User[];
  onLogin: (user: User) => void;
  onRegister: (user: User) => void;
  onSecurityAlert: (alert: Omit<SecurityAlert, 'id'>) => void;
}

const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION = 30 * 60 * 1000;

const Auth: React.FC<AuthProps> = ({ users, onLogin, onRegister, onSecurityAlert }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const savedLockout = localStorage.getItem('proplay_lockout_until');
    if (savedLockout) {
      const until = parseInt(savedLockout);
      if (Date.now() < until) setLockoutTime(until);
    }
  }, []);

  useEffect(() => {
    if (!lockoutTime) return;
    const timer = setInterval(() => {
      const remaining = lockoutTime - Date.now();
      if (remaining <= 0) {
        setLockoutTime(null);
        localStorage.removeItem('proplay_lockout_until');
        clearInterval(timer);
      } else {
        const mins = Math.floor(remaining / 60000);
        const secs = Math.floor((remaining % 60000) / 1000);
        setTimeLeft(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutTime]);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTime) return;
    setError('');

    if (isLogin) {
      // Admin bypass check (hardcoded as requested)
      if (email === 'gazisohan37@gmail.com' && password === 'S1811890995g') {
        const admin = users.find((u: User) => u.isAdmin);
        if (admin) {
          localStorage.removeItem('proplay_failed_attempts');
          onLogin(admin);
          return;
        }
      }

      // Normal user check using centralized 'users' prop
      const user = users.find((u: User) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      if (user) {
        localStorage.removeItem('proplay_failed_attempts');
        onLogin(user);
      } else {
        handleFailedAttempt();
      }
    } else {
      // Sign up logic
      if (!name || !email || !password || !phoneNumber) {
        setError('Please fill in all fields');
        return;
      }
      if (users.find((u: User) => u.email.toLowerCase() === email.toLowerCase())) {
        setError('Email already registered');
        return;
      }
      
      const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        email: email.toLowerCase(),
        password,
        balance: INITIAL_COINS,
        isAdmin: false,
        phone: phoneNumber
      };

      localStorage.removeItem('proplay_failed_attempts');
      onRegister(newUser);
    }
  };

  const handleFailedAttempt = () => {
    const attempts = parseInt(localStorage.getItem('proplay_failed_attempts') || '0') + 1;
    localStorage.setItem('proplay_failed_attempts', attempts.toString());

    if (attempts >= MAX_ATTEMPTS) {
      const until = Date.now() + LOCKOUT_DURATION;
      setLockoutTime(until);
      localStorage.setItem('proplay_lockout_until', until.toString());
      onSecurityAlert({ email: email || 'Anonymous', timestamp: Date.now(), attempts, status: 'LOCKED' });
      setError(`Too many failed attempts. Locked for 30m.`);
    } else {
      setError(`Invalid credentials. Attempt ${attempts}/${MAX_ATTEMPTS}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/20 rounded-full blur-[120px]" />
      
      <div className="w-full max-w-md z-10 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-2xl mb-4 rotate-3">
            <Trophy className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-1">PROPLAY</h1>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em]">Gaming Identity</p>
        </div>

        <div className="glass p-8 rounded-[2.5rem] border-white/10 relative">
          {lockoutTime ? (
            <div className="text-center py-8 space-y-6 animate-in zoom-in duration-300">
              <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
                <AlertCircle className="w-10 h-10 text-rose-500" />
              </div>
              <h2 className="text-xl font-black text-white uppercase italic">Account Locked</h2>
              <div className="text-4xl font-black text-rose-500 font-mono tracking-widest bg-rose-500/5 py-4 rounded-2xl border border-rose-500/10">
                {timeLeft}
              </div>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Wait for the timer or contact admin</p>
            </div>
          ) : (
            <>
              <div className="flex gap-2 p-1 bg-black/40 rounded-2xl mb-8 border border-white/5">
                <button onClick={() => {setIsLogin(true); setError('');}} className={`flex-1 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${isLogin ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>Login</button>
                <button onClick={() => {setIsLogin(false); setError('');}} className={`flex-1 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${!isLogin ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>Sign Up</button>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {!isLogin && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                      <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                        <input type="text" placeholder="Your Name" className="w-full bg-[#020617] border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-indigo-500/50" value={name} onChange={(e) => setName(e.target.value)} required={!isLogin} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                        <input type="tel" placeholder="01XXXXXXXXX" className="w-full bg-[#020617] border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-indigo-500/50" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required={!isLogin} />
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Identity (Email)</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input type="email" placeholder="name@example.com" className="w-full bg-[#020617] border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-indigo-500/50" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Secret Key (Password)</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input type="password" placeholder="••••••••" className="w-full bg-[#020617] border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-indigo-500/50" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                </div>

                {error && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-bold py-3 px-4 rounded-xl flex items-center gap-2 animate-shake"><AlertCircle className="w-3.5 h-3.5" />{error}</div>}

                <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 mt-4">
                  {isLogin ? 'Authenticate' : 'Create Account'} <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
           <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
              <ShieldAlert className="w-3 h-3 text-indigo-400" />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Secure Entry Protocol Active</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
