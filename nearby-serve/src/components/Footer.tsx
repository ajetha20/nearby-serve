import React from 'react';
import { UserRole } from '../types';
import { Utensils, Heart, ShieldCheck, Mail, Phone, MapPin, Github, Twitter, Instagram, ArrowRight } from 'lucide-react';

interface FooterProps {
  onRoleSelect: (role: UserRole) => void;
  onNavigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onRoleSelect, onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <div className="flex items-center gap-2 text-white mb-4">
              <div className="bg-orange-600 p-2 rounded-lg">
                <Utensils className="h-6 w-6" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight">Anna<span className="text-orange-500">Daan</span></span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              We are a community-driven platform connecting generous hearts with empty stomachs. 
              Our mission is to eliminate hunger in our neighborhoods through hyper-local, 
              verified donation requests.
            </p>
            <div className="flex gap-4 pt-2">
              <SocialIcon icon={<Twitter className="w-4 h-4" />} />
              <SocialIcon icon={<Instagram className="w-4 h-4" />} />
              <SocialIcon icon={<Github className="w-4 h-4" />} />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li><button onClick={() => onNavigate('home')} className="hover:text-orange-500 transition-colors">Home</button></li>
              <li><button onClick={() => onNavigate('history')} className="hover:text-orange-500 transition-colors">My Donations</button></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Safety Guidelines</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Contact Us</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-orange-500" />
                <span>kasamajetha35@gmail.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-orange-500" />
                <span>+91 7569570664</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-500" />
                <span>Hyderabad, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} AnnaDaan Foundation. All rights reserved. Seva Parmo Dharma.
          </p>
          
          {/* Role Switchers - Moved Here */}
          <div className="flex items-center gap-4 bg-slate-800/50 p-2 rounded-full border border-slate-700">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2">Login as:</span>
            <button 
              onClick={() => onRoleSelect(UserRole.VOLUNTEER)} 
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors px-2 py-1 hover:bg-emerald-900/30 rounded"
            >
              Volunteer
            </button>
            <div className="w-px h-3 bg-slate-700"></div>
            <button 
              onClick={() => onRoleSelect(UserRole.ADMIN)} 
              className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors px-2 py-1 hover:bg-blue-900/30 rounded"
            >
              Admin
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

const SocialIcon = ({ icon }: { icon: React.ReactNode }) => (
  <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-orange-600 hover:text-white transition-all">
    {icon}
  </a>
);