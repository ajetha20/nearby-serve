import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { ArrowRight, LogIn, Lock, Mail, ChevronLeft, Shield, HeartHandshake, User, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '../firebase';
import * as firebaseService from '../services/firebaseService';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

interface LoginPageProps {
  onLogin: (profile: UserProfile) => void;
  targetRole?: UserRole;
  onBack: () => void;
}

type AuthMode = 'login' | 'register' | 'forgot';

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, targetRole = UserRole.DONOR, onBack }) => {

  const [mode, setMode] = useState<AuthMode>('login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  // 🔥 FIREBASE LOGIN / REGISTER
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {

      // REGISTER
      if (mode === 'register') {

        if (targetRole !== UserRole.DONOR) {
          throw new Error("Only donors can self-register");
        }

        const cred = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

        const profile: UserProfile = {
          id: cred.user.uid,
          name: formData.name,
          email: formData.email,
          role: UserRole.DONOR,
          isLoggedIn: true
        };

        setSuccessMsg("Account created successfully!");
        setTimeout(() => onLogin(profile), 800);
      }

      // LOGIN
      else if (mode === 'login') {
        const cred = await signInWithEmailAndPassword(
  auth,
  formData.email,
  formData.password
);

// 🔥 get role from firestore
const userDoc = await firebaseService.getUserProfile(cred.user.uid);

if (!userDoc) throw new Error("User not registered in system");

const role = userDoc.role;

if (role !== targetRole) {
  throw new Error(`You are not registered as ${targetRole}`);
}

const profile: UserProfile = {
  id: cred.user.uid,
  name: userDoc.name,
  email: cred.user.email!,
  role,
  isLoggedIn: true
};

onLogin(profile);
      }


      // FORGOT
      else {
        setSuccessMsg("Password reset coming soon");
      }

    } catch (err: any) {
      setError(err.message.replace("Firebase:", ""));
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleTheme = () => {
    switch (targetRole) {
      case UserRole.ADMIN:
        return { title: 'Admin Login', color: 'bg-slate-900', icon: Shield };
      case UserRole.VOLUNTEER:
        return { title: 'Volunteer Login', color: 'bg-emerald-600', icon: HeartHandshake };
      default:
        return { title: 'Donor Login', color: 'bg-orange-600', icon: LogIn };
    }
  };

  const theme = getRoleTheme();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] p-6">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

        <button onClick={onBack} className="flex items-center text-sm mb-6 text-gray-500 hover:text-black">
          <ChevronLeft className="w-4 h-4 mr-1"/> Back
        </button>

        <h1 className="text-2xl font-bold mb-6">{theme.title}</h1>

        <form onSubmit={handleSubmit} className="space-y-4">

          {mode === 'register' && (
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-gray-400"/>
              <input
                type="text"
                placeholder="Full Name"
                className="w-full border rounded-lg p-3 pl-10"
                value={formData.name}
                onChange={e => handleInputChange('name', e.target.value)}
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400"/>
            <input
              type="email"
              placeholder="Email"
              className="w-full border rounded-lg p-3 pl-10"
              value={formData.email}
              onChange={e => handleInputChange('email', e.target.value)}
              required
            />
          </div>

          {mode !== 'forgot' && (
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400"/>
              <input
                type="password"
                placeholder="Password"
                className="w-full border rounded-lg p-3 pl-10"
                value={formData.password}
                onChange={e => handleInputChange('password', e.target.value)}
                required
              />
            </div>
          )}

          <AnimatePresence>
            {error && (
              <motion.div className="text-red-500 text-sm">{error}</motion.div>
            )}
            {successMsg && (
              <motion.div className="text-green-600 text-sm">{successMsg}</motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            className={`w-full ${theme.color} text-white py-3 rounded-lg font-semibold`}
            disabled={isLoading}
          >
            {isLoading ? "Please wait..." :
              mode === 'register' ? "Create Account" :
              mode === 'forgot' ? "Send Reset Link" :
              "Login"}
          </button>
        </form>

        {targetRole === UserRole.DONOR && (
          <div className="mt-6 text-center text-sm">
            {mode === 'login'
              ? <button onClick={()=>setMode('register')} className="text-orange-600">Create account</button>
              : <button onClick={()=>setMode('login')} className="text-orange-600">Back to login</button>
            }
          </div>
        )}

      </div>
    </div>
  );
};
