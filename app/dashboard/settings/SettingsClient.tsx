'use client';

import { useState } from 'react';
import { User as UserIcon, Lock, Bell, Save, Briefcase, Building } from 'lucide-react';
import { cn } from '@/lib/utils';
import { User } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';

export default function SettingsClient({ user }: { user: User }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [roleRequest, setRoleRequest] = useState('');
  const [companyCode, setCompanyCode] = useState('');
  
  const [firstName, setFirstName] = useState(user.name?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(user.name?.split(' ').slice(1).join(' ') || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [emailNotifs, setEmailNotifs] = useState((user as any).emailNotifications !== false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const router = useRouter();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, phone, emailNotifications: emailNotifs }),
      });
      
      if (res.ok) {
        alert('Změny byly úspěšně uloženy.');
        router.refresh();
      } else {
        alert('Došlo k chybě při ukládání změn.');
      }
    } catch (error) {
      console.error(error);
      alert('Došlo k chybě při ukládání změn.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleRequest) return;
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/user/role-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestedRole: roleRequest }),
      });
      
      if (res.ok) {
        alert('Žádost o změnu role byla odeslána ke schválení.');
        setRoleRequest('');
      } else {
        alert('Došlo k chybě při odesílání žádosti.');
      }
    } catch (error) {
      console.error(error);
      alert('Došlo k chybě při odesílání žádosti.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyCode) return;
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/user/join-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyCode }),
      });
      
      if (res.ok) {
        alert('Úspěšně jste se připojili k firmě.');
        setCompanyCode('');
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.message || 'Došlo k chybě při připojování k firmě.');
      }
    } catch (error) {
      console.error(error);
      alert('Došlo k chybě při připojování k firmě.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Nastavení účtu</h1>
        <p className="text-gray-400">Spravujte své osobní údaje a preference.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Navigation */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-1">
          {[
            { id: 'profile', label: 'Osobní údaje', icon: UserIcon },
            { id: 'security', label: 'Zabezpečení', icon: Lock },
            { id: 'notifications', label: 'Upozornění', icon: Bell },
            ...(user.role === 'CUSTOMER' ? [{ id: 'role', label: 'Změna role', icon: Briefcase }] : []),
            ...(user.role === 'TECHNICIAN' ? [{ id: 'company', label: 'Připojit k firmě', icon: Building }] : []),
            ...(user.role === 'COMPANY_ADMIN' ? [{ id: 'company_settings', label: 'Nastavení firmy', icon: Building }] : []),
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                activeTab === item.id 
                  ? "bg-brand-yellow text-black" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-[#1A1A1A] border border-white/5 rounded-xl p-6 md:p-8 overflow-hidden relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {activeTab === 'role' && user.role === 'CUSTOMER' ? (
              <motion.div 
                key="role"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-medium text-white mb-4">Žádost o změnu role</h3>
                <p className="text-sm text-gray-400 mb-6">
                  Zde můžete zažádat o změnu vaší uživatelské role. Každá žádost podléhá schválení administrátorem.
                </p>
                
                <form onSubmit={handleRoleRequest} className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Požadovaná role</label>
                    <select 
                      value={roleRequest}
                      onChange={(e) => setRoleRequest(e.target.value)}
                      className="w-full bg-[#111] border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-yellow outline-none"
                      required
                    >
                      <option value="">Vyberte roli...</option>
                      <option value="TECHNICIAN">Partner (Podřízený)</option>
                      <option value="COMPANY_ADMIN">Partner (Delegátor)</option>
                      <option value="PRODUCT_MANAGER">Produkt manažer</option>
                      <option value="REALTY">Realitní kancelář</option>
                      <option value="SVJ">Správce SVJ</option>
                    </select>
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={isLoading || !roleRequest}
                    className="w-full py-2.5 bg-brand-yellow text-black font-semibold rounded-lg hover:bg-brand-yellow-hover transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Odesílám...' : 'Odeslat žádost'}
                  </button>
                </form>
              </motion.div>
            ) : activeTab === 'company' && user.role === 'TECHNICIAN' ? (
              <motion.div 
                key="company"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-medium text-white mb-4">Připojit se k firmě</h3>
                <p className="text-sm text-gray-400 mb-6">
                  Pokud pracujete pro firmu, která využívá náš systém, zadejte její identifikační kód pro propojení účtů.
                </p>
                
                <form onSubmit={handleJoinCompany} className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Kód firmy</label>
                    <input 
                      type="text" 
                      value={companyCode}
                      onChange={(e) => setCompanyCode(e.target.value)}
                      placeholder="Např. FIRMA-1234"
                      className="w-full bg-[#111] border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-yellow outline-none"
                      required
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={isLoading || !companyCode}
                    className="w-full py-2.5 bg-brand-yellow text-black font-semibold rounded-lg hover:bg-brand-yellow-hover transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Odesílám...' : 'Odeslat žádost'}
                  </button>
                </form>
              </motion.div>
            ) : activeTab === 'company_settings' && user.role === 'COMPANY_ADMIN' ? (
              <motion.div 
                key="company_settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-medium text-white mb-4">Nastavení firmy</h3>
                <p className="text-sm text-gray-400 mb-6">
                  Zde můžete spravovat identifikační kód vaší firmy. Technici tento kód potřebují, aby se mohli připojit k vaší firmě.
                </p>
                
                <div className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Kód firmy (Invite Code)</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={(user as any).inviteCode || 'Nenastaveno'}
                        readOnly
                        className="flex-1 bg-[#111] border border-white/10 rounded-lg p-2.5 text-white outline-none font-mono"
                      />
                      <button 
                        type="button"
                        onClick={async () => {
                          if (!confirm('Opravdu chcete vygenerovat nový kód? Starý kód přestane fungovat.')) return;
                          setIsLoading(true);
                          try {
                            const res = await fetch('/api/company/settings/generate-code', { method: 'POST' });
                            if (res.ok) {
                              alert('Nový kód byl úspěšně vygenerován.');
                              router.refresh();
                            } else {
                              alert('Došlo k chybě při generování kódu.');
                            }
                          } catch (e) {
                            alert('Došlo k chybě při generování kódu.');
                          } finally {
                            setIsLoading(false);
                          }
                        }}
                        disabled={isLoading}
                        className="px-4 py-2.5 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
                      >
                        Vygenerovat nový
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.form 
                key="settings-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSave}
              >
              
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center gap-4 mb-6">
                      <div className="w-20 h-20 rounded-full bg-[#111] border border-white/10 flex items-center justify-center">
                          <UserIcon className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                          <p className="text-sm text-gray-500">Profilová fotka</p>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-400">Jméno</label>
                          <input 
                            type="text" 
                            value={firstName} 
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full bg-[#111] border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-yellow outline-none" 
                          />
                      </div>
                      <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-400">Příjmení</label>
                          <input 
                            type="text" 
                            value={lastName} 
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full bg-[#111] border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-yellow outline-none" 
                          />
                      </div>
                      <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-400">E-mail</label>
                          <input 
                            type="email" 
                            defaultValue={user.email || ''} 
                            disabled
                            className="w-full bg-[#111] border border-white/10 rounded-lg p-2.5 text-gray-500 cursor-not-allowed outline-none" 
                          />
                      </div>
                      <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-400">Telefon</label>
                          <input 
                            type="tel" 
                            value={phone} 
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-[#111] border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-yellow outline-none" 
                          />
                      </div>
                  </div>

                  <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-400">Fakturační adresa</label>
                      <input type="text" defaultValue="" className="w-full bg-[#111] border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-yellow outline-none" />
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <h4 className="text-sm font-semibold text-gray-300 mb-3">E-mailová upozornění</h4>
                    <label className="flex items-center justify-between p-4 bg-[#111] border border-white/10 rounded-xl cursor-pointer hover:border-white/20 transition-colors">
                      <div>
                        <p className="text-sm font-medium text-white">Upozornění na expiraci revizí</p>
                        <p className="text-xs text-gray-500 mt-1">E-maily 30, 14, 7, 2 a 1 den před vypršením platnosti revize</p>
                      </div>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={emailNotifs}
                          onChange={(e) => setEmailNotifs(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-brand-yellow transition-colors" />
                        <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <h3 className="text-lg font-medium text-white mb-4">Změna hesla</h3>
                  {passwordMessage && (
                    <div className={cn(
                      "p-3 rounded-lg text-sm",
                      passwordMessage.type === 'success' ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
                    )}>
                      {passwordMessage.text}
                    </div>
                  )}
                  <div className="space-y-4 max-w-md">
                      <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-400">Současné heslo</label>
                          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full bg-[#111] border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-yellow outline-none" />
                      </div>
                      <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-400">Nové heslo</label>
                          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-[#111] border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-yellow outline-none" />
                      </div>
                      <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-400">Potvrzení nového hesla</label>
                          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-[#111] border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-yellow outline-none" />
                      </div>
                      <button
                        type="button"
                        disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
                        onClick={async () => {
                          if (newPassword !== confirmPassword) {
                            setPasswordMessage({ type: 'error', text: 'Nová hesla se neshodují.' });
                            return;
                          }
                          if (newPassword.length < 10) {
                            setPasswordMessage({ type: 'error', text: 'Nové heslo musí mít alespoň 10 znaků.' });
                            return;
                          }
                          setIsLoading(true);
                          setPasswordMessage(null);
                          try {
                            const res = await fetch('/api/user/password', {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ currentPassword, newPassword }),
                            });
                            const data = await res.json();
                            if (res.ok) {
                              setPasswordMessage({ type: 'success', text: 'Heslo bylo úspěšně změněno.' });
                              setCurrentPassword('');
                              setNewPassword('');
                              setConfirmPassword('');
                            } else {
                              setPasswordMessage({ type: 'error', text: data.message || 'Došlo k chybě.' });
                            }
                          } catch {
                            setPasswordMessage({ type: 'error', text: 'Došlo k chybě při změně hesla.' });
                          } finally {
                            setIsLoading(false);
                          }
                        }}
                        className="w-full py-2.5 bg-brand-yellow text-black font-semibold rounded-lg hover:bg-brand-yellow-hover transition-colors disabled:opacity-50"
                      >
                        {isLoading ? 'Měním heslo...' : 'Změnit heslo'}
                      </button>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="space-y-4">
                      {[
                          { title: 'Blížící se termín revize', desc: 'Upozornit mě 30 dní před vypršením platnosti.', default: true },
                          { title: 'Změna stavu objednávky', desc: 'Když technik potvrdí termín nebo dokončí revizi.', default: true },
                          { title: 'Nová zpráva', desc: 'Upozornění na novou zprávu od technika.', default: true },
                          { title: 'Marketingové nabídky', desc: 'Novinky a speciální akce (maximálně 1x měsíčně).', default: false },
                      ].map((item, i) => (
                          <div key={i} className="flex items-start justify-between p-4 bg-[#111] rounded-lg border border-white/10">
                              <div>
                                  <p className="text-white font-medium">{item.title}</p>
                                  <p className="text-sm text-gray-500">{item.desc}</p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                  <input type="checkbox" defaultChecked={item.default} className="sr-only peer" />
                                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-yellow"></div>
                              </label>
                          </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
                  <button 
                      type="submit" 
                      disabled={isLoading}
                      className="flex items-center gap-2 px-6 py-2.5 bg-brand-yellow text-black font-semibold rounded-lg hover:bg-brand-yellow-hover transition-colors shadow-lg shadow-brand-yellow/10 disabled:opacity-50"
                  >
                      {isLoading ? (
                          <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
                      ) : (
                          <Save className="w-5 h-5" />
                      )}
                      <span>Uložit změny</span>
                  </button>
              </div>

            </motion.form>
          )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
