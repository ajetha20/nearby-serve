import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { ArrowRight, LogIn, Lock, Mail, ChevronLeft, Shield, HeartHandshake, User, Smartphone, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { storageService } from '../services/storage';

interface LoginPageProps {
  onLogin: (profile: UserProfile) => void;
  targetRole?: UserRole; // To know if we are logging in as Admin/Volunteer
  onBack: () => void;
}

type AuthMode = 'login' | 'register' | 'forgot';

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, targetRole = UserRole.DONOR, onBack }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [shake, setShake] = useState(0);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // Basic Validation
    if (!formData.email.includes('@')) {
        setError("Please enter a valid email address.");
        setShake(prev => prev + 1);
        return;
    }

    if (mode === 'register' && (!formData.name || !formData.password)) {
        setError("All fields are required.");
        setShake(prev => prev + 1);
        return;
    }

    setIsLoading(true);

    // Fake network delay for realism
    setTimeout(() => {
      try {
        if (mode === 'register') {
           // Only Donors can self-register
           if (targetRole !== UserRole.DONOR) {
             throw new Error("Volunteers and Admins must be added by an administrator.");
           }

           const newUser = storageService.registerUser({
             id: `user_${Date.now()}`,
             name: formData.name,
             email: formData.email,
             password: formData.password,
             role: UserRole.DONOR
           });
           
           setSuccessMsg("Account created! Logging you in...");
           setTimeout(() => {
             onLogin({ ...newUser, isLoggedIn: true });
           }, 1000);
        } 
        else if (mode === 'login') {
           const user = storageService.loginUser(formData.email, formData.password);
           
           if (!user) {
             throw new Error("Invalid email or password.");
           }

           if (user.role !== targetRole) {
             throw new Error(`This account is not authorized for ${targetRole} access.`);
           }

           onLogin(user);
        }
        else if (mode === 'forgot') {
            setSuccessMsg("Reset link sent (simulation).");
            setTimeout(() => setMode('login'), 2000);
        }
      } catch (err: any) {
        setError(err.message);
        setShake(prev => prev + 1);
      } finally {
        setIsLoading(false);
      }
    }, 800);
  };

  const getRoleTheme = () => {
    switch (targetRole) {
      case UserRole.ADMIN:
        return {
          title: 'Admin Console',
          color: 'bg-slate-900',
          hover: 'hover:bg-slate-800',
          ring: 'focus:ring-slate-900',
          text: 'text-slate-900',
          icon: Shield,
          desc: 'Restricted access for platform administrators.',
          gradient: 'from-slate-800 to-slate-950'
        };
      case UserRole.VOLUNTEER:
        return {
          title: 'Volunteer Portal',
          color: 'bg-emerald-600',
          hover: 'hover:bg-emerald-700',
          ring: 'focus:ring-emerald-500',
          text: 'text-emerald-600',
          icon: HeartHandshake,
          desc: 'Log in to accept deliveries and update maps.',
          gradient: 'from-emerald-600 to-teal-700'
        };
      default:
        return {
          title: 'Donor Login',
          color: 'bg-orange-600',
          hover: 'hover:bg-orange-700',
          ring: 'focus:ring-orange-500',
          text: 'text-orange-600',
          icon: LogIn,
          desc: 'Welcome back, changemaker.',
          gradient: 'from-orange-500 to-red-600'
        };
    }
  };

  const theme = getRoleTheme();

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-[#FDFBF7]">
      
      {/* Left Abstract Visuals - Desktop */}
      <div className={`hidden lg:flex w-1/2 relative items-center justify-center overflow-hidden bg-slate-900 transition-colors duration-500`}>
         <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
         <div className={`absolute top-[-20%] right-[-20%] w-[800px] h-[800px] bg-gradient-to-br ${theme.gradient} rounded-full blur-[120px] opacity-40 animate-blob`}></div>
         <div className="absolute bottom-[-20%] left-[-20%] w-[800px] h-[800px] bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full blur-[120px] opacity-30 animate-blob animation-delay-2000"></div>
         
         <div className="relative z-10 max-w-lg text-left p-12">
            <motion.div
              key={targetRole}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="inline-block p-3 rounded-2xl bg-white/10 backdrop-blur-md mb-6 border border-white/10 shadow-xl">
                <theme.icon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-5xl font-black text-white mb-6 leading-tight">
                {targetRole === UserRole.DONOR ? "Feed a Soul Today." : "Power the Network."}
              </h2>
              <p className="text-slate-300 text-xl leading-relaxed">
                {targetRole === UserRole.DONOR 
                  ? "Join thousands of donors ensuring no one sleeps hungry in your city."
                  : "Your time and effort bridge the gap between surplus and scarcity."}
              </p>
              
              {targetRole === UserRole.VOLUNTEER && (
                <div className="mt-8 bg-white/10 backdrop-blur border border-white/20 p-4 rounded-xl text-sm text-slate-200">
                  <p className="font-bold mb-1">Demo Access:</p>
                  <p>Email: <span className="font-mono bg-black/20 px-1 rounded">vikram@annadaan.org</span></p>
                  <p>Pass: <span className="font-mono bg-black/20 px-1 rounded">123</span></p>
                </div>
              )}
              {targetRole === UserRole.ADMIN && (
                <div className="mt-8 bg-white/10 backdrop-blur border border-white/20 p-4 rounded-xl text-sm text-slate-200">
                  <p className="font-bold mb-1">Demo Access:</p>
                  <p>Email: <span className="font-mono bg-black/20 px-1 rounded">admin@annadaan.org</span></p>
                  <p>Pass: <span className="font-mono bg-black/20 px-1 rounded">admin</span></p>
                </div>
              )}
            </motion.div>
         </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative">
         <motion.div 
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.5 }}
           className="w-full max-w-md relative z-10"
         >
            <button 
              onClick={onBack}
              className="flex items-center text-xs font-bold text-slate-400 hover:text-slate-900 mb-8 transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center mr-3 group-hover:border-slate-400 transition-colors shadow-sm">
                <ChevronLeft className="w-4 h-4" />
              </div>
              Back to Home
            </button>

            <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white/60 p-8 sm:p-10 relative overflow-hidden">
               <div className={`absolute top-0 left-0 w-full h-1.5 ${theme.color}`}></div>

               <div className="mb-8">
                  <h1 className="text-3xl font-black text-slate-900 mb-2">
                    {mode === 'register' ? 'Create Account' : mode === 'forgot' ? 'Reset Password' : theme.title}
                  </h1>
                  <p className="text-slate-500 font-medium">
                    {mode === 'register' ? 'Join the community to feed the hungry.' : mode === 'forgot' ? 'Enter email to receive a reset link.' : theme.desc}
                  </p>
               </div>

               <form onSubmit={handleSubmit} className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {mode === 'register' && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        className="space-y-4 overflow-hidden"
                      >
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
                                <input 
                                type="text" 
                                value={formData.name}
                                onChange={e => handleInputChange('name', e.target.value)}
                                className={`w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-12 focus:ring-2 ${theme.ring} focus:border-transparent outline-none transition-all font-semibold text-slate-900`}
                                placeholder="John Doe"
                                />
                            </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <div className="space-y-4 mt-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                        <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
                        <input 
                            type="email" 
                            value={formData.email}
                            onChange={e => handleInputChange('email', e.target.value)}
                            className={`w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-12 focus:ring-2 ${theme.ring} focus:border-transparent outline-none transition-all font-semibold text-slate-900 ${error ? 'border-red-300 bg-red-50' : ''}`}
                            placeholder="user@example.com"
                            required
                        />
                        </div>
                    </div>

                    {(mode === 'login' || mode === 'register') && (
                      <motion.div className="space-y-1.5">
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
                            {mode === 'login' && (
                                <button 
                                    type="button" 
                                    onClick={() => { setMode('forgot'); setError(null); }} 
                                    className={`text-[10px] font-bold ${theme.text} hover:underline`}
                                >
                                    Forgot?
                                </button>
                            )}
                        </div>
                        <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
                        <input 
                            type="password" 
                            value={formData.password}
                            onChange={e => handleInputChange('password', e.target.value)}
                            className={`w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-12 focus:ring-2 ${theme.ring} focus:border-transparent outline-none transition-all font-semibold text-slate-900`}
                            placeholder="••••••••"
                            required
                        />
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <AnimatePresence>
                    {error && (
                        <motion.div 
                           initial={{ opacity: 0, y: -10 }} 
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0 }}
                           className="flex items-center gap-2 text-xs font-bold text-red-500 bg-red-50 p-3 rounded-lg border border-red-100"
                        >
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </motion.div>
                    )}
                    {successMsg && (
                        <motion.div 
                           initial={{ opacity: 0, y: -10 }} 
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0 }}
                           className="flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 p-3 rounded-lg border border-green-100"
                        >
                            <CheckCircle className="w-4 h-4 flex-shrink-0" />
                            {successMsg}
                        </motion.div>
                    )}
                  </AnimatePresence>

                  <button 
                    type="submit"
                    disabled={isLoading}
                    className={`w-full ${theme.color} ${theme.hover} text-white py-4 rounded-xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-slate-900/10 flex justify-center items-center mt-6`}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <>
                        {mode === 'register' ? 'Create Account' : mode === 'forgot' ? 'Send Reset Link' : 'Sign In'} 
                        {mode !== 'forgot' ? <ArrowRight className="w-4 h-4 ml-2" /> : <Send className="w-4 h-4 ml-2" />}
                      </>
                    )}
                  </button>
               </form>

               {targetRole === UserRole.DONOR && (
                  <div className="mt-8 text-center pt-6 border-t border-slate-100">
                    {mode === 'forgot' ? (
                        <button 
                            onClick={() => { setMode('login'); setError(null); }}
                            className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
                        >
                            Back to <span className="text-orange-600">Login</span>
                        </button>
                    ) : (
                        <button 
                            onClick={() => {
                                setMode(mode === 'login' ? 'register' : 'login');
                                setError(null);
                                setFormData({ name: '', email: '', password: '', phone: '' });
                            }}
                            className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
                        >
                            {mode === 'register' ? (
                                <>Already have an account? <span className="text-orange-600">Login</span></>
                            ) : (
                                <>New to AnnaDaan? <span className="text-orange-600">Create Account</span></>
                            )}
                        </button>
                    )}
                  </div>
               )}
            </div>
         </motion.div>
      </div>
    </div>
  );
};