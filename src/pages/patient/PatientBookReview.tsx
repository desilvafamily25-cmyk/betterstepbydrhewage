import { AppShell } from '../../components/AppShell';
import { APP_CONFIG } from '../../config';
import { Calendar, ExternalLink, Phone } from 'lucide-react';

export function PatientBookReview() {
  return (
    <AppShell role="patient" title="Book GP Review" showBack>
      <div className="space-y-5">
        {/* Hero */}
        <div className="bg-gradient-to-br from-[#1B3D34] to-[#0F6D6D] rounded-2xl p-6 text-white text-center">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
            <Calendar size={28} className="text-white" />
          </div>
          <h2 className="text-xl font-bold">Book Your Review</h2>
          <p className="text-white/80 mt-2 text-sm leading-relaxed">
            Book your weight management review with {APP_CONFIG.doctorName}
          </p>
        </div>

        {/* Why book section */}
        <div className="bg-white rounded-2xl border border-[#E7E5E1] p-5 shadow-sm space-y-3">
          <h3 className="font-semibold text-[#1B3D34]">Why regular reviews matter</h3>
          {[
            'To safely continue your weight management prescription',
            'To monitor your progress and adjust your plan',
            'To check for side effects and address any concerns',
            'To review pathology results if arranged',
            'To stay motivated and on track with your goals',
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-[#1B3D34]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-[#1B3D34]">✓</span>
              </div>
              <p className="text-sm text-[#3C4346]">{item}</p>
            </div>
          ))}
        </div>

        {/* What to bring */}
        <div className="bg-[#DCC9B0]/35 border border-[#DCC9B0] rounded-2xl p-4">
          <h3 className="font-semibold text-[#1B3D34] mb-2">What to bring to your review</h3>
          <ul className="text-sm text-[#8A4D3C] space-y-1">
            <li>• Your BetterStep GP Summary (use the Summary page)</li>
            <li>• Your medication packaging or prescription details</li>
            <li>• Any blood pressure or pathology results if available</li>
            <li>• A list of questions you'd like to discuss</li>
          </ul>
        </div>

        {/* Booking button */}
        <a
          href={APP_CONFIG.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 bg-[#1B3D34] text-white rounded-2xl px-6 py-5 text-lg font-bold shadow-lg w-full"
        >
          <Calendar size={22} />
          {APP_CONFIG.bookingButtonText}
          <ExternalLink size={16} className="opacity-70" />
        </a>

        <p className="text-center text-xs text-[#747B7D]">
          You'll be redirected to {APP_CONFIG.clinicName}'s booking page.
        </p>

        {/* Prescription reminder */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="text-sm font-medium text-red-800">
            ⚠ Remember: Your repeat prescription requires a GP review. Please book before your current supply runs out.
          </p>
        </div>

        {/* Contact info placeholder */}
        <div className="bg-white rounded-2xl border border-[#E7E5E1] p-4 shadow-sm flex items-center gap-3">
          <Phone size={18} className="text-[#3C4346]" />
          <div>
            <p className="text-sm font-medium text-[#1B3D34]">{APP_CONFIG.clinicName}</p>
            <p className="text-xs text-[#747B7D]">Contact the clinic directly if you need urgent assistance</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
