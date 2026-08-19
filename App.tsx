import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Activity, BarChart3, Check, ChevronRight, CircleUserRound, Droplets, Flame, Home, Leaf, Plus, Search, Settings2, Sparkles, Target, Trophy, Utensils, Zap, X } from 'lucide-react';

type Goal = 'build' | 'lose' | 'energy';
type Tab = 'home' | 'meals' | 'progress' | 'profile';
type User = { name: string; goal: Goal; diet: string; activity: string };
type Meal = { id: string; name: string; local: string; kcal: number; protein: number; tag: string; icon: string; description: string };

const meals: Meal[] = [
  { id: 'beso', name: 'Beso Power Bowl', local: 'በሶ + ወተት + እንቁላል', kcal: 420, protein: 22, tag: 'High protein', icon: '🥣', description: 'Roasted barley flour, milk and eggs — a practical Ethiopian breakfast with a protein boost.' },
  { id: 'misir', name: 'Misir & Eggs', local: 'ምስር + እንቁላል', kcal: 510, protein: 31, tag: 'Budget friendly', icon: '🍳', description: 'Spiced lentils with eggs: filling, protein-forward and easy to make at home.' },
  { id: 'shiro', name: 'Shiro Bowl', local: 'ሽሮ + ሰላጣ', kcal: 460, protein: 19, tag: 'Local classic', icon: '🥘', description: 'A lighter shiro plate with fresh vegetables and a measured injera portion.' },
  { id: 'tibs', name: 'Lean Siga Tibs', local: 'ስጋ + አትክልት', kcal: 590, protein: 44, tag: 'Protein', icon: '🥩', description: 'Lean beef tibs with peppers and greens for a satisfying protein-rich meal.' },
  { id: 'ater', name: 'Atter & Veg', local: 'አተር + አትክልት', kcal: 390, protein: 21, tag: 'Affordable', icon: '🫛', description: 'Split peas, vegetables and herbs — simple ingredients with strong everyday nutrition.' },
  { id: 'salad', name: 'Chicken Salad', local: 'ዶሮ + ሰላጣ', kcal: 350, protein: 36, tag: 'Light', icon: '🥗', description: 'Chicken, greens, tomato and cucumber with a simple lemon dressing.' }
];

const goals = [
  { id: 'build' as Goal, title: 'Build strength', sub: 'Get stronger & add muscle', icon: Zap },
  { id: 'lose' as Goal, title: 'Get leaner', sub: 'Build healthy habits', icon: Flame },
  { id: 'energy' as Goal, title: 'More energy', sub: 'Feel better every day', icon: Sparkles }
];

const nav = [
  { id: 'home' as Tab, label: 'Home', icon: Home },
  { id: 'meals' as Tab, label: 'Meals', icon: Utensils },
  { id: 'progress' as Tab, label: 'Progress', icon: BarChart3 },
  { id: 'profile' as Tab, label: 'Profile', icon: CircleUserRound }
];

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('yegnafit-user');
    return saved ? JSON.parse(saved) as User : null;
  });
  const [tab, setTab] = useState<Tab>('home');
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<User>({ name: '', goal: 'build', diet: 'Balanced', activity: '3–4 days' });
  const [logged, setLogged] = useState<string[]>(() => JSON.parse(localStorage.getItem('yegnafit-meals') || '[]') as string[]);
  const [water, setWater] = useState(() => Number(localStorage.getItem('yegnafit-water') || 4));
  const [meal, setMeal] = useState<Meal | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => { if (user) localStorage.setItem('yegnafit-user', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('yegnafit-meals', JSON.stringify(logged)); }, [logged]);
  useEffect(() => { localStorage.setItem('yegnafit-water', String(water)); }, [water]);

  const eaten = useMemo(() => meals.filter((m) => logged.includes(m.id)), [logged]);
  const calories = eaten.reduce((sum, m) => sum + m.kcal, 0);
  const protein = eaten.reduce((sum, m) => sum + m.protein, 0);
  const target = user?.goal === 'build' ? 2400 : user?.goal === 'lose' ? 1900 : 2100;
  const percent = Math.min(100, Math.round(calories / target * 100));
  const notify = (text: string) => { setToast(text); window.setTimeout(() => setToast(''), 1600); };

  const toggleMeal = (m: Meal) => {
    const has = logged.includes(m.id);
    setLogged((items) => has ? items.filter((id) => id !== m.id) : [...items, m.id]);
    notify(has ? 'Removed from today' : 'Added to today');
  };

  const finish = () => {
    const next = { ...draft, name: draft.name.trim() || 'Friend' };
    setUser(next);
    setTab('home');
  };

  if (!user) return <Onboarding step={step} setStep={setStep} draft={draft} setDraft={setDraft} finish={finish} />;

  return (
    <div className="min-h-screen bg-[#0b0b0e] text-white">
      <header className="sticky top-0 z-30 border-b border-white/5 bg-[#0b0b0e]/90 px-4 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <button onClick={() => setTab('home')} className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#00ff87] text-[#07100b]"><Leaf size={19} /></span>
            <b className="text-lg">የኛ<span className="text-[#00ff87]">fit</span></b>
          </button>
          <button onClick={() => setTab('profile')} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[.03] text-white/60"><CircleUserRound size={20} /></button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-28 pt-6 sm:px-6">
        {tab === 'home' && <HomeScreen user={user} calories={calories} target={target} percent={percent} protein={protein} water={water} setWater={setWater} logged={logged} setTab={setTab} openMeal={setMeal} notify={notify} />}
        {tab === 'meals' && <MealsScreen logged={logged} toggleMeal={toggleMeal} openMeal={setMeal} />}
        {tab === 'progress' && <ProgressScreen user={user} calories={calories} protein={protein} />}
        {tab === 'profile' && <ProfileScreen user={user} setUser={setUser} reset={() => { localStorage.clear(); window.location.reload(); }} />}
      </main>

      <nav className="fixed bottom-4 left-1/2 z-40 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center rounded-2xl border border-white/10 bg-[#15151c]/95 p-2 shadow-2xl backdrop-blur-xl">
        {nav.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)} className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-bold ${tab === id ? 'bg-[#00ff87]/10 text-[#00ff87]' : 'text-white/35'}`}>
            <Icon size={18} />{label}
          </button>
        ))}
        <button onClick={() => setMeal(meals[0])} className="-mt-8 ml-1 grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#00ff87] text-[#07100b] shadow-xl"><Plus size={24} /></button>
      </nav>

      {meal && <MealModal meal={meal} logged={logged.includes(meal.id)} toggle={() => toggleMeal(meal)} close={() => setMeal(null)} />}
      {toast && <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full border border-[#00ff87]/20 bg-[#15151c] px-4 py-2 text-xs font-bold shadow-xl">{toast}</div>}
    </div>
  );
}

function Onboarding({ step, setStep, draft, setDraft, finish }: { step: number; setStep: (n: number) => void; draft: User; setDraft: (u: User) => void; finish: () => void }) {
  const next = () => step < 3 ? setStep(step + 1) : finish();

  return (
    <div className="min-h-screen bg-[#0b0b0e] px-5 py-6 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-md flex-col">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#00ff87] text-[#07100b]"><Leaf size={19} /></span><b>የኛfit</b></div>
          <span className="text-xs text-white/35">{step + 1} / 4</span>
        </div>
        <div className="mt-5 flex gap-1.5">{[0,1,2,3].map((i) => <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-[#00ff87]' : 'bg-white/10'}`} />)}</div>

        <div className="flex flex-1 flex-col justify-center py-10">
          {step === 0 && <GoalStep draft={draft} setDraft={setDraft} />}
          {step === 1 && <ChoiceStep label="STEP 02" title="How do you usually eat?" sub="We keep recommendations realistic for your budget." options={['Balanced','High protein','Vegetarian','Flexible']} value={draft.diet} onSelect={(v) => setDraft({ ...draft, diet: v })} />}
          {step === 2 && <ChoiceStep label="STEP 03" title="How active are you?" sub="No judgment. Just start where you are." options={['Just starting','1–2 days','3–4 days','5+ days']} value={draft.activity} onSelect={(v) => setDraft({ ...draft, activity: v })} />}
          {step === 3 && (
            <div>
              <span className="text-xs font-bold tracking-[.2em] text-[#00ff87]">YOUR PROFILE</span>
              <h1 className="mt-3 text-4xl font-black">What should we call you?</h1>
              <p className="mt-3 text-sm text-white/45">Your demo data stays on this device.</p>
              <input autoFocus value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Your name" className="mt-10 w-full rounded-2xl border border-white/10 bg-white/[.04] px-5 py-4 text-lg outline-none focus:border-[#00ff87]/50" />
            </div>
          )}
        </div>

        <button onClick={next} className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#00ff87] font-black text-[#07100b]">{step === 3 ? 'Build my plan' : 'Continue'}<ChevronRight size={19} /></button>
        {step > 0 && <button onClick={() => setStep(step - 1)} className="mt-3 h-10 text-xs font-bold text-white/35">Back</button>}
      </div>
    </div>
  );
}

function GoalStep({ draft, setDraft }: { draft: User; setDraft: (u: User) => void }) {
  return (
    <div>
      <span className="text-xs font-bold tracking-[.2em] text-[#00ff87]">LET'S START</span>
      <h1 className="mt-3 text-4xl font-black">What should የኛfit help you do?</h1>
      <p className="mt-3 text-sm text-white/45">Pick one. You can change it later.</p>
      <div className="mt-8 space-y-3">
        {goals.map(({ id, title, sub, icon: Icon }) => {
          const selected = draft.goal === id;
          return (
            <button key={id} onClick={() => setDraft({ ...draft, goal: id })} className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left ${selected ? 'border-[#00ff87]/50 bg-[#00ff87]/[.07]' : 'border-white/10 bg-white/[.025]'}`}>
              <span className={`grid h-11 w-11 place-items-center rounded-xl ${selected ? 'bg-[#00ff87] text-[#07100b]' : 'bg-white/5 text-white/55'}`}><Icon size={20} /></span>
              <span className="flex-1"><b className="block text-sm">{title}</b><small className="mt-1 block text-xs text-white/35">{sub}</small></span>
              {selected && <Check size={18} className="text-[#00ff87]" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ChoiceStep({ label, title, sub, options, value, onSelect }: { label: string; title: string; sub: string; options: string[]; value: string; onSelect: (v: string) => void }) {
  return (
    <div>
      <span className="text-xs font-bold tracking-[.2em] text-[#00ff87]">{label}</span>
      <h1 className="mt-3 text-4xl font-black">{title}</h1>
      <p className="mt-3 text-sm text-white/45">{sub}</p>
      <div className="mt-8 grid gap-3">
        {options.map((option) => (
          <button key={option} onClick={() => onSelect(option)} className={`flex items-center justify-between rounded-2xl border p-4 text-left text-sm font-bold ${value === option ? 'border-[#00ff87]/50 bg-[#00ff87]/[.07] text-[#00ff87]' : 'border-white/10 bg-white/[.025] text-white/70'}`}>
            {option}{value === option ? <Check size={18} /> : <ChevronRight size={18} className="text-white/20" />}
          </button>
        ))}
      </div>
    </div>
  );
}

function HomeScreen({ user, calories, target, percent, protein, water, setWater, logged, setTab, openMeal, notify }: {
  user: User; calories: number; target: number; percent: number; protein: number; water: number; setWater: (n: number) => void; logged: string[]; setTab: (t: Tab) => void; openMeal: (m: Meal) => void; notify: (s: string) => void
}) {
  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#16161e] p-5 sm:p-7">
        <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[#00ff87]/10 blur-3xl" />
        <div className="relative">
          <div className="flex items-start justify-between">
            <div><p className="text-sm text-white/40">Good evening, {user.name}.</p><h1 className="mt-1 text-3xl font-black sm:text-4xl">Keep the streak alive.</h1></div>
            <span className="rounded-full bg-orange-400/10 px-3 py-1.5 text-xs font-bold text-orange-300">🔥 7 days</span>
          </div>
          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-white/30">Today's fuel</p>
              <div className="mt-2 flex items-end gap-2"><span className="text-5xl font-black">{calories.toLocaleString()}</span><span className="pb-1 text-sm text-white/30">/ {target.toLocaleString()} kcal</span></div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-[#00ff87]" style={{ width: `${percent}%` }} /></div>
              <div className="mt-2 flex justify-between text-[11px] text-white/30"><span>{percent}% of target</span><span>{Math.max(0, target - calories)} left</span></div>
            </div>
            <div className="grid grid-cols-2 gap-3"><Stat label="Protein" value={`${protein}g`} icon={<Zap size={16} />} /><Stat label="Water" value={`${water}/8`} icon={<Droplets size={16} />} /></div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_.7fr]">
        <section className="rounded-3xl border border-white/10 bg-[#16161e] p-5">
          <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-[#00ff87]">Meals</p><h2 className="mt-1 text-xl font-black">Today’s picks</h2></div><button onClick={() => setTab('meals')} className="text-xs font-bold text-white/35">See all</button></div>
          <div className="mt-4 space-y-2">{meals.slice(0,3).map((m) => <MealRow key={m.id} meal={m} active={logged.includes(m.id)} onClick={() => openMeal(m)} />)}</div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-[#16161e] p-5">
          <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-[#00ff87]">Hydration</p><h2 className="mt-1 text-xl font-black">Water</h2></div><Droplets className="text-[#00ff87]" size={20} /></div>
          <div className="mt-5 grid grid-cols-4 gap-2">{Array.from({ length: 8 }, (_, i) => <button key={i} onClick={() => setWater(i < water ? i : i + 1)} className={`h-12 rounded-xl border text-xs font-bold ${i < water ? 'border-[#00ff87]/30 bg-[#00ff87]/10 text-[#00ff87]' : 'border-white/10 bg-white/[.025] text-white/20'}`}>{i + 1}</button>)}</div>
          <button onClick={() => { setWater(Math.min(8, water + 1)); notify('Water logged'); }} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white/[.05] py-3 text-xs font-bold"><Plus size={15} />Add glass</button>
        </section>
      </div>

      <div className="grid gap-3 sm:grid-cols-3"><Quick title="10 min movement" sub="No equipment" icon={<Activity size={18} />} /><Quick title="Goal check" sub="On track" icon={<Target size={18} />} /><Quick title="Wellness score" sub="82 / 100" icon={<Trophy size={18} />} /></div>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[.025] p-4"><div className="flex items-center gap-2 text-[#00ff87]">{icon}<span className="text-[10px] font-bold uppercase tracking-wider text-white/30">{label}</span></div><p className="mt-2 text-2xl font-black">{value}</p></div>;
}

function Quick({ title, sub, icon }: { title: string; sub: string; icon: ReactNode }) {
  return <div className="rounded-2xl border border-white/10 bg-[#16161e] p-4"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#00ff87]/10 text-[#00ff87]">{icon}</span><b className="mt-3 block text-sm">{title}</b><span className="mt-1 block text-xs text-white/30">{sub}</span></div>;
}

function MealRow({ meal, active, onClick }: { meal: Meal; active: boolean; onClick: () => void }) {
  return <button onClick={onClick} className="flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-white/[.025] p-3 text-left"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/[.06] text-2xl">{meal.icon}</span><span className="min-w-0 flex-1"><b className="block truncate text-sm">{meal.name}</b><span className="mt-1 block text-xs text-white/30">{meal.local} • {meal.kcal} kcal</span></span><span className={`grid h-9 w-9 place-items-center rounded-xl ${active ? 'bg-[#00ff87] text-[#07100b]' : 'border border-white/10 text-white/35'}`}>{active ? <Check size={16} /> : <Plus size={17} />}</span></button>;
}

function MealsScreen({ logged, toggleMeal, openMeal }: { logged: string[]; toggleMeal: (m: Meal) => void; openMeal: (m: Meal) => void }) {
  return (
    <div>
      <div className="mb-5 flex items-end justify-between">
        <div><p className="text-xs font-bold uppercase tracking-wider text-[#00ff87]">Local library</p><h1 className="mt-1 text-3xl font-black">Eat like home.</h1><p className="mt-2 text-sm text-white/35">Affordable Ethiopian-friendly nutrition.</p></div>
        <button className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[.03] text-white/45"><Search size={19} /></button>
      </div>
      <div className="mb-5 flex gap-2 overflow-x-auto">{['All','High protein','Affordable','Local classic','Light'].map((tag) => <button key={tag} className="shrink-0 rounded-full border border-white/10 bg-white/[.03] px-4 py-2 text-xs font-bold text-white/45">{tag}</button>)}</div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {meals.map((m) => (
          <article key={m.id} className="rounded-3xl border border-white/10 bg-[#16161e] p-4">
            <div className="flex items-start justify-between"><span className="grid h-16 w-16 place-items-center rounded-2xl bg-white/[.04] text-4xl">{m.icon}</span><span className="rounded-full bg-[#00ff87]/10 px-2.5 py-1 text-[10px] font-bold text-[#00ff87]">{m.tag}</span></div>
            <h3 className="mt-5 text-lg font-black">{m.name}</h3><p className="mt-1 text-xs text-white/30">{m.local}</p>
            <div className="mt-4 flex gap-2 text-xs text-white/40"><span className="rounded-lg bg-white/[.04] px-2.5 py-1.5">{m.kcal} kcal</span><span className="rounded-lg bg-white/[.04] px-2.5 py-1.5">{m.protein}g protein</span></div>
            <div className="mt-4 flex gap-2"><button onClick={() => openMeal(m)} className="flex-1 rounded-xl border border-white/10 py-3 text-xs font-bold text-white/55">Details</button><button onClick={() => toggleMeal(m)} className={`flex flex-1 items-center justify-center gap-1 rounded-xl py-3 text-xs font-black ${logged.includes(m.id) ? 'bg-white/10 text-white' : 'bg-[#00ff87] text-[#07100b]'}`}>{logged.includes(m.id) ? <Check size={15} /> : <Plus size={15} />}{logged.includes(m.id) ? 'Logged' : 'Add'}</button></div>
          </article>
        ))}
      </div>
    </div>
  );
}

function ProgressScreen({ user, calories, protein }: { user: User; calories: number; protein: number }) {
  const bars = [62,74,81,58,91,76,88];
  const balance = Math.min(96, Math.round(protein / 110 * 100));
  return (
    <div className="space-y-5">
      <div><p className="text-xs font-bold uppercase tracking-wider text-[#00ff87]">Your momentum</p><h1 className="mt-1 text-3xl font-black">Progress, not perfection.</h1></div>
      <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
        <section className="rounded-3xl border border-white/10 bg-[#16161e] p-5"><p className="text-sm text-white/35">Weekly consistency</p><p className="mt-1 text-4xl font-black">82<span className="text-lg text-white/25">%</span></p><div className="mt-8 flex h-40 items-end gap-2">{bars.map((v,i) => <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><div className="w-full rounded-t-xl bg-[#00ff87]/25" style={{ height: `${v}%` }} /><span className="text-[10px] text-white/25">{['M','T','W','T','F','S','S'][i]}</span></div>)}</div></section>
        <section className="rounded-3xl border border-white/10 bg-[#16161e] p-5"><p className="text-sm text-white/35">Fitness & Wellness Profile</p><h2 className="mt-1 text-xl font-black">Your current signal</h2><div className="mt-5 space-y-4">{[['Consistency',86],['Strength trend',72],['Recovery',79],['Nutrition balance',balance]].map(([label,v]) => <div key={label as string}><div className="flex justify-between text-xs"><span className="text-white/45">{label}</span><b>{v}</b></div><div className="mt-2 h-1.5 rounded-full bg-white/5"><div className="h-full rounded-full bg-[#00ff87]" style={{ width: `${v}%` }} /></div></div>)}</div><p className="mt-5 text-[11px] leading-5 text-white/25">No harsh appearance score. We track habits and wellness signals you can influence.</p></section>
      </div>
      <div className="grid gap-3 sm:grid-cols-3"><Stat label="Today" value={`${calories} kcal`} icon={<Flame size={16} />} /><Stat label="Protein" value={`${protein}g`} icon={<Zap size={16} />} /><Stat label="Goal" value={user.goal === 'build' ? 'Strength' : user.goal === 'lose' ? 'Leaner' : 'Energy'} icon={<Target size={16} />} /></div>
    </div>
  );
}

function ProfileScreen({ user, setUser, reset }: { user: User; setUser: (u: User) => void; reset: () => void }) {
  return (
    <div className="space-y-5">
      <div><p className="text-xs font-bold uppercase tracking-wider text-[#00ff87]">Account</p><h1 className="mt-1 text-3xl font-black">Your profile.</h1></div>
      <section className="rounded-3xl border border-white/10 bg-[#16161e] p-5"><div className="flex items-center gap-4"><div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#00ff87]/10 text-[#00ff87]"><CircleUserRound size={28} /></div><div><h2 className="text-xl font-black">{user.name}</h2><p className="text-sm text-white/30">{user.diet} • {user.activity}</p></div></div><div className="mt-6 grid gap-3 sm:grid-cols-3">{[['Goal', user.goal === 'build' ? 'Build strength' : user.goal === 'lose' ? 'Get leaner' : 'More energy'], ['Diet', user.diet], ['Activity', user.activity]].map(([label,value]) => <div key={label} className="rounded-2xl border border-white/10 bg-white/[.025] p-4"><span className="text-[10px] uppercase tracking-wider text-white/25">{label}</span><b className="mt-2 block text-sm">{value}</b></div>)}</div></section>
      <section className="rounded-3xl border border-white/10 bg-[#16161e] p-5"><div className="flex items-center gap-3"><Settings2 size={18} className="text-white/50" /><div><b className="text-sm">Demo controls</b><p className="text-xs text-white/30">Data is stored locally in your browser.</p></div></div><div className="mt-4 flex gap-2"><button onClick={() => setUser({ ...user, name: user.name === 'Friend' ? 'Kira' : 'Friend' })} className="flex-1 rounded-xl border border-white/10 py-3 text-xs font-bold text-white/50">Quick edit name</button><button onClick={reset} className="flex-1 rounded-xl border border-red-400/20 bg-red-400/5 py-3 text-xs font-bold text-red-300">Reset demo</button></div></section>
    </div>
  );
}

function MealModal({ meal, logged, toggle, close }: { meal: Meal; logged: boolean; toggle: () => void; close: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#16161e] p-5 shadow-2xl">
        <div className="flex items-center justify-between"><span className="grid h-16 w-16 place-items-center rounded-2xl bg-white/[.05] text-4xl">{meal.icon}</span><button onClick={close} className="grid h-10 w-10 place-items-center rounded-xl bg-white/[.04] text-white/45"><X size={19} /></button></div>
        <h2 className="mt-5 text-2xl font-black">{meal.name}</h2><p className="mt-1 text-sm text-white/30">{meal.local}</p>
        <div className="mt-5 grid grid-cols-2 gap-2"><div className="rounded-2xl bg-white/[.04] p-4"><span className="text-[10px] uppercase text-white/25">Calories</span><b className="mt-1 block text-xl">{meal.kcal}</b></div><div className="rounded-2xl bg-white/[.04] p-4"><span className="text-[10px] uppercase text-white/25">Protein</span><b className="mt-1 block text-xl">{meal.protein}g</b></div></div>
        <p className="mt-5 text-sm leading-6 text-white/45">{meal.description}</p>
        <button onClick={toggle} className={`mt-6 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-black ${logged ? 'bg-white/10 text-white' : 'bg-[#00ff87] text-[#07100b]'}`}>{logged ? <Check size={18} /> : <Plus size={18} />}{logged ? 'Logged today' : 'Add to today'}</button>
      </div>
    </div>
  );
}
