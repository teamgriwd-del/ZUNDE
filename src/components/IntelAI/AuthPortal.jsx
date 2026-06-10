import React, { useState } from 'react';
import {
  Sprout, ShoppingBag, Truck, ArrowRight, ArrowLeft,
  Phone, Mail, MapPin, Building2, CheckCircle, Stethoscope,
} from 'lucide-react';

// ── data ───────────────────────────────────────────────────────────────────
const ROLES = [
  {
    name: 'Farmer',
    icon: Sprout,
    color: 'bg-zunde-green',
    border: 'border-zunde-green',
    desc: 'Register your herd, track health, sell livestock and order medicines.',
  },
  {
    name: 'Veterinarian',
    icon: Stethoscope,
    color: 'bg-blue-600',
    border: 'border-blue-500',
    desc: 'Issue health certificates, manage outbreaks and consult farmers.',
  },
  {
    name: 'Supplier',
    icon: Truck,
    color: 'bg-orange-500',
    border: 'border-orange-500',
    desc: 'Supply vaccines, medicines and feed to registered farms.',
  },
  {
    name: 'Retailer',
    icon: ShoppingBag,
    color: 'bg-purple-600',
    border: 'border-purple-600',
    desc: 'Browse certified livestock listings and acquire trade certificates.',
  },
];

const PROVINCES = [
  'Mashonaland West', 'Mashonaland Central', 'Mashonaland East',
  'Matabeleland North', 'Matabeleland South', 'Midlands',
  'Manicaland', 'Masvingo', 'Harare', 'Bulawayo'
];

const DISTRICTS = {
  'Mashonaland West':    ['Chegutu', 'Hurungwe', 'Kariba', 'Makonde', 'Mhondoro-Ngezi', 'Sanyati', 'Zvimba'],
  'Mashonaland Central': ['Bindura', 'Centenary', 'Guruve', 'Mount Darwin', 'Mazowe', 'Shamva'],
  'Mashonaland East':    ['Chikomba', 'Goromonzi', 'Marondera', 'Mudzi', 'Murehwa', 'Mutoko'],
  'Matabeleland North':  ['Binga', 'Hwange', 'Lupane', 'Nkayi', 'Tsholotsho'],
  'Matabeleland South':  ['Beitbridge', 'Bulilima', 'Gwanda', 'Insiza', 'Matobo'],
  'Midlands':            ['Chirumhanzu', 'Gokwe North', 'Gokwe South', 'Gweru', 'Kwekwe', 'Shurugwi'],
  'Manicaland':          ['Buhera', 'Chimanimani', 'Chipinge', 'Makoni', 'Mutare', 'Nyanga'],
  'Masvingo':            ['Bikita', 'Chiredzi', 'Chivi', 'Gutu', 'Masvingo', 'Mwenezi'],
  'Harare':              ['Harare Urban', 'Epworth', 'Seke Rural'],
  'Bulawayo':            ['Bulawayo Urban', 'Umguza'],
};

const SPECIES_OPTIONS = ['Cattle', 'Goat', 'Sheep', 'Pig', 'Poultry', 'Mixed'];
const SUPPLY_CATEGORIES = ['Vaccines', 'Antibiotics', 'Antiparasitcs', 'Feed Supplements', 'Equipment', 'All Products'];

const STEPS = ['Role', 'Personal', 'Organization', 'Details', 'Confirm'];

// ── helpers ────────────────────────────────────────────────────────────────
const Field = ({ label, required, children }) => (
  <div className="space-y-1.5">
    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">
      {label}{required && <span className="text-red-400 ml-1">*</span>}
    </label>
    {children}
  </div>
);

const inputCls = 'w-full p-3.5 bg-gray-50 rounded-xl border-2 border-transparent focus:border-zunde-green outline-none font-semibold text-sm text-gray-800 placeholder:text-gray-400 transition';
const selectCls = inputCls + ' appearance-none cursor-pointer';

// ── component ──────────────────────────────────────────────────────────────
const AuthPortal = ({ onLogin }) => {
  const [step, setStep] = useState(0);          // 0-4
  const [isReturning, setIsReturning] = useState(true);  // login vs register
  const [loginName, setLoginName] = useState('');
  const [loginRole, setLoginRole] = useState('Farmer');

  const [form, setForm] = useState({
    // step 0
    role: 'Farmer',
    // step 1 — personal
    fullName: '', phone: '', email: '',
    // step 2 — organisation
    orgName: '', province: 'Mashonaland West', district: '', physicalAddress: '',
    // step 3 — role-specific
    // farmer
    farmSize: '', species: [],
    // vet
    licenseNumber: '', speciality: '',
    // supplier
    businessReg: '', supplyCategories: [],
    // retailer
    retailerReg: '', tradingAreas: '',
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const toggleArr = (k, v) => setForm(p => ({ ...p, [k]: p[k].includes(v) ? p[k].filter(x => x !== v) : [...p[k], v] }));

  const role     = ROLES.find(r => r.name === form.role) || ROLES[0];
  const districts = DISTRICTS[form.province] || [];

  const buildUser = () => ({
    name:     form.fullName,
    phone:    form.phone,
    email:    form.email,
    org:      form.orgName,
    province: form.province,
    district: form.district,
    address:  form.physicalAddress,
    role:     form.role,
    // role extras
    farmSize:          form.farmSize,
    species:           form.species,
    licenseNumber:     form.licenseNumber,
    speciality:        form.speciality,
    businessReg:       form.businessReg || form.retailerReg,
    supplyCategories:  form.supplyCategories,
    tradingAreas:      form.tradingAreas,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${form.fullName || 'ZUNDE'}`,
  });

  // ── quick login ──
  const handleLogin = (e) => {
    e.preventDefault();
    if (!loginName.trim()) return;
    onLogin({
      name: loginName, role: loginRole, org: '', province: 'Mashonaland West',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${loginName}`,
    });
  };

  // ── step validation ──
  const canAdvance = () => {
    if (step === 1) return form.fullName.trim() && form.phone.trim();
    if (step === 2) return form.orgName.trim() && form.province;
    return true;
  };

  const advance  = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const back     = () => setStep(s => Math.max(s - 1, 0));
  const confirm  = () => onLogin(buildUser());

  // ── step renderers ──
  const renderStep0 = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-2xl font-black text-gray-900 mb-1">Choose Your Role</h3>
        <p className="text-sm text-gray-400 font-medium">Your role determines what you can see and do on ZUNDE.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {ROLES.map(r => (
          <button
            key={r.name}
            type="button"
            onClick={() => set('role', r.name)}
            className={`p-5 rounded-2xl border-2 text-left transition hover:shadow-md ${form.role === r.name ? `${r.border} bg-gray-50 shadow-md` : 'border-gray-100 hover:border-gray-200'}`}
          >
            <div className={`w-10 h-10 rounded-xl ${form.role === r.name ? r.color : 'bg-gray-100'} flex items-center justify-center mb-3 transition`}>
              <r.icon size={20} className={form.role === r.name ? 'text-white' : 'text-gray-400'} />
            </div>
            <p className="text-sm font-black text-gray-800 mb-1">{r.name}</p>
            <p className="text-[10px] text-gray-400 font-medium leading-snug">{r.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-2xl font-black text-gray-900 mb-1">Your Personal Details</h3>
        <p className="text-sm text-gray-400 font-medium">This is how other stakeholders will identify and contact you.</p>
      </div>
      <Field label="Full Name" required>
        <input className={inputCls} type="text" placeholder="e.g. Tatenda Moyo" value={form.fullName} onChange={e => set('fullName', e.target.value)} />
      </Field>
      <Field label="Phone Number" required>
        <div className="relative">
          <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className={inputCls + ' pl-10'} type="tel" placeholder="+263 77 123 4567" value={form.phone} onChange={e => set('phone', e.target.value)} />
        </div>
      </Field>
      <Field label="Email Address">
        <div className="relative">
          <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className={inputCls + ' pl-10'} type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
        </div>
      </Field>
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-[10px] text-blue-700 font-medium">
        Your phone number is used so farmers, vets, and suppliers can reach you directly through the ZUNDE directory.
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-2xl font-black text-gray-900 mb-1">Your Organisation</h3>
        <p className="text-sm text-gray-400 font-medium">
          {form.role === 'Farmer' ? 'Your farm name and location.' :
           form.role === 'Veterinarian' ? 'Your practice or government department.' :
           form.role === 'Supplier' ? 'Your supply business details.' :
           'Your trading business details.'}
        </p>
      </div>
      <Field label={form.role === 'Farmer' ? 'Farm Name' : 'Organisation / Business Name'} required>
        <div className="relative">
          <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className={inputCls + ' pl-10'} type="text"
            placeholder={form.role === 'Farmer' ? 'e.g. Moyo Family Farm' : form.role === 'Veterinarian' ? 'e.g. DVS Mashonaland West' : 'e.g. AgroChem Zimbabwe'}
            value={form.orgName} onChange={e => set('orgName', e.target.value)} />
        </div>
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Province" required>
          <div className="relative">
            <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <select className={selectCls + ' pl-9'} value={form.province} onChange={e => { set('province', e.target.value); set('district', ''); }}>
              {PROVINCES.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
        </Field>
        <Field label="District">
          <select className={selectCls} value={form.district} onChange={e => set('district', e.target.value)} disabled={!districts.length}>
            <option value="">Select district...</option>
            {districts.map(d => <option key={d}>{d}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Physical Address / Farm Location">
        <input className={inputCls} type="text" placeholder="e.g. Plot 23, Chegutu Road, Zvimba" value={form.physicalAddress} onChange={e => set('physicalAddress', e.target.value)} />
      </Field>
    </div>
  );

  const renderStep3 = () => {
    if (form.role === 'Farmer') return (
      <div className="space-y-4">
        <div>
          <h3 className="text-2xl font-black text-gray-900 mb-1">Farm Details</h3>
          <p className="text-sm text-gray-400 font-medium">Help vets and suppliers understand the scale of your operation.</p>
        </div>
        <Field label="Farm Size (hectares)">
          <input className={inputCls} type="number" min="0" placeholder="e.g. 50" value={form.farmSize} onChange={e => set('farmSize', e.target.value)} />
        </Field>
        <Field label="Main Livestock Species (select all that apply)">
          <div className="flex flex-wrap gap-2 mt-1">
            {SPECIES_OPTIONS.map(s => (
              <button key={s} type="button" onClick={() => toggleArr('species', s)}
                className={`px-3.5 py-2 rounded-xl border-2 text-xs font-black uppercase tracking-wide transition ${form.species.includes(s) ? 'bg-zunde-green text-white border-zunde-green' : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-zunde-green/40'}`}>
                {s}
              </button>
            ))}
          </div>
        </Field>
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-[11px] text-green-700 font-medium">
          This helps the ZUNDE AI recommend the right vaccine schedules and dosages for your specific livestock.
        </div>
      </div>
    );

    if (form.role === 'Veterinarian') return (
      <div className="space-y-4">
        <div>
          <h3 className="text-2xl font-black text-gray-900 mb-1">Professional Details</h3>
          <p className="text-sm text-gray-400 font-medium">Your credentials verify your authority to issue health certificates.</p>
        </div>
        <Field label="DVS License Number" required>
          <input className={inputCls} type="text" placeholder="e.g. DVS-ZIM-2024-0045" value={form.licenseNumber} onChange={e => set('licenseNumber', e.target.value)} />
        </Field>
        <Field label="Speciality">
          <select className={selectCls} value={form.speciality} onChange={e => set('speciality', e.target.value)}>
            <option value="">Select speciality...</option>
            {['General Practice', 'Tick-borne Diseases', 'Reproductive Health', 'Surgery', 'FMD & CBPP Specialist', 'Emergency Response'].map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-[11px] text-blue-700 font-medium">
          Your license number is verified against the DVS Zimbabwe registry. Farmers can search for you by name and speciality.
        </div>
      </div>
    );

    if (form.role === 'Supplier') return (
      <div className="space-y-4">
        <div>
          <h3 className="text-2xl font-black text-gray-900 mb-1">Supply Details</h3>
          <p className="text-sm text-gray-400 font-medium">Farmers search for suppliers by product category and province.</p>
        </div>
        <Field label="Business Registration Number">
          <input className={inputCls} type="text" placeholder="e.g. BP 12345/2024" value={form.businessReg} onChange={e => set('businessReg', e.target.value)} />
        </Field>
        <Field label="Product Categories (select all that apply)">
          <div className="flex flex-wrap gap-2 mt-1">
            {SUPPLY_CATEGORIES.map(s => (
              <button key={s} type="button" onClick={() => toggleArr('supplyCategories', s)}
                className={`px-3.5 py-2 rounded-xl border-2 text-xs font-black uppercase tracking-wide transition ${form.supplyCategories.includes(s) ? 'bg-orange-500 text-white border-orange-500' : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-orange-400'}`}>
                {s}
              </button>
            ))}
          </div>
        </Field>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-[11px] text-orange-700 font-medium">
          Farmers search the supplier directory when they need to restock. Your product categories determine when you appear.
        </div>
      </div>
    );

    if (form.role === 'Retailer') return (
      <div className="space-y-4">
        <div>
          <h3 className="text-2xl font-black text-gray-900 mb-1">Trading Details</h3>
          <p className="text-sm text-gray-400 font-medium">Farmers and vets verify your trading identity before completing a sale.</p>
        </div>
        <Field label="Business Registration Number">
          <input className={inputCls} type="text" placeholder="e.g. BP 67890/2023" value={form.retailerReg} onChange={e => set('retailerReg', e.target.value)} />
        </Field>
        <Field label="Trading Areas / Provinces Served">
          <input className={inputCls} type="text" placeholder="e.g. Mashonaland West, Midlands, Harare" value={form.tradingAreas} onChange={e => set('tradingAreas', e.target.value)} />
        </Field>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-[11px] text-purple-700 font-medium">
          Your registration number is attached to every bid you place, ensuring farmers know they are selling to a verified trader.
        </div>
      </div>
    );
    return null;
  };

  const renderStep4 = () => {
    const user = buildUser();
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-2xl font-black text-gray-900 mb-1">Confirm Your Identity</h3>
          <p className="text-sm text-gray-400 font-medium">Review your details before creating your ZUNDE Digital ID.</p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
          {/* Role badge */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black text-white ${role.color}`}>
            <role.icon size={13} /> {form.role}
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: 'Full Name',     value: form.fullName   },
              { label: 'Phone',         value: form.phone      },
              { label: 'Email',         value: form.email || '—' },
              { label: 'Organisation',  value: form.orgName    },
              { label: 'Province',      value: form.province   },
              { label: 'District',      value: form.district || '—' },
              form.physicalAddress && { label: 'Address', value: form.physicalAddress },
              form.farmSize       && { label: 'Farm Size', value: `${form.farmSize} ha` },
              form.species.length && { label: 'Species', value: form.species.join(', ') },
              form.licenseNumber  && { label: 'DVS License', value: form.licenseNumber },
              form.speciality     && { label: 'Speciality', value: form.speciality },
              (form.businessReg || form.retailerReg) && { label: 'Business Reg', value: form.businessReg || form.retailerReg },
              form.supplyCategories.length && { label: 'Products', value: form.supplyCategories.join(', ') },
              form.tradingAreas   && { label: 'Trading Areas', value: form.tradingAreas },
            ].filter(Boolean).map(f => f && (
              <div key={f.label}>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wide">{f.label}</p>
                <p className="font-bold text-gray-800 truncate">{f.value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-zunde-green/5 border border-zunde-green/20 rounded-xl p-3 text-[11px] text-gray-600 font-medium leading-relaxed">
          Your profile will be visible in the ZUNDE stakeholder directory. Other registered users — farmers, vets, suppliers, and retailers — can search for you by name, organisation, or province.
        </div>
      </div>
    );
  };

  const stepContent = [renderStep0, renderStep1, renderStep2, renderStep3, renderStep4];

  // ── render ──
  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-gray-950 overflow-hidden font-sans">
      {/* Background glows */}
      <div className="absolute top-[-15%] left-[-10%] w-[45%] h-[45%] bg-zunde-green/20 rounded-full blur-[140px]" aria-hidden="true" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] bg-yellow-400/10 rounded-full blur-[140px]" aria-hidden="true" />

      <div className="bg-white w-full max-w-5xl rounded-[40px] shadow-2xl overflow-hidden flex relative z-10 animate-in fade-in zoom-in duration-400" style={{ height: 680 }}>

        {/* ── Left branding panel ── */}
        <div className="w-[38%] bg-zunde-green p-12 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Dot grid */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} aria-hidden="true" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-zunde-green font-black text-2xl shadow-lg">R</div>
              <div>
                <p className="text-base font-black tracking-tight leading-none">ZUNDE</p>
                <p className="text-[10px] font-black text-yellow-400 uppercase tracking-[2px]">RaMambo</p>
              </div>
            </div>
            <h2 className="text-3xl font-black leading-tight mb-4">Zimbabwe's Livestock Intelligence Platform</h2>
            <p className="text-green-200 text-sm font-medium leading-relaxed opacity-80">
              Connecting farmers, veterinarians, suppliers, and retailers into one verified digital ecosystem.
            </p>
          </div>

          {/* Stakeholder roles preview */}
          <div className="relative z-10 space-y-2">
            {ROLES.map(r => (
              <div key={r.name} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${form.role === r.name && !isReturning ? 'bg-white/20 border border-white/30' : 'opacity-40'}`}>
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <r.icon size={15} className="text-white" />
                </div>
                <div>
                  <p className="text-xs font-black text-white leading-none">{r.name}</p>
                  <p className="text-[9px] text-green-200 font-medium leading-none mt-0.5">{r.desc.split('.')[0]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {isReturning ? (
            /* ── Quick Login ── */
            <div className="flex-1 overflow-y-auto p-12 text-left">
              <h3 className="text-2xl font-black text-gray-900 mb-1">Welcome Back</h3>
              <p className="text-sm text-gray-400 font-medium mb-8">Select your role and enter your name to access the portal.</p>

              <form onSubmit={handleLogin} className="space-y-5">
                {/* Role selector */}
                <div className="grid grid-cols-2 gap-3">
                  {ROLES.map(r => (
                    <button key={r.name} type="button" onClick={() => setLoginRole(r.name)}
                      className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition ${loginRole === r.name ? `${r.border} bg-gray-50 shadow-sm` : 'border-gray-100 hover:border-gray-200'}`}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${loginRole === r.name ? r.color : 'bg-gray-100'}`}>
                        <r.icon size={16} className={loginRole === r.name ? 'text-white' : 'text-gray-400'} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-gray-800">{r.name}</p>
                        <p className="text-[9px] text-gray-400 font-medium truncate">{r.desc.split('.')[0]}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <Field label="Your Full Name" required>
                  <input className={inputCls} type="text" placeholder="e.g. Tatenda Moyo" required value={loginName} onChange={e => setLoginName(e.target.value)} />
                </Field>

                <button type="submit" className="w-full py-4 bg-zunde-green text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-green-700 transition flex items-center justify-center gap-2">
                  Enter Portal <ArrowRight size={15} />
                </button>
              </form>

              <p className="mt-8 text-center text-xs text-gray-400 font-medium">
                New to ZUNDE?{' '}
                <button onClick={() => { setIsReturning(false); setStep(0); }} className="text-zunde-green font-black hover:underline uppercase tracking-widest">
                  Create Digital ID
                </button>
              </p>
            </div>

          ) : (
            /* ── Multi-step Registration ── */
            <>
              {/* Progress bar */}
              <div className="px-10 pt-8 pb-0">
                <div className="flex items-center gap-1 mb-2">
                  {STEPS.map((s, i) => (
                    <React.Fragment key={s}>
                      <div className={`flex items-center gap-1.5 ${i <= step ? 'text-zunde-green' : 'text-gray-300'}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition ${
                          i < step  ? 'bg-zunde-green border-zunde-green text-white' :
                          i === step ? 'border-zunde-green text-zunde-green' :
                          'border-gray-200 text-gray-300'
                        }`}>
                          {i < step ? '✓' : i + 1}
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-wide hidden sm:block ${i === step ? 'text-gray-700' : 'text-gray-300'}`}>{s}</span>
                      </div>
                      {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 rounded-full ${i < step ? 'bg-zunde-green' : 'bg-gray-100'}`} />}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Step content */}
              <div className="flex-1 overflow-y-auto px-10 py-6">
                {stepContent[step]()}
              </div>

              {/* Navigation */}
              <div className="px-10 pb-8 flex gap-3">
                {step > 0 && (
                  <button onClick={back} className="flex items-center gap-2 px-5 py-3.5 bg-gray-100 text-gray-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition">
                    <ArrowLeft size={14} /> Back
                  </button>
                )}
                {step < STEPS.length - 1 ? (
                  <button
                    onClick={advance}
                    disabled={!canAdvance()}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-zunde-green text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-green-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Continue <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    onClick={confirm}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-zunde-green text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-green-700 transition"
                  >
                    <CheckCircle size={15} /> Create Digital ID & Enter
                  </button>
                )}
              </div>

              <p className="pb-5 text-center text-xs text-gray-400 font-medium">
                Already registered?{' '}
                <button onClick={() => setIsReturning(true)} className="text-zunde-green font-black hover:underline uppercase tracking-widest">
                  Sign In
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPortal;
