'use client';

import { useState } from 'react';
import { Save, Settings, Shield, Mail, User } from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';

export default function AdminSettingsClient({ user }: { user: any }) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const nameParts = formData.name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, phone: formData.phone }),
      });
      
      if (res.ok) {
        alert('Nastavení bylo úspěšně uloženo.');
        router.refresh();
      } else {
        alert('Došlo k chybě při ukládání nastavení.');
      }
    } catch (error) {
      console.error(error);
      alert('Došlo k chybě při ukládání nastavení.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-white">Nastavení administrátora</h1>
        <p className="text-gray-400 mt-1">Správa vašeho profilu a globálních nastavení systému.</p>
      </div>

      <div className="bg-[#1A1A1A] border border-white/5 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center gap-4">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user?.name || 'Administrátor'}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-red-500 font-medium">Hlavní administrátor</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Jméno a příjmení</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-[#111] border border-white/10 rounded-lg text-white focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Emailová adresa</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-500" />
                  </div>
                  <input
                    type="email"
                    disabled
                    value={formData.email}
                    className="w-full pl-10 pr-4 py-2 bg-[#111] border border-white/10 rounded-lg text-white opacity-50 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-500">Email nelze změnit.</p>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2 bg-brand-yellow text-black text-sm font-bold rounded-lg hover:bg-brand-yellow-hover transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Ukládám...' : 'Uložit nastavení'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
