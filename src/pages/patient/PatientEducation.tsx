import { useState } from 'react';
import { AppShell } from '../../components/AppShell';
import { ChevronDown, ChevronUp, BookOpen, PlayCircle, X, Sparkles } from 'lucide-react';
import { usePatientData } from '../../hooks/usePatientData';
import { latestCheckIn } from '../../utils';

interface VideoItem {
  title: string;
  description: string;
  tag: string;
  tagColour: string;
  embedUrl?: string;
  videoUrl?: string;
  captionUrl?: string;
  thumbnailUrl?: string;
}

interface EducationCard {
  title: string;
  content: string;
  tag: string;
}

const VIDEO_LIBRARY: VideoItem[] = [
  {
    title: 'How to use the Ozempic pen',
    description: 'Step-by-step guide to preparing and injecting your weekly Ozempic dose safely.',
    tag: 'Ozempic',
    tagColour: 'bg-[#0F6D6D]/10 text-[#0F6D6D]',
    embedUrl: 'https://nni-video.videomarketingplatform.co/v.ihtml/player.html?token=89300d04546cef764b792e1fb2f7132c&source=embed&photo_id=90732263',
  },
  {
    title: 'How to use the Mounjaro KwikPen',
    description: 'Step-by-step guide to preparing and injecting your weekly Mounjaro dose safely.',
    tag: 'Mounjaro',
    tagColour: 'bg-[#B8735E]/15 text-[#8A4D3C]',
    videoUrl: '/mounjaro-kwikpen.mp4',
    captionUrl: '/mounjaro-kwikpen-en.vtt',
    thumbnailUrl: '/mounjaro-kwikpen-thumbnail.jpg',
  },
];

const EDUCATION_CARDS: EducationCard[] = [
  {
    title: 'How weight management medication works',
    tag: 'Medication',
    content: `Weight management medications like semaglutide (Ozempic/Wegovy) and tirzepatide (Mounjaro) belong to a class called GLP-1 receptor agonists. They work by mimicking gut hormones that are released after eating.\n\nThey help by:\n• Reducing appetite and food cravings\n• Slowing digestion so you feel full longer\n• Improving blood glucose regulation\n• Supporting sustainable weight loss when combined with lifestyle changes\n\nThese medications are most effective when used alongside a healthy diet, regular physical activity, and regular GP reviews. They are not a quick fix — consistent use over months gives the best results.`,
  },
  {
    title: 'Common side effects and what to do',
    tag: 'Side Effects',
    content: `The most common side effects are related to the digestive system, especially in the first few weeks:\n\n• Nausea — usually mild and improves over time\n• Constipation or loose stools\n• Reflux or heartburn\n• Decreased appetite (this is expected!)\n• Mild dizziness or headache\n\nMost side effects improve as your body adjusts to the medication. Starting at a low dose and increasing slowly helps.\n\nContact your GP if side effects are severe, persistent, or affecting your daily life. Do not stop medication without discussing it with your GP first.`,
  },
  {
    title: 'Managing nausea',
    tag: 'Side Effects',
    content: `Nausea is the most common side effect, particularly in the first few weeks. Here are practical tips:\n\n• Eat smaller, more frequent meals\n• Avoid fatty, spicy, or very rich foods\n• Eat slowly and chew thoroughly\n• Take your injection at night if nausea is worse in the morning\n• Stay upright for at least 30–60 minutes after eating\n• Ginger tea, plain crackers, or small amounts of cold food may help\n• Stay hydrated — small, frequent sips of water\n\nNausea usually improves significantly after the first 4–8 weeks. If it is severe or you cannot keep fluids down, contact your GP.`,
  },
  {
    title: 'Managing constipation',
    tag: 'Side Effects',
    content: `Constipation is common with GLP-1 medications because they slow digestion. Here's how to manage it:\n\n• Increase your daily water intake — aim for 2 litres or more\n• Eat more fibre: vegetables, fruits, legumes, and wholegrains\n• Move your body daily — even a short walk helps gut motility\n• Do not strain — if you are uncomfortable, speak to your GP\n• Your GP may recommend a gentle osmotic laxative if needed\n\nContact your GP if you have not had a bowel motion for more than 3–4 days, or if you have abdominal pain or bloating.`,
  },
  {
    title: 'Protein and muscle preservation',
    tag: 'Nutrition',
    content: `When losing weight, it is important to preserve muscle mass — not just lose fat. Protein is essential for this.\n\nAim for:\n• 1.2–1.5 g of protein per kg of body weight daily\n• Including protein in every meal: eggs, meat, fish, tofu, legumes, dairy\n• Resistance exercise (weights, body weight exercises) alongside your weight loss programme\n\nWhy does this matter?\nMuscle burns more energy than fat, supports your metabolism, and improves strength and mobility. Rapid weight loss without adequate protein can lead to muscle loss, which is harder to recover.\n\nSpeak to your GP or a dietitian for personalised guidance.`,
  },
  {
    title: 'Why regular GP review matters',
    tag: 'Review',
    content: `Regular GP reviews are an essential part of safe, effective weight management. At each review, your GP will:\n\n• Monitor your weight trend and body composition\n• Review medication tolerance and side effects\n• Consider dose adjustments if appropriate\n• Check blood pressure, glucose, and other health markers\n• Discuss your lifestyle, nutrition, and exercise\n• Provide repeat prescriptions and plan next steps\n\nSkipping reviews means your GP cannot safely prescribe your medication, monitor your progress, or identify problems early. Try to attend every scheduled review — even if you feel things are going well.`,
  },
  {
    title: 'What to do if you miss a dose',
    tag: 'Medication',
    content: `If you are on a weekly injection (e.g. semaglutide, tirzepatide):\n\n• If you missed your dose and it has been fewer than 5 days, take it as soon as you remember\n• If it has been 5 days or more, skip the missed dose and continue on your usual day next week\n• Do not take two doses at once\n\nIf you are on a daily injection (e.g. liraglutide):\n\n• If it has been fewer than 12 hours, take it as soon as you remember\n• If it has been more than 12 hours, skip that dose and resume the next day\n\nAlways check the package insert or ask your GP if unsure. Do not adjust your dose without medical advice.`,
  },
  {
    title: 'When to seek urgent help',
    tag: 'Safety',
    content: `Call 000 or attend your nearest emergency department immediately if you experience:\n\n🔴 Severe abdominal pain\n🔴 Persistent vomiting or inability to keep fluids down\n🔴 Signs of dehydration (extreme thirst, dark urine, dizziness, confusion)\n🔴 Severe allergic reaction (rash, swelling of face or throat, difficulty breathing)\n🔴 Chest pain\n🔴 Severe mood changes or thoughts of self-harm\n\nContact your GP urgently (same day) for:\n• Moderate or worsening abdominal pain\n• Persistent diarrhoea or constipation\n• Significant weight loss or gain in a short time\n• Any concerns about your medication\n\nBetterStep is not an emergency service. In an emergency, always call 000.`,
  },
  {
    title: 'Weight plateaus — what to expect',
    tag: 'Progress',
    content: `A weight plateau is when your weight stays the same for 2–4 weeks despite following your programme. This is very common and does not mean the medication has stopped working.\n\nWhy does it happen?\n• Your body adapts to a lower calorie intake\n• Natural fluctuations in water and fluid retention\n• Changes in muscle mass as you exercise\n\nWhat to do:\n• Continue taking your medication as prescribed\n• Do not change your dose without GP advice\n• Focus on non-scale victories — energy, waist measurement, fitness\n• Review your diet with a focus on protein and whole foods\n• Discuss the plateau at your next GP review\n\nPatience is important. Plateaus typically break on their own with consistent effort.`,
  },
  {
    title: 'Long-term weight maintenance',
    tag: 'Long Term',
    content: `Reaching your goal weight is an important milestone — but maintaining it requires an ongoing plan.\n\nKey principles for long-term success:\n\n• Continue regular GP reviews even after reaching your goal\n• Maintain healthy habits: protein-rich diet, regular exercise, sleep, stress management\n• Understand that some people continue medication long-term to prevent weight regain\n• Do not stop medication suddenly — discuss any changes with your GP\n• Track weight weekly and respond early to any upward trends\n• Build a support network: family, friends, or a health coach\n\nWeight management is a long-term commitment, not a short-term fix. Your GP is your partner in this journey.`,
  },
];

const TAG_COLOUR: Record<string, string> = {
  'Medication': 'bg-[#0F6D6D]/10 text-[#0F6D6D]',
  'Side Effects': 'bg-[#DCC9B0]/45 text-[#8A4D3C]',
  'Nutrition': 'bg-[#0F6D6D]/10 text-[#0F6D6D]',
  'Review': 'bg-[#DCC9B0]/45 text-[#8A4D3C]',
  'Safety': 'bg-red-100 text-red-700',
  'Progress': 'bg-teal-100 text-teal-700',
  'Long Term': 'bg-[#E7E5E1] text-[#3C4346]',
};

function VideoCard({ video }: { video: VideoItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-[#E7E5E1] shadow-sm overflow-hidden">
      {!open ? (
        <button onClick={() => setOpen(true)} className="w-full text-left">
          {video.thumbnailUrl ? (
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center gap-2">
                <div className="w-14 h-14 rounded-full bg-white/25 flex items-center justify-center">
                  <PlayCircle size={36} className="text-white" />
                </div>
                <p className="text-white/90 text-xs font-medium">Tap to watch</p>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-[#1B3D34] to-[#0F6D6D] px-5 py-8 flex flex-col items-center justify-center gap-3">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                <PlayCircle size={36} className="text-white" />
              </div>
              <p className="text-white/80 text-xs font-medium">Tap to watch</p>
            </div>
          )}
          <div className="px-4 py-3">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${video.tagColour}`}>
              {video.tag}
            </span>
            <p className="text-sm font-bold text-[#1B3D34] mt-2 leading-snug">{video.title}</p>
            <p className="text-xs text-[#747B7D] mt-1 leading-relaxed">{video.description}</p>
          </div>
        </button>
      ) : (
        <div>
          {video.videoUrl ? (
            <video
              controls
              autoPlay
              playsInline
              poster={video.thumbnailUrl}
              className="w-full"
            >
              <source src={video.videoUrl} type="video/mp4" />
              {video.captionUrl && (
                <track kind="subtitles" src={video.captionUrl} srcLang="en" label="English" default />
              )}
            </video>
          ) : (
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={video.embedUrl}
                title={video.title}
                allow="autoplay; fullscreen"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
              />
            </div>
          )}
          <div className="px-4 py-3 flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${video.tagColour}`}>
                {video.tag}
              </span>
              <p className="text-sm font-bold text-[#1B3D34] mt-1.5 leading-snug">{video.title}</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="flex-shrink-0 w-7 h-7 rounded-xl bg-[#F6F3EE] flex items-center justify-center text-[#747B7D] mt-1"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const SIDE_EFFECT_TO_TITLES: Record<string, string[]> = {
  nausea: ['Managing nausea', 'Common side effects and what to do'],
  vomiting: ['Managing nausea', 'When to seek urgent help'],
  constipation: ['Managing constipation', 'Common side effects and what to do'],
  diarrhoea: ['Common side effects and what to do'],
  reflux: ['Managing nausea', 'Common side effects and what to do'],
  'abdominal pain': ['When to seek urgent help', 'Common side effects and what to do'],
  dizziness: ['Common side effects and what to do', 'When to seek urgent help'],
};

export function PatientEducation() {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>('All');
  const { patient, checkIns } = usePatientData();

  const latest = patient ? latestCheckIn(checkIns, patient.id) : undefined;
  const recentSideEffects = latest?.sideEffects.filter(e => e !== 'none') ?? [];

  const recommendedTitles = Array.from(new Set(
    recentSideEffects.flatMap(e => SIDE_EFFECT_TO_TITLES[e] ?? [])
  ));
  const recommendedCards = EDUCATION_CARDS.filter(c => recommendedTitles.includes(c.title));

  const tags = ['All', ...Array.from(new Set(EDUCATION_CARDS.map(c => c.tag)))];
  const filtered = filter === 'All' ? EDUCATION_CARDS : EDUCATION_CARDS.filter(c => c.tag === filter);

  return (
    <AppShell role="patient" title="Education Library" showBack>
      <div className="space-y-5">

        {/* ── Recommended for you ── */}
        {recommendedCards.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles size={17} className="text-[#B8735E]" />
              <h2 className="text-sm font-bold text-[#1B3D34] uppercase tracking-wide">Recommended for you</h2>
            </div>
            <p className="text-xs text-[#747B7D] -mt-1">Based on side effects you logged recently.</p>
            {recommendedCards.map((card, i) => {
              const globalIdx = EDUCATION_CARDS.indexOf(card);
              const isOpen = expanded === globalIdx;
              return (
                <div key={i} className="bg-white rounded-2xl border border-[#B8735E]/30 shadow-sm overflow-hidden">
                  <button
                    onClick={() => setExpanded(isOpen ? null : globalIdx)}
                    className="w-full px-5 py-4 flex items-start gap-3 text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${TAG_COLOUR[card.tag] || 'bg-[#E7E5E1] text-[#3C4346]'}`}>
                        {card.tag}
                      </span>
                      <p className="text-sm font-semibold text-[#1B3D34] mt-1.5 leading-snug">{card.title}</p>
                    </div>
                    {isOpen ? <ChevronUp size={18} className="text-[#747B7D] mt-1 flex-shrink-0" /> : <ChevronDown size={18} className="text-[#747B7D] mt-1 flex-shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 border-t border-[#f0f0f0]">
                      <div className="pt-4 text-sm text-[#3C4346] leading-relaxed whitespace-pre-line">{card.content}</div>
                    </div>
                  )}
                </div>
              );
            })}
            <div className="flex-1 h-px bg-[#E7E5E1] my-1" />
          </div>
        )}

        {/* ── Video section ── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <PlayCircle size={17} className="text-[#1B3D34]" />
            <h2 className="text-sm font-bold text-[#1B3D34] uppercase tracking-wide">How-to Videos</h2>
          </div>
          {VIDEO_LIBRARY.map((video, i) => (
            <VideoCard key={i} video={video} />
          ))}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#E7E5E1]" />
          <span className="text-xs text-[#747B7D] font-medium">Reading</span>
          <div className="flex-1 h-px bg-[#E7E5E1]" />
        </div>

        {/* ── Written handouts ── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 bg-[#1B3D34]/10 rounded-2xl p-3">
            <BookOpen size={18} className="text-[#1B3D34]" />
            <p className="text-sm text-[#1B3D34] font-medium">GP-approved patient education handouts</p>
          </div>

          {/* Filter chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {tags.map(tag => (
              <button key={tag} onClick={() => setFilter(tag)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${filter === tag ? 'bg-[#1B3D34] text-white border-[#1B3D34]' : 'bg-white text-[#3C4346] border-[#E7E5E1]'}`}>
                {tag}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filtered.map((card, i) => {
              const isOpen = expanded === i;
              return (
                <div key={i} className="bg-white rounded-2xl border border-[#E7E5E1] shadow-sm overflow-hidden">
                  <button
                    onClick={() => setExpanded(isOpen ? null : i)}
                    className="w-full px-5 py-4 flex items-start gap-3 text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${TAG_COLOUR[card.tag] || 'bg-[#E7E5E1] text-[#3C4346]'}`}>
                        {card.tag}
                      </span>
                      <p className="text-sm font-semibold text-[#1B3D34] mt-1.5 leading-snug">{card.title}</p>
                    </div>
                    {isOpen ? <ChevronUp size={18} className="text-[#747B7D] mt-1 flex-shrink-0" /> : <ChevronDown size={18} className="text-[#747B7D] mt-1 flex-shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 border-t border-[#f0f0f0]">
                      <div className="pt-4 text-sm text-[#3C4346] leading-relaxed whitespace-pre-line">
                        {card.content}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-[#F6F3EE] rounded-2xl border border-[#E7E5E1] p-4">
          <p className="text-xs text-[#747B7D] text-center leading-relaxed">
            These resources are for general information only. They do not replace personalised medical advice from your GP.
          </p>
        </div>

      </div>
    </AppShell>
  );
}
