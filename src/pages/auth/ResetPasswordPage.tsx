import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updatePassword } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [validSession, setValidSession] = useState(false);

  useEffect(() => {
    // Supabase puts the recovery token in the URL hash; the client handles it automatically
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setValidSession(true);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    const { error } = await updatePassword(password);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setDone(true);
      setTimeout(() => navigate('/'), 3000);
    }
  };

  const inputClass = 'w-full rounded-xl border border-[#E7E5E1] bg-white px-4 py-3.5 text-sm text-[#1B3D34] focus:outline-none focus:ring-2 focus:ring-[#1B3D34] placeholder:text-[#9AA09D]';

  return (
    <div className="min-h-dvh bg-gradient-to-br from-[#102D26] via-[#0F6D6D] to-[#0F6D6D] flex flex-col">
      <div className="px-6 pt-14 pb-8 text-center">
        <div className="mx-auto mb-4 flex w-fit flex-col items-center rounded-2xl bg-white px-6 py-4 shadow-xl shadow-black/20">
          <img src="/betterstep-brand-logo.png" alt="BetterStep" className="h-28 w-28 object-contain" />
          <p className="font-['Playfair_Display'] text-3xl font-bold leading-none text-[#123B34]">BetterStep</p>
          <p className="text-sm font-semibold text-[#B8735E]">by Dr. Hewage</p>
        </div>
      </div>

      <div className="flex-1 bg-[#F6F3EE] rounded-t-3xl px-6 pt-8 pb-10 shadow-[0_-18px_40px_rgba(27,61,52,0.16)]">
        <h2 className="text-xl font-bold text-[#1B3D34] mb-1">Set New Password</h2>
        <p className="text-sm text-[#3C4346] mb-6">Choose a strong password for your account.</p>

        {done ? (
          <div className="flex flex-col items-center py-10 gap-4">
            <div className="w-16 h-16 rounded-full bg-[#0F6D6D]/10 flex items-center justify-center">
              <CheckCircle size={32} className="text-[#0F6D6D]" />
            </div>
            <p className="text-base font-semibold text-[#1B3D34]">Password updated</p>
            <p className="text-sm text-[#3C4346]">Redirecting you to sign in…</p>
          </div>
        ) : !validSession ? (
          <div className="bg-[#DCC9B0]/35 border border-[#DCC9B0] rounded-2xl p-4">
            <p className="text-sm text-[#8A4D3C]">
              This link may have expired. Please request a new password reset from the sign in page.
            </p>
            <button onClick={() => navigate('/auth')} className="mt-3 text-sm font-semibold text-[#1B3D34] underline">
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-[#3C4346] mb-1.5 uppercase tracking-wide">New Password</label>
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
                  onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat new password" autoComplete="new-password" />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-[#1B3D34] text-white rounded-2xl py-4 text-base font-bold disabled:opacity-50 shadow-md mt-2">
              {loading ? 'Updating…' : 'Set New Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
