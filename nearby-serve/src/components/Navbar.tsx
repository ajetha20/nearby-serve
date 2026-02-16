import React, { useState, useRef, useEffect } from 'react';
import { UserRole, UserProfile } from '../types';
import { LogOut, Utensils, History, User, LogIn, ChevronDown, Settings, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  currentRole: UserRole;
  userProfile: UserProfile;
  onRoleChange: (role: UserRole) => void;
  onLogout: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRole, userProfile, onLogout, onNavigate, currentPage, onRoleChange }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <motion.div 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-[2000] px-4 sm:px-6 transition-all duration-300 ${scrolled ? 'pt-4' : 'pt-6'}`}
    >
      <div className={`max-w-6xl mx-auto rounded-full transition-all duration-300 ${scrolled ? 'bg-white/90 shadow-lg shadow-slate-200/50 backdrop-blur-xl border border-white/50 py-3' : 'bg-transparent py-4'}`}>
        <div className="px-6 flex justify-between items-center">
          
          {/* Logo */}
          <div className="flex items-center cursor-pointer group" onClick={() => onNavigate('home')}>
            <div className="relative mr-3">
              <div className="absolute inset-0 bg-orange-500 blur-lg opacity-30 group-hover:opacity-50 transition-opacity rounded-full"></div>
              <div className="relative bg-gradient-to-br from-orange-500 to-red-600 p-2 rounded-xl shadow-lg shadow-orange-500/30 group-hover:scale-105 transition-transform duration-300">
                <Utensils className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className={`font-extrabold text-xl tracking-tight leading-none ${scrolled ? 'text-slate-900' : 'text-slate-900'}`}>
                Anna<span className="text-orange-600">Daan</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">India's Food Network</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Non-Donor Mode Indicator */}
            {currentRole !== UserRole.DONOR && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center bg-slate-900 text-white rounded-full pl-4 pr-1.5 py-1 shadow-xl mr-2 border border-slate-700"
              >
                <span className="text-xs font-bold mr-3 uppercase tracking-wider flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]"></span>
                  {currentRole}
                </span>
                <button 
                  onClick={() => onRoleChange(UserRole.DONOR)}
                  className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-slate-300 hover:text-white"
                  title="Exit Mode"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            )}

            {/* User Navigation */}
            {userProfile.isLoggedIn ? (
              <div className="flex items-center gap-2" ref={dropdownRef}>
                
                {/* Donor Specific: My Donations Link */}
                {currentRole === UserRole.DONOR && (
                  <button 
                    onClick={() => onNavigate('history')}
                    className={`hidden sm:flex px-4 py-2 text-sm font-bold rounded-full transition-all items-center gap-2 ${currentPage === 'history' ? 'bg-orange-50 text-orange-700 shadow-inner' : 'text-slate-600 hover:bg-slate-100/50'}`}
                  >
                    <History className="h-4 w-4" />
                    My Donations
                  </button>
                )}
                
                {/* User Profile Dropdown */}
                <div className="relative ml-2">
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`flex items-center gap-2 p-1 pl-2 pr-2 sm:pr-4 rounded-full transition-all focus:outline-none group ${isDropdownOpen ? 'bg-slate-100' : 'hover:bg-slate-100/50'}`}
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-slate-800 to-slate-950 rounded-full flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white">
                       {userProfile.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none group-hover:text-orange-600 transition-colors">Account</div>
                      <div className="text-sm font-bold text-slate-900 leading-none mt-0.5 truncate max-w-[100px]">{userProfile.name.split(' ')[0]}</div>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-slate-200/50 border border-white/20 overflow-hidden z-[2001]"
                      >
                         {/* User Info Header */}
                         <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                           <p className="text-slate-900 font-bold text-lg truncate">{userProfile.name}</p>
                           <p className="text-slate-500 text-xs truncate font-medium">{userProfile.email || 'user@annadaan.org'}</p>
                           {currentRole !== UserRole.DONOR && (
                             <span className="inline-block mt-2 px-2 py-1 bg-slate-200 text-slate-700 text-[10px] font-bold rounded uppercase tracking-wider">
                               {currentRole} Access
                             </span>
                           )}
                         </div>

                         {/* Menu Items */}
                         <div className="p-2 space-y-0.5">
                           <button className="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl flex items-center gap-3 transition-colors">
                             <User className="w-4 h-4 text-slate-400" />
                             Profile
                           </button>
                           <button className="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl flex items-center gap-3 transition-colors">
                             <Settings className="w-4 h-4 text-slate-400" />
                             Settings
                           </button>
                           {currentRole === UserRole.DONOR && (
                              <button className="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl flex items-center gap-3 transition-colors">
                                <CreditCard className="w-4 h-4 text-slate-400" />
                                Payment Methods
                              </button>
                           )}
                         </div>

                         {/* Logout */}
                         <div className="p-2 border-t border-slate-100">
                           <button 
                             onClick={() => {
                               onLogout();
                               setIsDropdownOpen(false);
                             }}
                             className="w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-3 transition-colors"
                           >
                             <LogOut className="w-4 h-4" />
                             Sign Out
                           </button>
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              // Login Button for Guests
              <button 
                onClick={() => onNavigate('login')}
                className="bg-slate-900 text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-xl shadow-slate-900/20 hover:bg-slate-800 hover:shadow-2xl hover:scale-105 transition-all flex items-center"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Login / Join
              </button>
            )}

          </div>
        </div>
      </div>
    </motion.div>
  );
};