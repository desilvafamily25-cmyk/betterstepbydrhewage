import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn, signUp, sendPasswordReset } from '../../hooks/useAuth';
import { APP_CONFIG } from '../../config';
import { Eye, EyeOff, Mail, Lock, Stethoscope, ChevronLeft, CheckCircle } from 'lucide-react';

type AuthMode = 'login' | 'register' | 'forgot';

export function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'patient' | 'clinician'>('patient');
  const [clinicianCode, setClinicianCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const CLINICIAN_CODE = 'BETTERSTEP-CLINIC';

  const inputClass = 'w-full rounded-xl border border-[#E7E5E1] bg-white px-4 py-3.5 text-sm text-[#1B3D34] focus:outline-none focus:ring-2 focus:ring-[#1B3D34] focus:border-transparent placeholder:text-[#9AA09D]';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(error.message === 'Invalid login credentials'
        ? 'Incorrect email or password. Please try again.'
        : error.message);
    } else {
      navigate('/');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (role === 'clinician' && clinicianCode !== CLINICIAN_CODE) {
      setError('Invalid clinician access code. Please contact the clinic.');
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, fullName, role);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess('Account created! Please check your email to verify your account, then sign in.');
      setMode('login');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await sendPasswordReset(email);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess('Password reset email sent. Please check your inbox.');
    }
  };

  return (
    <div className="min-h-dvh bg-gradient-to-br from-[#102D26] via-[#0F6D6D] to-[#0F6D6D] flex flex-col">
      {/* Header */}
      <div className="px-6 pt-14 pb-8 text-center">
        <div className="mx-auto mb-4 flex w-fit flex-col items-center rounded-2xl bg-white px-6 py-4 shadow-xl shadow-black/20">
          <img src="/betterstep-brand-logo.png" alt="BetterStep" className="h-28 w-28 object-contain" />
          <p className="font-['Playfair_Display'] text-3xl font-bold leading-none text-[#123B34]">BetterStep</p>
          <p className="text-sm font-semibold text-[#B8735E]">by Dr. Hewage</p>
        </div>
        <p className="text-white/60 text-sm mt-1">GP-supervised weight management</p>
      </div>

      {/* Card */}
      <div className="flex-1 bg-[#F6F3EE] rounded-t-3xl px-6 pt-8 pb-10 shadow-[0_-18px_40px_rgba(27,61,52,0.16)]">
        {/* Mode tabs */}
        {mode !== 'forgot' && (
          <div className="flex bg-white rounded-2xl p-1 border border-[#E7E5E1] mb-6">
            <button onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${mode === 'login' ? 'bg-[#1B3D34] text-white' : 'text-[#3C4346]'}`}>
              Sign In
            </button>
            <button onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${mode === 'register' ? 'bg-[#1B3D34] text-white' : 'text-[#3C4346]'}`}>
              Register
            </button>
          </div>
        )}

        {mode === 'forgot' && (
          <button onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
            className="flex items-center gap-1.5 text-sm text-[#3C4346] mb-5 font-medium">
            <ChevronLeft size={16} /> Back to Sign In
          </button>
        )}

        {/* Success message */}
        {success && (
          <div className="flex items-start gap-3 bg-[#0F6D6D]/10 border border-[#0F6D6D]/20 rounded-2xl p-4 mb-4">
            <CheckCircle size={18} className="text-[#0F6D6D] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[#0F6D6D]">{success}</p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* ─── LOGIN ─── */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#3C4346] mb-1.5 uppercase tracking-wide">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9AA09D]" />
                <input type="email" required className={inputClass + ' pl-10'} value={email}
                  onChange={e => setEmail(e.target.value)} placeholder="you@email.com.au" autoComplete="email" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#3C4346] mb-1.5 uppercase tracking-wide">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9AA09D]" />
                <input
                  type={showPassword ? 'text' : 'password'} required
                  className={inputClass + ' pl-10 pr-11'} value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="Your password" autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9AA09D] hover:text-[#3C4346]">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="button" onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}
              className="text-xs text-[#1B3D34] font-semibold hover:underline">
              Forgot your password?
            </button>
            <button type="submit" disabled={loading}
              className="w-full bg-[#1B3D34] text-white rounded-2xl py-4 text-base font-bold disabled:opacity-50 shadow-md mt-2">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        )}

        {/* ─── REGISTER ─── */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#3C4346] mb-1.5 uppercase tracking-wide">Full Name</label>
              <input type="text" required className={inputClass} value={fullName}
                onChange={e => setFullName(e.target.value)} placeholder="Your full name" autoComplete="name" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#3C4346] mb-1.5 uppercase tracking-wide">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9AA09D]" />
                <input type="email" required className={inputClass + ' pl-10'} value={email}
                  onChange={e => setEmail(e.target.value)} placeholder="you@email.com.au" autoComplete="email" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#3C4346] mb-1.5 uppercase tracking-wide">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9AA09D]" />
                <input type={showPassword ? 'text' : 'password'} required minLength={8}
                  className={inputClass + ' pl-10 pr-11'} value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" autoComplete="new-password" />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9AA09D]">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#3C4346] mb-1.5 uppercase tracking-wide">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9AA09D]" />
                <input type={showPassword ? 'text' : 'password'} required
                  className={inputClass + ' pl-10'} value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat password" autoComplete="new-password" />
              </div>
            </div>

            {role === 'clinician' ? (
              <div className="bg-[#0F6D6D]/10 border border-[#0F6D6D]/20 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Stethoscope size={16} className="text-[#0F6D6D]" />
                    <span className="text-sm font-semibold text-[#0F6D6D]">Clinician registration</span>
                  </div>
                  <button type="button" onClick={() => { setRole('patient'); setClinicianCode(''); }}
                    className="text-xs text-[#747B7D] underline">Switch to Patient</button>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3C4346] mb-1.5 uppercase tracking-wide">Clinician Access Code</label>
                  <input type="text" className={inputClass} value={clinicianCode}
                    onChange={e => setClinicianCode(e.target.value.toUpperCase())}
                    placeholder="Provided by the clinic" />
                  <p className="text-xs text-[#747B7D] mt-1">Contact {APP_CONFIG.clinicName} for your access code.</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-center text-[#747B7D]">
                Registering as a clinician?{' '}
                <button type="button" onClick={() => setRole('clinician')}
                  className="text-[#1B3D34] font-semibold underline">
                  Use a clinician access code
                </button>
              </p>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-[#1B3D34] text-white rounded-2xl py-4 text-base font-bold disabled:opacity-50 shadow-md mt-2">
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        )}

        {/* ─── FORGOT PASSWORD ─── */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="bg-[#0F6D6D]/10 border border-[#0F6D6D]/20 rounded-2xl p-4">
              <p className="text-sm text-[#0F6D6D] leading-relaxed">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#3C4346] mb-1.5 uppercase tracking-wide">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9AA09D]" />
                <input type="email" required className={inputClass + ' pl-10'} value={email}
                  onChange={e => setEmail(e.target.value)} placeholder="you@email.com.au" autoComplete="email" />
              </div>
            </div>
            <button type="submit" disabled={loading || !!success}
              className="w-full bg-[#1B3D34] text-white rounded-2xl py-4 text-base font-bold disabled:opacity-50 shadow-md">
              {loading ? 'Sending…' : 'Send Reset Link'}
            </button>
          </form>
        )}

        {/* Footer disclaimer */}
        <p className="text-[10px] text-[#9AA09D] text-center mt-8 leading-relaxed">
          {APP_CONFIG.disclaimer}
        </p>
      </div>
    </div>
  );
}
