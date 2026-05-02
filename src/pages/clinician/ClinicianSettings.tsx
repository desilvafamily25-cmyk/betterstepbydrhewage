import { useState } from 'react';
import { AppShell } from '../../components/AppShell';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { APP_CONFIG } from '../../config';
import { Save, Check } from 'lucide-react';

interface ClinicSettings {
  clinicName: string;
  doctorName: string;
  bookingUrl: string;
  defaultReviewIntervalWeeks: number;
  prescriptionReminderDays: number;
  disclaimer: string;
}

const DEFAULTS: ClinicSettings = {
  clinicName: APP_CONFIG.clinicName,
  doctorName: APP_CONFIG.doctorName,
  bookingUrl: APP_CONFIG.bookingUrl,
  defaultReviewIntervalWeeks: APP_CONFIG.defaultReviewIntervalWeeks,
  prescriptionReminderDays: 10,
  disclaimer: APP_CONFIG.disclaimer,
};

export function ClinicianSettings() {
  const [settings, setSettings] = useLocalStorage<ClinicSettings>('clinicSettings', DEFAULTS);
  const [saved, setSaved] = useState(false);

  const update = (k: keyof ClinicSettings, v: string | number) =>
    setSettings(s => ({ ...s, [k]: v }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputClass = 'w-full rounded-xl border border-[#E7E5E1] bg-white px-4 py-3 text-sm text-[#1B3D34] focus:outline-none focus:ring-2 focus:ring-[#0F6D6D]';
  const labelClass = 'block text-xs font-semibold text-[#3C4346] mb-1.5 uppercase tracking-wide';

  return (
    <AppShell role="clinician" title="Settings">
      <div className="space-y-5">
        {/* Clinic details */}
        <div className="bg-white rounded-2xl border border-[#E7E5E1] p-5 shadow-sm space-y-4">
          <h3 className="font-semibold text-[#1B3D34]">Clinic Details</h3>
          <div>
            <label className={labelClass}>Clinic Name</label>
            <input className={inputClass} value={settings.clinicName}
              onChange={e => update('clinicName', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Doctor Name</label>
            <input className={inputClass} value={settings.doctorName}
              onChange={e => update('doctorName', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Booking URL</label>
            <input type="url" className={inputClass} value={settings.bookingUrl}
              onChange={e => update('bookingUrl', e.target.value)}
              placeholder="https://www.your-booking-url.com.au" />
          </div>
        </div>

        {/* Review settings */}
        <div className="bg-white rounded-2xl border border-[#E7E5E1] p-5 shadow-sm space-y-4">
          <h3 className="font-semibold text-[#1B3D34]">Review Configuration</h3>
          <div>
            <label className={labelClass}>Default Review Interval</label>
            <select className={inputClass} value={settings.defaultReviewIntervalWeeks}
              onChange={e => update('defaultReviewIntervalWeeks', parseInt(e.target.value))}>
              <option value={2}>Every 2 weeks</option>
              <option value={4}>Every 4 weeks</option>
              <option value={6}>Every 6 weeks</option>
              <option value={8}>Every 8 weeks</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Start Prescription Reminder (days before)</label>
            <select className={inputClass} value={settings.prescriptionReminderDays}
              onChange={e => update('prescriptionReminderDays', parseInt(e.target.value))}>
              <option value={7}>7 days before</option>
              <option value={10}>10 days before</option>
              <option value={14}>14 days before</option>
            </select>
          </div>
        </div>

        {/* Safety disclaimer */}
        <div className="bg-white rounded-2xl border border-[#E7E5E1] p-5 shadow-sm space-y-3">
          <h3 className="font-semibold text-[#1B3D34]">Safety Disclaimer</h3>
          <textarea className={inputClass + ' resize-none'} rows={4}
            value={settings.disclaimer}
            onChange={e => update('disclaimer', e.target.value)} />
          <p className="text-xs text-[#747B7D]">
            This text appears in the app footer and on relevant pages.
          </p>
        </div>

        {/* Save */}
        <button onClick={handleSave}
          className={`w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-base font-semibold shadow-md ${saved ? 'bg-[#0F6D6D] text-white' : 'bg-[#0F6D6D] text-white'}`}>
          {saved ? <Check size={20} /> : <Save size={20} />}
          {saved ? 'Settings Saved!' : 'Save Settings'}
        </button>

        {/* App info */}
        <div className="bg-[#F6F3EE] rounded-2xl border border-[#E7E5E1] p-4 text-center">
          <p className="text-xs text-[#747B7D] font-semibold">{APP_CONFIG.appName}</p>
          <p className="text-xs text-[#747B7D] mt-0.5">Version 1.0 · GP-supervised weight management companion</p>
          <p className="text-xs text-[#747B7D] mt-2 leading-relaxed">{APP_CONFIG.disclaimer}</p>
        </div>
      </div>
    </AppShell>
  );
}
