import React, { useState } from 'react';
import { User, SecurityAlert } from '../types.ts';
import { INITIAL_COINS } from '../constants.ts';
import { Trophy, Mail, Lock, User as UserIcon, Phone, ArrowRight, AlertCircle } from 'lucide-react';

interface AuthProps {
  users: User[];
  onLogin: (user: User) => void;
  onRegister: (user: User) => void;
  onSecurityAlert: (alert: Omit<SecurityAlert, 'id'>) => void;
}

const Auth: React.FC<AuthProps> = ({ users, onLogin, onRegister, onSecurityAlert }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      // Login Logic
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      if (user) {
        onLogin(user);
      } else {
        setError('Invalid credentials');
      }
    } else {
      // Sign-up Logic
      if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        setError('Email already exists');
        return;
      }
      const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        email: email.toLowerCase(),
        password,
        balance: INITIAL_COINS,
        isAdmin: false,
        phone: phone
      };
      onRegister(newUser);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-4">
      <div className="w-full max-w-md glass p-8 rounded-[2.5rem] border-white/10">
        <div className="text-center mb-8">
          <Trophy className="mx-auto text-indigo-500 w-12 h-12 mb-4"/>
          <h2 className="text-2xl font-black uppercase italic">ProPlay Auth</h2>
        </div>

        <div className="flex gap-2 mb-8 bg-black/40 p-1 rounded-xl">
          <button onClick={() => setIsLogin(true)} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase ${isLogin ? 'bg-indigo-600' : 'text-slate-500'}`}>Login</button>
          <button onClick={() => setIsLogin(false)} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase ${!isLogin ? 'bg-indigo-600' : 'text-slate-500'}`}>Register</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <input type="text" placeholder="Full Name" className="w-full bg-black/20 border border-white/5 p-4 rounded-xl" value={name} onChange={e => setName(e.target.value)} required />
              <input type="tel" placeholder="Phone Number" className="w-full bg-black/20 border border-white/5 p-4 rounded-xl" value={phone} onChange={e => setPhone(e.target.value)} required />
            </>
          )}
          <input type="email" placeholder="Email" className="w-full bg-black/20 border border-white/5 p-4 rounded-xl" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" className="w-full bg-black/20 border border-white/5 p-4 rounded-xl" value={password} onChange={e => setPassword(e.target.value)} required />
          
          {error && <p className="text-rose-500 text-xs font-bold">{error}</p>}
          
          <button type="submit" className="w-full bg-indigo-600 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-indigo-500 transition-all">
            {isLogin ? 'Authenticate' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;