import { AlertTriangle, Phone } from 'lucide-react';

interface SafetyAlertProps {
  type: 'red-flag' | 'warning' | 'info';
  message: string;
  showEmergency?: boolean;
}

export function SafetyAlert({ type, message, showEmergency }: SafetyAlertProps) {
  const styles = {
    'red-flag': 'bg-red-50 border-red-300 text-red-800',
    'warning': 'bg-[#DCC9B0]/35 border-[#DCC9B0] text-[#8A4D3C]',
    'info': 'bg-[#0F6D6D]/10 border-[#0F6D6D]/20 text-[#0F6D6D]',
  };

  return (
    <div className={`rounded-2xl border-2 p-4 ${styles[type]}`}>
      <div className="flex gap-3">
        <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium leading-relaxed">{message}</p>
          {showEmergency && (
            <a
              href="tel:000"
              className="mt-3 flex items-center gap-2 bg-red-600 text-white rounded-xl px-4 py-2.5 text-sm font-semibold w-fit"
            >
              <Phone size={16} />
              Call 000 — Emergency
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
