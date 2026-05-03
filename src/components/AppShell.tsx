import { type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { APP_CONFIG } from '../config';
import { signOut } from '../hooks/useAuth';
import { usePatientMessages } from '../hooks/usePatientMessages';
import clsx from 'clsx';
import {
  Home, ClipboardList, TrendingUp, Pill, Bell, BookOpen,
  FileText, Calendar, Users, Flag, FileCheck, Settings, ChevronLeft, LogOut, Mail, Calculator,
} from 'lucide-react';

interface AppShellProps {
  role: 'patient' | 'clinician';
  children: ReactNode;
  title?: string;
  showBack?: boolean;
}

const patientNav = [
  { to: '/patient/home', icon: Home, label: 'Home' },
  { to: '/patient/check-in', icon: ClipboardList, label: 'Log' },
  { to: '/patient/progress', icon: TrendingUp, label: 'Progress' },
  { to: '/patient/medication', icon: Pill, label: 'Medication' },
  { to: '/patient/reminders', icon: Bell, label: 'Reminders' },
];

const clinicianNav = [
  { to: '/clinician/dashboard', icon: Users, label: 'Patients' },
  { to: '/clinician/flags', icon: Flag, label: 'Flags' },
  { to: '/clinician/templates', icon: FileCheck, label: 'Notes' },
  { to: '/clinician/settings', icon: Settings, label: 'Settings' },
];

export function AppShell({ role, children, title, showBack }: AppShellProps) {
  const location = useLocation();
  const nav = role === 'patient' ? patientNav : clinicianNav;

  return (
    <div className="flex flex-col min-h-dvh bg-[#F6F3EE]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-[#E7E5E1] no-print">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          {showBack && (
            <button onClick={() => window.history.back()} className="p-1 rounded-lg text-[#3C4346] hover:text-[#1B3D34]">
              <ChevronLeft size={22} />
            </button>
          )}
          <div className="flex-1 min-w-0">
            {title ? (
              <h1 className="text-base font-semibold text-[#1B3D34] truncate">{title}</h1>
            ) : (
              <div className="flex items-center gap-2.5">
                <img
                  src="/betterstep-brand-logo.png"
                  alt="BetterStep"
                  className="h-11 w-11 flex-shrink-0 object-contain"
                />
                <div className="min-w-0">
                  <p className="font-['Playfair_Display'] text-lg font-bold leading-none text-[#123B34]">BetterStep</p>
                  <p className="text-xs font-semibold leading-tight text-[#B8735E]">by Dr. Hewage</p>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => signOut()}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#747B7D] hover:text-[#d64045] hover:bg-red-50 transition-colors"
            title="Sign out"
          >
            <LogOut size={17} />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-4 pb-24">
        {children}
      </main>

      {/* Footer disclaimer */}
      <div className="max-w-2xl mx-auto w-full px-4 pb-24 no-print">
        <p className="text-[10px] text-[#747B7D] text-center leading-relaxed">
          {APP_CONFIG.disclaimer}
        </p>
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E7E5E1] no-print">
        <div className="max-w-2xl mx-auto px-2 flex justify-around">
          {nav.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to || location.pathname.startsWith(to + '/');
            return (
              <Link
                key={to}
                to={to}
                className={clsx(
                  'flex flex-col items-center gap-0.5 py-2 px-3 min-w-[56px] rounded-xl transition-all',
                  active ? 'text-[#1B3D34]' : 'text-[#747B7D]'
                )}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                <span className={clsx('text-[10px] font-medium', active ? 'font-semibold' : '')}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

// Extra nav links for patient (shown in page or header)
export function PatientMoreLinks() {
  const location = useLocation();
  const { unreadCount } = usePatientMessages();
  const hasUnread = unreadCount > 0;

  const extras = [
    { to: '/patient/messages', icon: Mail, label: 'Messages' },
    { to: '/patient/tools', icon: Calculator, label: 'Tools' },
    { to: '/patient/education', icon: BookOpen, label: 'Education' },
    { to: '/patient/review-summary', icon: FileText, label: 'Summary' },
    { to: '/patient/book-review', icon: Calendar, label: 'Book' },
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {extras.map(({ to, icon: Icon, label }) => {
        const active = location.pathname === to;
        const isMessages = to === '/patient/messages';
        const highlight = isMessages && hasUnread && !active;

        return (
          <Link key={to} to={to}
            className={clsx(
              'relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all',
              active
                ? 'bg-[#1B3D34] text-white border-[#1B3D34]'
                : highlight
                ? 'bg-[#B8735E] text-white border-[#B8735E] shadow-md'
                : 'bg-white text-[#3C4346] border-[#E7E5E1] hover:border-[#1B3D34] hover:text-[#1B3D34]'
            )}>
            <Icon size={14} />
            {label}
            {highlight && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d64045] opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#d64045] text-white text-[8px] font-bold items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
