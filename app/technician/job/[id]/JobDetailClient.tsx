'use client';

import { useState } from 'react';
import { ArrowLeft, MapPin, User, Phone, Calendar, Upload, FileText, CheckCircle2, AlertTriangle, Briefcase, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ChatSection } from '@/components/ChatSection';
import { ChecklistSection } from '@/components/ChecklistSection';

export default function JobDetailClient({ order, currentUser }: { order: any, currentUser: any }) {
  const [status, setStatus] = useState(
    order.status === 'COMPLETED' ? 'completed' : 
    order.status === 'IN_PROGRESS' ? 'in_progress' : 
    order.status === 'NEEDS_REVISION' ? 'needs_revision' : 'pending'
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Prosím vyberte soubor s revizní zprávou.');
      return;
    }

    setIsUploading(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64File = reader.result as string;
        
        const res = await fetch(`/api/orders/${order.readableId}/complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reportFile: base64File }),
        });
        
        if (res.ok) {
          setStatus('completed');
          alert('Revizní zpráva byla úspěšně nahrána a zakázka je dokončena.');
          router.refresh();
        } else {
          alert('Došlo k chybě při dokončování zakázky.');
        }
        setIsUploading(false);
      };
      reader.onerror = () => {
        alert('Chyba při čtení souboru.');
        setIsUploading(false);
      };
    } catch (error) {
      console.error(error);
      alert('Došlo k chybě při dokončování zakázky.');
      setIsUploading(false);
    }
  };

  const handleClaim = async () => {
    setIsClaiming(true);
    try {
      const res = await fetch(`/api/orders/${order.readableId}/claim`, {
        method: 'POST',
      });
      if (res.ok) {
        alert('Zakázka byla úspěšně přijata.');
        router.refresh();
      } else {
        alert('Došlo k chybě při přijímání zakázky.');
      }
    } catch (error) {
      console.error(error);
      alert('Došlo k chybě při přijímání zakázky.');
    } finally {
      setIsClaiming(false);
    }
  };

  const handleStartWork = async () => {
    try {
      const res = await fetch(`/api/orders/${order.readableId}/start`, {
        method: 'POST',
      });
      if (res.ok) {
        setStatus('in_progress');
        alert('Práce na zakázce začala.');
        router.refresh();
      } else {
        alert('Došlo k chybě.');
      }
    } catch (error) {
      console.error(error);
      alert('Došlo k chybě.');
    }
  };

  const canClaim = order.isPublic && order.status === 'PENDING' && !order.technicianId && !order.companyId;
  const canStart = order.status === 'PENDING' && (order.technicianId === currentUser.id || order.companyId === currentUser.id);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-5xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/technician/queue" className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-white">{order.serviceType}</h1>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        status === 'completed' ? 'bg-green-500/10 text-green-500' : 
                        status === 'in_progress' ? 'bg-blue-500/10 text-blue-500' :
                        status === 'needs_revision' ? 'bg-orange-500/10 text-orange-500' :
                        'bg-yellow-500/10 text-yellow-500'
                    }`}>
                        {status === 'completed' ? 'Dokončeno' : 
                         status === 'in_progress' ? 'Probíhá' : 
                         status === 'needs_revision' ? 'K přepracování' : 'Čeká na přijetí'}
                    </span>
                    {order.isPublic && order.status === 'PENDING' && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-brand-yellow/10 text-brand-yellow">
                        Veřejná poptávka
                      </span>
                    )}
                </div>
                <p className="text-gray-400 text-sm mt-1">ID: #{order.readableId}</p>
            </div>
            
            {canClaim && (
              <button
                onClick={handleClaim}
                disabled={isClaiming}
                className="px-6 py-2.5 bg-brand-yellow text-black font-semibold rounded-lg hover:bg-brand-yellow-hover transition-colors shadow-lg shadow-brand-yellow/10 disabled:opacity-50 flex items-center gap-2"
              >
                {isClaiming ? 'Přijímám...' : <><Briefcase className="w-4 h-4" /> Přijmout zakázku</>}
              </button>
            )}
            {canStart && (
              <button
                onClick={handleStartWork}
                className="px-6 py-2.5 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/10 flex items-center gap-2"
              >
                Začít pracovat
              </button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
            {/* Client Info Card */}
            <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Informace o zakázce</h3>
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div>
                            <p className="text-sm text-gray-400">Adresa</p>
                            <p className="text-white">{order.address}</p>
                            <a href={`https://maps.google.com/?q=${encodeURIComponent(order.address)}`} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-yellow hover:underline">Navigovat na místo</a>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <User className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div>
                            <p className="text-sm text-gray-400">Zákazník</p>
                            <p className="text-white">{order.customer.name || order.customer.email}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div>
                            <p className="text-sm text-gray-400">Telefon</p>
                            <a href={`tel:${order.customer.phone || ''}`} className="text-white hover:text-brand-yellow transition-colors">{order.customer.phone || 'Nenastaveno'}</a>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div>
                            <p className="text-sm text-gray-400">Vytvořeno</p>
                            <p className="text-white">{new Date(order.createdAt).toLocaleString('cs-CZ')}</p>
                        </div>
                    </div>
                    {order.price && (
                      <div className="flex items-start gap-3">
                          <DollarSign className="w-5 h-5 text-gray-500 mt-0.5" />
                          <div>
                              <p className="text-sm text-gray-400">Očekávaná cena</p>
                              <p className="text-white">{order.price.toLocaleString('cs-CZ')} Kč</p>
                          </div>
                      </div>
                    )}
                </div>
                
                {order.notes && (
                    <div className="mt-6 pt-6 border-t border-white/5">
                        <p className="text-sm text-gray-400 mb-2">Poznámka od zákazníka:</p>
                        <div className="bg-[#111] p-3 rounded-lg text-sm text-gray-300 italic">
                            &quot;{order.notes}&quot;
                        </div>
                    </div>
                )}
            </div>

            {/* Action / Upload Section */}
            <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Dokončení revize</h3>
                
                {status === 'completed' ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                        </div>
                        <h4 className="text-xl font-bold text-white">Revize dokončena</h4>
                        <p className="text-gray-400 mt-2">Zpráva byla úspěšně nahrána a odeslána zákazníkovi.</p>
                        <button onClick={() => alert('Funkce úpravy souborů zatím není implementována.')} className="mt-6 text-sm text-gray-500 hover:text-white underline">
                            Upravit nahrané soubory
                        </button>
                    </div>
                ) : status === 'in_progress' ? (
                    <div className="space-y-6">
                        <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-brand-yellow/50 hover:bg-white/[0.02] transition-colors relative">
                            <input 
                              type="file" 
                              accept=".pdf,.doc,.docx" 
                              onChange={handleFileChange}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <Upload className="w-10 h-10 text-gray-500 mx-auto mb-4" />
                            <p className="text-white font-medium">
                              {file ? file.name : 'Nahrajte revizní zprávu (PDF)'}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'nebo přetáhněte soubor sem'}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <label className="flex items-center gap-3 p-4 bg-[#111] rounded-lg cursor-pointer border border-white/5 hover:border-white/20 transition-colors">
                                <input type="checkbox" className="w-5 h-5 rounded border-gray-600 text-brand-yellow focus:ring-brand-yellow bg-transparent" />
                                <span className="text-sm text-gray-300">Závady byly odstraněny na místě</span>
                            </label>
                            
                            <label className="flex items-center gap-3 p-4 bg-[#111] rounded-lg cursor-pointer border border-white/5 hover:border-white/20 transition-colors">
                                <input type="checkbox" className="w-5 h-5 rounded border-gray-600 text-brand-yellow focus:ring-brand-yellow bg-transparent" />
                                <span className="text-sm text-gray-300">Zařízení je schopné bezpečného provozu</span>
                            </label>
                        </div>

                        <button 
                            onClick={handleUpload}
                            disabled={isUploading}
                            className="w-full py-3 bg-brand-yellow text-black font-bold rounded-lg hover:bg-brand-yellow-hover transition-colors shadow-lg shadow-brand-yellow/10 flex items-center justify-center gap-2"
                        >
                            {isUploading ? (
                                <>Nahrávání...</>
                            ) : (
                                <><CheckCircle2 className="w-5 h-5" /> Dokončit a odeslat zprávu</>
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center justify-center py-8 border border-dashed border-white/10 rounded-lg text-gray-500">
                        <p>Nejprve musíte zakázku přijmout a začít na ní pracovat.</p>
                    </div>
                )}
            </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
            <ChecklistSection orderId={order.id} isTechnician={true} />

            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                <div className="flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-blue-500 shrink-0" />
                    <div>
                        <h4 className="text-sm font-bold text-blue-500">Upozornění</h4>
                        <p className="text-xs text-gray-400 mt-1">
                            U tohoto objektu byla v minulé revizi nalezena závada na hlavním jističi. Zkontrolujte prosím opravu.
                        </p>
                        <button onClick={() => alert('Funkce zobrazení minulé zprávy zatím není implementována.')} className="text-xs text-blue-400 hover:text-blue-300 underline mt-2">
                            Zobrazit minulou zprávu
                        </button>
                    </div>
                </div>
            </div>

            <ChatSection orderId={order.id} currentUserId={currentUser.id} />
        </div>
      </div>
    </motion.div>
  );
}
