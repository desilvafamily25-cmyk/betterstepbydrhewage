import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { AppRole } from '../lib/database.types';

interface AuthState {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  patientId: string | null;
  loading: boolean;
  reloadProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  session: null,
  role: null,
  patientId: null,
  loading: true,
  reloadProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (u: User, s: Session) => {
    setLoading(true);
    setUser(u);
    setSession(s);

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', u.id)
      .single() as { data: { role: AppRole } | null };

    const userRole = profile?.role ?? null;
    setRole(userRole);

    if (userRole === 'patient') {
      const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', u.id)
        .single() as { data: { id: string } | null };
      setPatientId(patient?.id ?? null);
    } else {
      setPatientId(null);
    }

    setLoading(false);
  }, []);

  const reloadProfile = useCallback(async () => {
    const { data: { session: s } } = await supabase.auth.getSession();
    if (s?.user) {
      await loadProfile(s.user, s);
    }
  }, [loadProfile]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (s?.user) {
        loadProfile(s.user, s);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      if (s?.user) {
        loadProfile(s.user, s);
      } else {
        setUser(null);
        setSession(null);
        setRole(null);
        setPatientId(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  return (
    <AuthContext.Provider value={{ user, session, role, patientId, loading, reloadProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
