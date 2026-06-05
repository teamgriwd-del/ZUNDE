import React, { useState } from 'react';
import { Bot, User, ShieldCheck, ShoppingBag, Truck, ArrowRight, X, UserCircle } from 'lucide-react';

const AuthPortal = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [selectedRole, setSelectedRole] = useState('Farmer');
  const [formData, setFormData] = useState({
      name: '',
      email: '',
      province: 'Mashonaland West',
      org: ''
  });

  const roles = [
      { name: 'Farmer', icon: <User size={24} />, desc: 'Manage your Royal Herd & Health Passports', color: 'bg-zunde-green' },
      { name: 'Veterinarian', icon: <ShieldCheck size={24} />, desc: 'Issue diagnostic certificates & provincial alerts', color: 'bg-blue-600' },
      { name: 'Supplier', icon: <Truck size={24} />, desc: 'Restock the Digital Medicine Cabinet', color: 'bg-orange-500' },
      { name: 'Retailer', icon: <ShoppingBag size={24} />, desc: 'Access the RaMambo Trade Marketplace', color: 'bg-purple-600' }
  ];

  const handleSubmit = (e) => {
      e.preventDefault();
      // Simulate registration/auth
      const user = {
          ...formData,
          role: selectedRole,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name || 'Arnold'}`
      };
      onLogin(user);
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-gray-900 overflow-hidden font-sans">
        {/* Background Design Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-zunde-green/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-400/10 rounded-full blur-[120px]"></div>

        <div className="bg-white w-full max-w-5xl h-[700px] rounded-[50px] shadow-2xl overflow-hidden flex relative z-10 animate-in fade-in zoom-in duration-500">
            {/* Left Side: Branding */}
            <div className="w-2/5 bg-zunde-green p-16 text-white flex flex-col justify-between relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center space-x-3 mb-10">
                        <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center text-zunde-green font-black text-3xl shadow-lg">R</div>
                        <h1 className="text-2xl font-black tracking-tighter">ZUNDE RaMambo</h1>
                    </div>
                    <h2 className="text-5xl font-black leading-tight mb-6">Empowering the Zimbabwe Herd.</h2>
                    <p className="text-green-200 font-bold leading-relaxed text-sm opacity-80 uppercase tracking-widest">Digital Sovereignty for Local Agriculture.</p>
                </div>

                <div className="relative z-10 bg-white/10 p-6 rounded-[30px] border border-white/10 backdrop-blur-md">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center text-zunde-green"><ShieldCheck size={20} /></div>
                        <span className="text-xs font-black uppercase tracking-widest">Identity Verified</span>
                    </div>
                    <p className="text-[10px] text-green-100 font-bold leading-relaxed">By joining the RaMambo ecosystem, you gain access to regional outbreak alerts and certified medical passports.</p>
                </div>

                {/* Decorative Pattern */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10 pointer-events-none">
                    <div className="grid grid-cols-8 gap-4 rotate-12">
                        {Array(64).fill(0).map((_, i) => <div key={i} className="w-4 h-4 bg-white rounded-full"></div>)}
                    </div>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="flex-1 p-16 overflow-y-auto bg-white text-left">
                {!isRegistering ? (
                    <div className="animate-in slide-in-from-right-4 duration-500">
                        <h3 className="text-3xl font-black text-gray-800 mb-2">Welcome Back</h3>
                        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-10">Select your role to access the portal</p>
                        
                        <div className="grid grid-cols-2 gap-4 mb-10">
                            {roles.map(role => (
                                <div 
                                    key={role.name}
                                    onClick={() => setSelectedRole(role.name)}
                                    className={`p-6 rounded-[30px] border-2 cursor-pointer transition-all duration-300 ${selectedRole === role.name ? 'border-zunde-green bg-green-50 shadow-lg' : 'border-gray-100 hover:border-gray-200'}`}
                                >
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 shadow-sm ${selectedRole === role.name ? 'bg-zunde-green' : 'bg-gray-200 text-gray-400'}`}>
                                        {role.icon}
                                    </div>
                                    <h4 className="font-black text-gray-800 text-sm mb-1">{role.name}</h4>
                                    <p className="text-[10px] text-gray-400 font-bold leading-tight">{role.desc}</p>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <input 
                                type="text" 
                                placeholder="Enter Full Name" 
                                required
                                className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-zunde-green outline-none font-bold"
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                            />
                            <button className="w-full py-5 bg-zunde-green text-white rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-green-900/20 hover:scale-[1.02] transition flex items-center justify-center space-x-3">
                                <span>Enter Portal</span>
                                <ArrowRight size={18} />
                            </button>
                        </form>

                        <p className="mt-10 text-center text-xs font-bold text-gray-300">
                            Don't have a digital ID? <button onClick={() => setIsRegistering(true)} className="text-zunde-green hover:underline uppercase tracking-widest">Register Organization</button>
                        </p>
                    </div>
                ) : (
                    <div className="animate-in slide-in-from-right-4 duration-500">
                        <div className="flex justify-between items-center mb-10">
                             <button onClick={() => setIsRegistering(false)} className="text-zunde-green font-black text-xs uppercase tracking-widest hover:underline">← Back to Roles</button>
                        </div>
                        <h3 className="text-3xl font-black text-gray-800 mb-2">Register Identity</h3>
                        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-10">Connect your farm or business to the RaMambo Mesh</p>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                             <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                                    <input type="text" required className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Role</label>
                                    <input type="text" disabled className="w-full p-4 bg-gray-100 rounded-2xl font-bold border-none outline-none text-gray-400" value={selectedRole} />
                                </div>
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Organization / Farm Name</label>
                                <input type="text" required className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none outline-none" value={formData.org} onChange={e => setFormData({...formData, org: e.target.value})} />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Zimbabwe Province</label>
                                <select className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none outline-none appearance-none" value={formData.province} onChange={e => setFormData({...formData, province: e.target.value})}>
                                    <option>Mashonaland West</option><option>Mashonaland Central</option><option>Matabeleland South</option><option>Midlands</option>
                                </select>
                             </div>
                             <button className="w-full py-5 bg-zunde-green text-white rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-green-900/20 hover:scale-[1.02] transition mt-6">Create Digital ID</button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default AuthPortal;
