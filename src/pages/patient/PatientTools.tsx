import { useState, useEffect } from 'react';
import { AppShell } from '../../components/AppShell';
import { Calculator, Utensils, Search, Info, AlertTriangle, Loader2, ExternalLink, Copy, Check } from 'lucide-react';
import { searchFoods, getFoodDetails, getProteinNutrient, type FoodSearchResult, type FoodDetail } from '../../lib/usdaApi';
import { usePatientData } from '../../hooks/usePatientData';

const inputClass = 'w-full rounded-xl border border-[#E7E5E1] bg-white px-4 py-3 text-sm text-[#1B3D34] focus:outline-none focus:ring-2 focus:ring-[#1B3D34]';
const selectClass = inputClass;
const btnPrimary = 'w-full bg-[#1B3D34] text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-60';
const btnOutline = 'w-full border-2 border-[#1B3D34] text-[#1B3D34] rounded-xl py-3 text-sm font-semibold hover:bg-[#1B3D34] hover:text-white transition-colors';

// ── BMI Calculator ──────────────────────────────────────────────
function BMICalculator({ initialHeight, initialWeight, goalWeightKg }: { initialHeight?: number; initialWeight?: number; goalWeightKg?: number }) {
  const [height, setHeight] = useState(initialHeight ? String(Math.round(initialHeight)) : '');
  const [weight, setWeight] = useState(initialWeight ? String(initialWeight) : '');
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (initialHeight && !height) setHeight(String(Math.round(initialHeight)));
    if (initialWeight && !weight) setWeight(String(initialWeight));
  }, [initialHeight, initialWeight]);

  const calculateBMI = () => {
    const h = parseFloat(height) / 100;
    const w = parseFloat(weight);
    if (h > 0 && w > 0) return (w / (h * h)).toFixed(1);
    return null;
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Underweight', colour: 'text-blue-600' };
    if (bmi < 25)   return { category: 'Healthy Weight', colour: 'text-[#0F6D6D]' };
    if (bmi < 30)   return { category: 'Overweight', colour: 'text-amber-600' };
    return           { category: 'Obese', colour: 'text-red-600' };
  };

  const getRecommendation = (bmi: number) => {
    if (bmi < 18.5) return 'Consider consulting with a healthcare professional about healthy weight gain strategies.';
    if (bmi < 25)   return 'Your BMI is in the healthy range. Maintain your current lifestyle with balanced nutrition and regular activity.';
    if (bmi < 30)   return 'Consider lifestyle modifications including balanced nutrition and increased physical activity. Your GP can help guide your weight management programme.';
    return 'Medical weight management support may be beneficial. Speak to your GP about options including lifestyle changes and medication if appropriate.';
  };

  const bmi = calculateBMI();
  const bmiNum = bmi ? parseFloat(bmi) : 0;
  const bmiData = bmiNum > 0 ? getBMICategory(bmiNum) : null;

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (height && weight) setShowResult(true); };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 bg-[#0F6D6D]/10 border border-[#0F6D6D]/20 rounded-2xl p-4">
        <Info size={16} className="text-[#0F6D6D] mt-0.5 flex-shrink-0" />
        <p className="text-sm text-[#1B3D34]">BMI is a screening tool. It doesn't directly measure body fat but provides a useful starting point.</p>
      </div>

      {!showResult ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#3C4346] mb-1.5 uppercase tracking-wide">Height (cm)</label>
            <input type="number" required value={height} onChange={e => setHeight(e.target.value)}
              className={inputClass} placeholder="e.g. 165" min="100" max="250" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#3C4346] mb-1.5 uppercase tracking-wide">Weight (kg)</label>
            <input type="number" required value={weight} onChange={e => setWeight(e.target.value)}
              className={inputClass} placeholder="e.g. 70" min="30" max="300" />
          </div>
          <button type="submit" className={btnPrimary}>Calculate BMI</button>
        </form>
      ) : (
        <div className="space-y-4">
          {/* Result */}
          <div className="bg-gradient-to-br from-[#1B3D34] to-[#0F6D6D] rounded-2xl p-6 text-center text-white">
            <p className="text-white/70 text-sm font-medium mb-1">Your BMI</p>
            <p className="text-5xl font-bold mb-2">{bmi}</p>
            {bmiData && <p className="text-lg font-semibold text-white/90">{bmiData.category}</p>}
            {goalWeightKg && height && (() => {
              const h = parseFloat(height) / 100;
              const goalBmi = (goalWeightKg / (h * h)).toFixed(1);
              return (
                <p className="text-sm text-white/60 mt-2">Programme target: BMI {goalBmi} (at {goalWeightKg} kg)</p>
              );
            })()}
          </div>

          {/* Scale */}
          <div className="bg-[#F6F3EE] rounded-2xl border border-[#E7E5E1] p-4 space-y-2">
            <p className="text-xs font-bold text-[#3C4346] uppercase tracking-wide mb-3">BMI Categories</p>
            {[
              { label: 'Underweight', range: '< 18.5', active: bmiNum < 18.5 },
              { label: 'Healthy Weight', range: '18.5 – 24.9', active: bmiNum >= 18.5 && bmiNum < 25 },
              { label: 'Overweight', range: '25 – 29.9', active: bmiNum >= 25 && bmiNum < 30 },
              { label: 'Obese', range: '≥ 30', active: bmiNum >= 30 },
            ].map(row => (
              <div key={row.label} className={`flex justify-between items-center rounded-xl px-3 py-2 text-sm ${row.active ? 'bg-[#1B3D34] text-white font-semibold' : 'text-[#3C4346]'}`}>
                <span>{row.label}</span>
                <span className={row.active ? 'text-white/80' : 'text-[#747B7D]'}>{row.range}</span>
              </div>
            ))}
          </div>

          {/* Recommendation */}
          <div className="bg-[#DCC9B0]/35 border border-[#DCC9B0] rounded-2xl p-4">
            <p className="text-xs font-bold text-[#8A4D3C] uppercase tracking-wide mb-2">Recommendation</p>
            <p className="text-sm text-[#8A4D3C] leading-relaxed">{getRecommendation(bmiNum)}</p>
          </div>

          <button onClick={() => { setHeight(initialHeight ? String(Math.round(initialHeight)) : ''); setWeight(initialWeight ? String(initialWeight) : ''); setShowResult(false); }} className={btnOutline}>
            Calculate Again
          </button>
          <p className="text-xs text-[#747B7D] text-center">General information only — not a substitute for medical advice.</p>
        </div>
      )}
    </div>
  );
}

// ── Protein Calculator ───────────────────────────────────────────
function ProteinCalculator({ initialWeight }: { initialWeight?: number }) {
  const [mode, setMode] = useState<'quick' | 'advanced'>('quick');
  const [showResult, setShowResult] = useState(false);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({ weight: initialWeight ? String(initialWeight) : '', age: '', goal: 'general', activity: 'sedentary', pregnant: false, ckd: false });

  useEffect(() => {
    if (initialWeight && !form.weight) setForm(f => ({ ...f, weight: String(initialWeight) }));
  }, [initialWeight]);

  const calculate = () => {
    const weight = parseFloat(form.weight);
    const age = parseInt(form.age);
    if (!weight || !age) return null;

    if (form.ckd) return { override: true, message: 'Protein needs with kidney disease require individualised assessment by a clinician or dietitian.' };

    if (form.pregnant) return {
      isPregnant: true,
      message: 'Protein needs during pregnancy and breastfeeding are based on Australian/NZ Nutrient Reference Values. Please consult your healthcare provider.',
      estimatedRange: '60–80g/day (NRV-based estimate)',
    };

    let min = age >= 65 ? 1.0 : 0.8;
    let max = age >= 65 ? 1.2 : 1.0;
    let rationale = age >= 65 ? 'Older adults need more protein to maintain muscle mass.' : '';

    if (form.goal === 'weight-loss')   { min = Math.max(min, 1.2); max = 1.6; rationale += (rationale ? ' ' : '') + 'Higher protein helps preserve muscle during weight loss.'; }
    else if (form.goal === 'muscle')   { min = Math.max(min, 1.2); max = 1.8; rationale += (rationale ? ' ' : '') + 'Resistance training increases protein requirements.'; }
    else if (form.goal === 'ageing')   { min = Math.max(min, 1.0); max = 1.2; rationale += (rationale ? ' ' : '') + 'Adequate protein supports healthy ageing.'; }

    if (form.activity === 'active' && max < 1.4)    max = Math.min(max + 0.2, 1.4);
    else if (form.activity === 'training' && max < 1.6) max = Math.min(max + 0.2, 1.8);

    const minTotal = Math.round(weight * min);
    const maxTotal = Math.round(weight * max);
    return { minTotal, maxTotal, minGPerKg: min.toFixed(1), maxGPerKg: max.toFixed(1), perMealMin: Math.round(minTotal / 3), perMealMax: Math.round(maxTotal / 3), rationale };
  };

  const result = showResult ? calculate() : null;

  const handleCopy = () => {
    const r = calculate() as { minTotal: number; maxTotal: number; minGPerKg: string; maxGPerKg: string };
    if (r && !('override' in r) && !('isPregnant' in r)) {
      navigator.clipboard.writeText(`Daily protein target: ${r.minTotal}-${r.maxTotal}g/day (${r.minGPerKg}-${r.maxGPerKg} g/kg/day)`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const exampleFoods = [
    { food: 'Chicken breast (100g)', protein: '~31g' },
    { food: 'Greek yogurt (170g)', protein: '~17g' },
    { food: 'Eggs (2 large)', protein: '~13g' },
    { food: 'Salmon (100g)', protein: '~25g' },
    { food: 'Lentils (1 cup)', protein: '~18g' },
    { food: 'Tofu (100g)', protein: '~8g' },
  ];

  return (
    <div className="space-y-4">
      {!showResult ? (
        <form onSubmit={e => { e.preventDefault(); if (form.weight && form.age) setShowResult(true); }} className="space-y-4">
          {/* Mode toggle */}
          <div className="flex gap-1 bg-[#F6F3EE] rounded-xl p-1">
            {(['quick', 'advanced'] as const).map(m => (
              <button key={m} type="button" onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize ${mode === m ? 'bg-white shadow-sm text-[#1B3D34] font-semibold' : 'text-[#747B7D]'}`}>
                {m === 'quick' ? 'Quick' : 'Advanced'}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#3C4346] mb-1.5 uppercase tracking-wide">Weight (kg)</label>
            <input type="number" required value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })}
              className={inputClass} placeholder="e.g. 70" min="30" max="300" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#3C4346] mb-1.5 uppercase tracking-wide">Age (years)</label>
            <input type="number" required value={form.age} onChange={e => setForm({ ...form, age: e.target.value })}
              className={inputClass} placeholder="e.g. 45" min="18" max="120" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#3C4346] mb-1.5 uppercase tracking-wide">Primary Goal</label>
            <select value={form.goal} onChange={e => setForm({ ...form, goal: e.target.value })} className={selectClass}>
              <option value="general">General health</option>
              <option value="weight-loss">Weight loss</option>
              <option value="muscle">Strength & muscle building</option>
              <option value="ageing">Healthy ageing (65+)</option>
            </select>
          </div>

          {mode === 'advanced' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-[#3C4346] mb-1.5 uppercase tracking-wide">Activity Level</label>
                <select value={form.activity} onChange={e => setForm({ ...form, activity: e.target.value })} className={selectClass}>
                  <option value="sedentary">Sedentary (desk job, minimal activity)</option>
                  <option value="active">Active (regular walking, light exercise)</option>
                  <option value="training">Resistance training (3+ sessions/week)</option>
                </select>
              </div>
              <label className="flex items-center gap-3 bg-[#0F6D6D]/10 rounded-xl p-4 cursor-pointer">
                <input type="checkbox" checked={form.pregnant} onChange={e => setForm({ ...form, pregnant: e.target.checked })} className="w-4 h-4 accent-[#1B3D34]" />
                <span className="text-sm font-medium text-[#1B3D34]">Pregnant or breastfeeding</span>
              </label>
              <label className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 cursor-pointer">
                <input type="checkbox" checked={form.ckd} onChange={e => setForm({ ...form, ckd: e.target.checked })} className="w-4 h-4 accent-red-600" />
                <span className="text-sm font-medium text-red-900">Chronic kidney disease (CKD)</span>
              </label>
            </>
          )}

          <button type="submit" className={btnPrimary}>Calculate My Protein Target</button>
        </form>
      ) : (
        <div className="space-y-4">
          {(result as { override?: boolean })?.override ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3">
              <AlertTriangle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900 mb-1">Clinical Assessment Required</p>
                <p className="text-sm text-red-800 leading-relaxed">{(result as { message: string }).message}</p>
              </div>
            </div>
          ) : (result as { isPregnant?: boolean })?.isPregnant ? (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-start gap-3">
              <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900 mb-1">Pregnancy / Breastfeeding</p>
                <p className="text-sm text-blue-800 leading-relaxed mb-2">{(result as { message: string }).message}</p>
                <p className="text-sm font-bold text-blue-900">{(result as { estimatedRange: string }).estimatedRange}</p>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-br from-[#1B3D34] to-[#0F6D6D] rounded-2xl p-6 text-center text-white">
                <p className="text-white/70 text-sm mb-1">Your Daily Protein Target</p>
                <p className="text-5xl font-bold mb-1">{(result as { minTotal: number; maxTotal: number }).minTotal}–{(result as { minTotal: number; maxTotal: number }).maxTotal}g</p>
                <p className="text-white/80 text-sm">{(result as { minGPerKg: string; maxGPerKg: string }).minGPerKg}–{(result as { minGPerKg: string; maxGPerKg: string }).maxGPerKg} g/kg/day</p>
              </div>

              {(result as { rationale: string }).rationale && (
                <div className="bg-[#0F6D6D]/10 border border-[#0F6D6D]/20 rounded-2xl p-4 flex items-start gap-3">
                  <Info size={15} className="text-[#0F6D6D] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-[#1B3D34] leading-relaxed">{(result as { rationale: string }).rationale}</p>
                </div>
              )}

              <div className="bg-[#F6F3EE] border border-[#E7E5E1] rounded-2xl p-4">
                <p className="text-xs font-bold text-[#3C4346] uppercase tracking-wide mb-1">Per Meal</p>
                <p className="text-sm text-[#3C4346] leading-relaxed">
                  Aim for <strong className="text-[#1B3D34]">{(result as { perMealMin: number; perMealMax: number }).perMealMin}–{(result as { perMealMin: number; perMealMax: number }).perMealMax}g per meal</strong> across 3 main meals.
                </p>
              </div>

              <div>
                <p className="text-xs font-bold text-[#3C4346] uppercase tracking-wide mb-2">Example Protein Sources</p>
                <div className="grid grid-cols-2 gap-2">
                  {exampleFoods.map(item => (
                    <div key={item.food} className="bg-[#0F6D6D]/10 rounded-xl p-3">
                      <p className="text-xs font-medium text-[#1B3D34]">{item.food}</p>
                      <p className="text-sm font-bold text-[#0F6D6D]">{item.protein}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={handleCopy} className={btnOutline + ' flex items-center justify-center gap-2'}>
                {copied ? <><Check size={15} /> Copied!</> : <><Copy size={15} /> Copy My Target</>}
              </button>
            </>
          )}

          <button onClick={() => { setForm({ weight: initialWeight ? String(initialWeight) : '', age: '', goal: 'general', activity: 'sedentary', pregnant: false, ckd: false }); setShowResult(false); }} className={btnOutline}>
            Calculate Again
          </button>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="text-xs text-amber-900 leading-relaxed">
              <strong>Important:</strong> This is a general estimate. It does not replace personalised advice — especially with kidney disease, pregnancy, or complex conditions. Consult your GP or dietitian.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Food Protein Lookup ──────────────────────────────────────────
function FoodProteinLookup() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodSearchResult[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodDetail | null>(null);
  const [amount, setAmount] = useState('100');
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (searchQuery.length < 3) { setSearchResults([]); setShowResults(false); return; }
    const t = setTimeout(async () => {
      setIsSearching(true); setError('');
      try {
        const results = await searchFoods(searchQuery, 10);
        setSearchResults(results); setShowResults(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to search foods.');
        setSearchResults([]);
      } finally { setIsSearching(false); }
    }, 500);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const handleSelect = async (food: FoodSearchResult) => {
    setIsLoading(true); setError(''); setShowResults(false);
    try {
      const details = await getFoodDetails(food.fdcId);
      setSelectedFood(details);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load food details.');
    } finally { setIsLoading(false); }
  };

  const getProteinData = () => {
    if (!selectedFood) return null;
    const p = getProteinNutrient(selectedFood.foodNutrients);
    if (!p) return null;
    const userAmount = parseFloat(amount) || 100;
    return { per100g: p.amount.toFixed(1), total: ((p.amount * userAmount) / 100).toFixed(1), unit: p.nutrient.unitName };
  };

  const proteinData = getProteinData();
  const quickTerms = ['Chicken breast', 'Salmon', 'Greek yogurt', 'Eggs', 'Lentils', 'Tofu'];

  return (
    <div className="space-y-4 relative">
      <div className="flex items-start gap-3 bg-[#0F6D6D]/10 border border-[#0F6D6D]/20 rounded-2xl p-4">
        <Info size={16} className="text-[#0F6D6D] mt-0.5 flex-shrink-0" />
        <p className="text-sm text-[#1B3D34]">Search any food to find its protein content using USDA data.</p>
      </div>

      {!selectedFood ? (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#3C4346] mb-1.5 uppercase tracking-wide">Search Food</label>
            <div className="relative">
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className={inputClass + ' pr-10'} placeholder="e.g. chicken breast, Greek yogurt" />
              {isSearching && <Loader2 size={16} className="absolute right-3 top-3.5 text-[#0F6D6D] animate-spin" />}
            </div>
            <p className="text-xs text-[#747B7D] mt-1">Type at least 3 characters to search</p>
          </div>

          {showResults && searchResults.length > 0 && (
            <div className="border border-[#E7E5E1] rounded-2xl overflow-hidden max-h-56 overflow-y-auto">
              {searchResults.map(food => (
                <button key={food.fdcId} onClick={() => handleSelect(food)}
                  className="w-full text-left px-4 py-3 hover:bg-[#F6F3EE] border-b border-[#E7E5E1] last:border-b-0 transition-colors">
                  <p className="text-sm font-medium text-[#1B3D34]">{food.description}</p>
                  <p className="text-xs text-[#747B7D] mt-0.5">{food.dataType}{food.brandOwner && ` · ${food.brandOwner}`}</p>
                </button>
              ))}
            </div>
          )}

          {showResults && searchResults.length === 0 && !isSearching && (
            <p className="text-sm text-[#747B7D] text-center py-4">No foods found. Try a different term.</p>
          )}

          {error && <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-800">{error}</div>}

          <div>
            <p className="text-xs font-bold text-[#3C4346] uppercase tracking-wide mb-2">Popular Searches</p>
            <div className="flex flex-wrap gap-2">
              {quickTerms.map(term => (
                <button key={term} onClick={() => setSearchQuery(term)}
                  className="px-3 py-1.5 text-xs bg-[#0F6D6D]/10 text-[#0F6D6D] font-medium rounded-xl hover:bg-[#0F6D6D] hover:text-white transition-colors">
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-[#0F6D6D]/10 border border-[#0F6D6D]/20 rounded-2xl p-4">
            <p className="text-xs text-[#0F6D6D] font-semibold mb-1">Selected Food</p>
            <p className="text-sm font-bold text-[#1B3D34]">{selectedFood.description}</p>
            <p className="text-xs text-[#747B7D] mt-0.5">{selectedFood.dataType}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#3C4346] mb-1.5 uppercase tracking-wide">Amount (grams)</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
              className={inputClass} placeholder="100" min="1" max="10000" />
          </div>

          {proteinData ? (
            <div className="space-y-3">
              <div className="bg-[#F6F3EE] border border-[#E7E5E1] rounded-2xl p-4">
                <p className="text-xs text-[#747B7D] mb-1">Protein per 100g</p>
                <p className="text-2xl font-bold text-[#0F6D6D]">{proteinData.per100g}{proteinData.unit}</p>
              </div>
              <div className="bg-gradient-to-br from-[#1B3D34] to-[#0F6D6D] rounded-2xl p-6 text-white text-center">
                <p className="text-white/70 text-sm mb-1">Total Protein in {amount}g</p>
                <p className="text-5xl font-bold mb-1">{proteinData.total}</p>
                <p className="text-white/80">{proteinData.unit} protein</p>
              </div>
              <div className="bg-[#DCC9B0]/35 border border-[#DCC9B0] rounded-2xl p-4">
                <p className="text-sm text-[#8A4D3C] leading-relaxed">
                  This provides approximately <strong>{Math.round((parseFloat(proteinData.total) / 25) * 100)}%</strong> of a typical 25g protein meal target.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">No protein data available for this item.</div>
          )}

          <button onClick={() => { setSelectedFood(null); setSearchQuery(''); setAmount('100'); }} className={btnOutline}>
            Search Another Food
          </button>
        </div>
      )}

      <div className="pt-3 border-t border-[#E7E5E1] space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-[#747B7D]">
          <ExternalLink size={11} />
          <span>Data: <a href="https://fdc.nal.usda.gov/" target="_blank" rel="noopener noreferrer" className="text-[#0F6D6D] hover:underline">USDA FoodData Central</a></span>
        </div>
        <p className="text-xs text-[#747B7D] leading-relaxed">Protein content may vary by brand and preparation. Use as a guide only.</p>
      </div>

      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-2xl">
          <div className="text-center">
            <Loader2 size={28} className="text-[#1B3D34] animate-spin mx-auto mb-2" />
            <p className="text-sm text-[#747B7D]">Loading food details…</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────
type ToolId = 'bmi' | 'protein' | 'lookup';

const TOOLS: {
  id: ToolId; label: string; icon: typeof Calculator;
  description: string; sub: string;
  cardBg: string; border: string; iconColour: string; iconBg: string;
}[] = [
  {
    id: 'bmi', label: 'BMI', icon: Calculator,
    description: 'Calculate your Body Mass Index', sub: 'Body Mass Index',
    cardBg: 'bg-[#0F6D6D]/10', border: 'border-[#0F6D6D]/25',
    iconColour: 'text-[#0F6D6D]', iconBg: 'bg-[#0F6D6D]/15',
  },
  {
    id: 'protein', label: 'Protein', icon: Utensils,
    description: 'Find your daily protein goal', sub: 'Daily target',
    cardBg: 'bg-[#B8735E]/10', border: 'border-[#B8735E]/25',
    iconColour: 'text-[#8A4D3C]', iconBg: 'bg-[#B8735E]/15',
  },
  {
    id: 'lookup', label: 'Food Lookup', icon: Search,
    description: 'Search protein content by food', sub: 'Search by food',
    cardBg: 'bg-[#1B3D34]/10', border: 'border-[#1B3D34]/20',
    iconColour: 'text-[#1B3D34]', iconBg: 'bg-[#1B3D34]/15',
  },
];

export function PatientTools() {
  const [active, setActive] = useState<ToolId>('bmi');
  const tool = TOOLS.find(t => t.id === active)!;
  const { patient } = usePatientData();;

  return (
    <AppShell role="patient" title="Health Tools" showBack>
      <div className="space-y-5">
        {/* Tab selector */}
        <div className="grid grid-cols-3 gap-2">
          {TOOLS.map(t => {
            const Icon = t.icon;
            const isActive = active === t.id;
            return (
              <button key={t.id} onClick={() => setActive(t.id)}
                className={`flex flex-col items-center gap-2 rounded-2xl border py-4 px-2 transition-all shadow-sm ${isActive ? 'bg-[#1B3D34] border-[#1B3D34]' : `${t.cardBg} ${t.border}`}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isActive ? 'bg-white/15' : t.iconBg}`}>
                  <Icon size={18} strokeWidth={1.8} className={isActive ? 'text-white' : t.iconColour} />
                </div>
                <div className="text-center">
                  <p className={`text-[11px] font-bold leading-tight ${isActive ? 'text-white' : t.iconColour}`}>{t.label}</p>
                  <p className={`text-[9px] leading-tight mt-0.5 ${isActive ? 'text-white/65' : 'text-[#747B7D]'}`}>{t.sub}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active tool card */}
        <div className="bg-white rounded-2xl border border-[#E7E5E1] shadow-sm overflow-hidden">
          <div className="bg-gradient-to-br from-[#1B3D34] to-[#0F6D6D] px-5 py-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <tool.icon size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">{tool.label}</p>
              <p className="text-white/70 text-xs">{tool.description}</p>
            </div>
          </div>
          <div className="p-5">
            {active === 'bmi'     && <BMICalculator initialHeight={patient?.heightCm} initialWeight={patient?.currentWeightKg} goalWeightKg={patient?.goalWeightKg} />}
            {active === 'protein' && <ProteinCalculator initialWeight={patient?.currentWeightKg} />}
            {active === 'lookup'  && <FoodProteinLookup />}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
