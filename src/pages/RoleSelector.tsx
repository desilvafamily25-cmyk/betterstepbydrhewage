import { useNavigate } from 'react-router-dom';
import { APP_CONFIG } from '../config';
import type { AppRole } from '../types';
import { User, Stethoscope, ShieldCheck } from 'lucide-react';

interface RoleSelectorProps {
  onSelect: (role: AppRole) => void;
}

export function RoleSelector({ onSelect }: RoleSelectorProps) {
  const navigate = useNavigate();

  const select = (role: 'patient' | 'clinician') => {
    onSelect(role);
    navigate(role === 'patient' ? '/patient/home' : '/clinician/dashboard');
  };

  return (
    <div className="min-h-dvh bg-gradient-to-br from-[#102D26] via-[#0F6D6D] to-[#0F6D6D] flex flex-col">
      {/* Logo area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Brand mark */}
        <div className="mb-6 flex flex-col items-center rounded-2xl bg-white px-7 py-5 shadow-xl shadow-black/20">
          <img src="/betterstep-brand-logo.png" alt="BetterStep" className="h-36 w-36 object-contain" />
          <p className="font-['Playfair_Display'] text-4xl font-bold leading-none text-[#123B34]">BetterStep</p>
          <p className="text-base font-semibold text-[#B8735E]">by Dr. Hewage</p>
        </div>
        <p className="text-white/50 text-sm mt-3 text-center leading-relaxed max-w-xs">
          GP-supervised weight management companion
        </p>

        {/* Divider */}
        <div className="mt-10 mb-8 w-16 h-0.5 bg-white/20 rounded-full" />

        <p className="text-white/80 text-sm font-semibold uppercase tracking-widest mb-6">
          Who are you?
        </p>

        <div className="w-full max-w-sm space-y-3">
          {/* Patient button */}
          <button
            onClick={() => select('patient')}
            className="w-full flex items-center gap-5 bg-white rounded-2xl px-6 py-5 text-left shadow-lg hover:shadow-xl hover:bg-[#F6F3EE] transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#1B3D34]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#1B3D34]/20">
              <User size={22} className="text-[#1B3D34]" />
            </div>
            <div>
              <p className="text-base font-bold text-[#1B3D34]">I am a patient</p>
              <p className="text-xs text-[#747B7D] mt-0.5">Track progress, manage medication, prepare for your GP</p>
            </div>
          </button>

          {/* Clinician button */}
          <button
            onClick={() => select('clinician')}
            className="w-full flex items-center gap-5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-5 text-left hover:bg-white/20 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <Stethoscope size={22} className="text-white" />
            </div>
            <div>
              <p className="text-base font-bold text-white">I am a clinician</p>
              <p className="text-xs text-white/60 mt-0.5">Review patients, manage flags, generate consult notes</p>
            </div>
          </button>
        </div>

        {/* Demo note */}
        <div className="mt-6 flex items-center gap-2 bg-white/5 rounded-xl px-4 py-2.5">
          <ShieldCheck size={14} className="text-white/50" />
          <p className="text-xs text-white/50">Demo mode — using sample patient data</p>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-10 text-center">
        <p className="text-white/30 text-xs leading-relaxed">
          {APP_CONFIG.appName} — GP-supervised weight management support.
        </p>
        <p className="text-white/20 text-[10px] mt-1 leading-relaxed max-w-xs mx-auto">
          {APP_CONFIG.disclaimer}
        </p>
      </div>
    </div>
  );
}
