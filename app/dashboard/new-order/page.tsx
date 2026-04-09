'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Check, ChevronRight, Home, Zap, FileText, Calendar, User, Phone,
  MapPin, Upload, Building, Info, ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';

const SERVICE_TYPES = [
  { id: 'elektro_byt', label: 'Elektroinstalace – Byt', desc: 'Revize elektroinstalace v bytové jednotce', price: 'od 2 500 Kč', group: 'Elektro' },
  { id: 'elektro_dum', label: 'Elektroinstalace – Dům', desc: 'Kompletní revize elektro v rodinném domě', price: 'od 3 500 Kč', group: 'Elektro' },
  { id: 'elektro_spolecne', label: 'Elektro – Společné prostory', desc: 'Revize společných prostor bytového domu', price: 'od 4 000 Kč', group: 'Elektro' },
  { id: 'plyn', label: 'Plynové zařízení', desc: 'Kontrola plynových spotřebičů a rozvodů', price: 'od 1 800 Kč', group: 'Plyn' },
  { id: 'hromosvod', label: 'Hromosvod', desc: 'Revize systému ochrany před bleskem', price: 'od 3 000 Kč', group: 'Elektro' },
  { id: 'kominy', label: 'Komíny a spalinové cesty', desc: 'Kontrola a čištění komínů', price: 'od 1 200 Kč', group: 'Požární' },
  { id: 'hasici_pristroje', label: 'Hasicí přístroje', desc: 'Kontrola a revize hasicích přístrojů', price: 'od 500 Kč/ks', group: 'Požární' },
  { id: 'pozarni', label: 'Požární bezpečnost', desc: 'Požární revize objektu (PBŘ, únikové cesty)', price: 'od 3 500 Kč', group: 'Požární' },
  { id: 'vytahy', label: 'Výtahy', desc: 'Odborná zkouška a provozní prohlídka výtahů', price: 'od 5 000 Kč', group: 'Technická' },
  { id: 'tlakove', label: 'Tlaková zařízení', desc: 'Revize tlakových nádob a zařízení', price: 'od 2 500 Kč', group: 'Technická' },
  { id: 'komplexni', label: 'Komplexní revize objektu', desc: 'Kompletní revizní audit celé nemovitosti', price: 'Individuální', group: 'Komplex' },
  { id: 'vlastni_revize', label: 'Nahrát vlastní revizi', desc: 'Máte hotovou revizi? Nahrajte ji pro správu termínů', price: 'Zdarma', group: 'Ostatní' },
];

const PROPERTY_TYPES = [
  { id: 'byt', label: 'Byt' },
  { id: 'dum', label: 'Rodinný dům' },
  { id: 'bytovy_dum', label: 'Bytový dům / SVJ' },
  { id: 'kancelare', label: 'Kancelářské prostory' },
  { id: 'prumysl', label: 'Průmyslový objekt' },
  { id: 'obchod', label: 'Obchod / Provozovna' },
  { id: 'sklad', label: 'Sklad' },
  { id: 'jine', label: 'Jiné' },
];

const steps = [
  { id: 1, name: 'Typ revize', icon: Zap },
  { id: 2, name: 'Nemovitost', icon: Home },
  { id: 3, name: 'Kontakt', icon: User },
  { id: 4, name: 'Termín', icon: Calendar },
  { id: 5, name: 'Shrnutí', icon: FileText },
];

export default function NewOrderPage() {
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [reportFile, setReportFile] = useState<string | null>(null);
  const [revisionCategories, setRevisionCategories] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  const [serviceType, setServiceType] = useState('');
  const [propertyType, setPropertyType] = useState('byt');
  const [address, setAddress] = useState('');
  const [floor, setFloor] = useState('');
  const [area, setArea] = useState('');
  const [accessInfo, setAccessInfo] = useState('');
  const [notes, setNotes] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [isFirstRevision, setIsFirstRevision] = useState(false);
  const [urgency, setUrgency] = useState<'normal' | 'urgent'>('normal');

  useEffect(() => {
    fetch('/api/revisions').then(r => r.json()).then(setRevisionCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (session?.user) {
      setContactName(session.user.name || '');
      setContactEmail(session.user.email || '');
    }
  }, [session]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setReportFile(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const selectedService = SERVICE_TYPES.find(s => s.id === serviceType);

  const canProceed = () => {
    if (currentStep === 1) return !!serviceType;
    if (currentStep === 2) return address.length >= 5;
    if (currentStep === 3) return contactName.length >= 2 && contactPhone.length >= 6;
    return true;
  };

  const nextStep = () => {
    if (canProceed()) setCurrentStep(prev => Math.min(prev + 1, steps.length));
  };
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const onSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: selectedService?.label || serviceType,
          propertyType: PROPERTY_TYPES.find(p => p.id === propertyType)?.label || propertyType,
          address,
          notes: [
            notes,
            floor ? `Podlaží: ${floor}` : '',
            area ? `Plocha: ${area} m²` : '',
            accessInfo ? `Přístup: ${accessInfo}` : '',
            isFirstRevision ? 'Typ: Výchozí (první) revize' : '',
            urgency === 'urgent' ? 'URGENTNÍ' : '',
            `Kontakt: ${contactName}, tel: ${contactPhone}, e-mail: ${contactEmail}`,
          ].filter(Boolean).join('\n'),
          preferredDate: preferredDate || null,
          reportFile: serviceType === 'vlastni_revize' ? reportFile : null,
          revisionCategoryId: selectedCategoryId || null,
        }),
      });
      if (res.ok) setIsSuccess(true);
      else alert('Došlo k chybě při odesílání objednávky.');
    } catch {
      alert('Došlo k chybě při odesílání objednávky.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto mt-12 text-center space-y-6">
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
          <Check className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-3xl font-bold text-white">Objednávka odeslána!</h2>
        <p className="text-gray-400">Potvrzení jsme zaslali na váš e-mail. Technik vás bude kontaktovat pro potvrzení termínu.</p>
        <div className="flex justify-center gap-4 pt-4">
          <Link href="/dashboard" className="px-6 py-3 bg-[#1A1A1A] text-white rounded-lg border border-white/10 hover:bg-[#252525] transition-colors">Zpět na přehled</Link>
          <Link href="/dashboard/orders" className="px-6 py-3 bg-brand-yellow text-black font-semibold rounded-lg hover:bg-brand-yellow-hover transition-colors">Sledovat objednávku</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/dashboard" className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Nová objednávka revize</h1>
          <p className="text-gray-400 text-sm">Vyplňte údaje o požadované revizi.</p>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-10 overflow-x-auto pb-2">
        <div className="flex items-center justify-between relative min-w-[500px]">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-[#1A1A1A] -z-10" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-yellow -z-10 transition-all duration-500" style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }} />
          {steps.map(step => (
            <div key={step.id} className="flex flex-col items-center gap-2 bg-[#111111] px-2">
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                currentStep >= step.id ? "border-brand-yellow bg-brand-yellow text-black" : "border-[#333] bg-[#1A1A1A] text-gray-500"
              )}>
                <step.icon className="w-5 h-5" />
              </div>
              <span className={cn("text-xs font-medium transition-colors whitespace-nowrap", currentStep >= step.id ? "text-brand-yellow" : "text-gray-500")}>{step.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-6 md:p-8 shadow-xl overflow-hidden">
        <AnimatePresence mode="wait">
          {/* Step 1: Service Type */}
          {currentStep === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-6">
              <h3 className="text-xl font-semibold text-white">O jakou revizi máte zájem?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {SERVICE_TYPES.map(type => (
                  <label key={type.id} className={cn(
                    "relative flex flex-col p-4 cursor-pointer rounded-xl border-2 transition-all hover:bg-white/5",
                    serviceType === type.id ? "border-brand-yellow bg-brand-yellow/5" : "border-white/10"
                  )}>
                    <input type="radio" value={type.id} checked={serviceType === type.id} onChange={() => setServiceType(type.id)} className="sr-only" />
                    <div className="flex justify-between items-start mb-1">
                      <span className={cn("font-semibold text-sm", serviceType === type.id ? "text-brand-yellow" : "text-white")}>{type.label}</span>
                      {serviceType === type.id && <Check className="w-4 h-4 text-brand-yellow shrink-0" />}
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{type.desc}</p>
                    <span className="text-xs font-mono text-gray-600 mt-auto">{type.price}</span>
                  </label>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Property */}
          {currentStep === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-5">
              <h3 className="text-xl font-semibold text-white">Kde bude revize probíhat?</h3>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Typ objektu</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {PROPERTY_TYPES.map(pt => (
                    <button key={pt.id} type="button" onClick={() => setPropertyType(pt.id)}
                      className={cn("p-3 rounded-lg border text-sm font-medium transition-all text-left",
                        propertyType === pt.id ? "border-brand-yellow bg-brand-yellow/10 text-brand-yellow" : "border-white/10 text-gray-300 hover:border-white/20"
                      )}>
                      {pt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Adresa objektu *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Ulice č.p., Město, PSČ"
                    className="w-full bg-[#111] border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow outline-none transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Podlaží / patro (nepovinné)</label>
                  <input type="text" value={floor} onChange={e => setFloor(e.target.value)} placeholder="Např. 3. patro"
                    className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white focus:border-brand-yellow outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Plocha m² (nepovinné)</label>
                  <input type="number" value={area} onChange={e => setArea(e.target.value)} placeholder="Např. 85"
                    className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white focus:border-brand-yellow outline-none transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Informace o přístupu (nepovinné)</label>
                <textarea value={accessInfo} onChange={e => setAccessInfo(e.target.value)} rows={2}
                  placeholder="Kód ke dveřím, zvonit u sousedů, klíče u správce, pes na zahradě..."
                  className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white focus:border-brand-yellow outline-none transition-all resize-none" />
              </div>

              <label className="flex items-center gap-3 p-3 bg-[#111] border border-white/10 rounded-lg cursor-pointer hover:border-white/20 transition-colors">
                <input type="checkbox" checked={isFirstRevision} onChange={e => setIsFirstRevision(e.target.checked)} className="w-4 h-4 rounded" />
                <div>
                  <span className="text-sm text-white font-medium">Výchozí (první) revize</span>
                  <p className="text-xs text-gray-500">Jedná se o první revizi tohoto zařízení / objektu</p>
                </div>
              </label>

              {serviceType === 'vlastni_revize' && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Nahrát dokument revize (PDF, JPG)</label>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange}
                    className="w-full bg-[#111] border border-white/10 rounded-lg p-2 text-white focus:border-brand-yellow outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-yellow file:text-black hover:file:bg-brand-yellow-hover" />
                  {reportFile && <p className="text-sm text-green-500 mt-2">Soubor byl úspěšně nahrán.</p>}
                </div>
              )}
            </motion.div>
          )}

          {/* Step 3: Contact */}
          {currentStep === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-5">
              <h3 className="text-xl font-semibold text-white">Na koho se má technik obrátit?</h3>
              <p className="text-sm text-gray-400">Kontaktní osoba, která bude přítomna u revize.</p>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Jméno kontaktní osoby *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="text" value={contactName} onChange={e => setContactName(e.target.value)} placeholder="Jan Novák"
                    className="w-full bg-[#111] border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:border-brand-yellow outline-none transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Telefonní číslo *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="+420 777 123 456"
                    className="w-full bg-[#111] border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:border-brand-yellow outline-none transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">E-mail</label>
                <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="vas@email.cz"
                  className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white focus:border-brand-yellow outline-none transition-all" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Poznámka pro technika (nepovinné)</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                  placeholder="Jakékoliv doplňující informace – specifické požadavky, problematická místa..."
                  className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white focus:border-brand-yellow outline-none transition-all resize-none" />
              </div>
            </motion.div>
          )}

          {/* Step 4: Scheduling */}
          {currentStep === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-5">
              {serviceType === 'vlastni_revize' ? (
                <>
                  <h3 className="text-xl font-semibold text-white">Platnost vaší revize</h3>
                  <p className="text-sm text-gray-400">Zadejte datum, do kdy je revize platná. Včas vás upozorníme na konec platnosti.</p>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Platnost do (nepovinné)</label>
                    <input type="date" value={preferredDate} onChange={e => setPreferredDate(e.target.value)}
                      className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white focus:border-brand-yellow outline-none transition-all" />
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-semibold text-white">Kdy se vám to hodí?</h3>
                  <p className="text-sm text-gray-400">Technik vám termín potvrdí nebo navrhne nejbližší možný.</p>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Preferované datum</label>
                    <input type="date" value={preferredDate} onChange={e => setPreferredDate(e.target.value)}
                      className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white focus:border-brand-yellow outline-none transition-all" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Naléhavost</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button type="button" onClick={() => setUrgency('normal')}
                        className={cn("p-4 rounded-lg border text-left transition-all",
                          urgency === 'normal' ? "border-brand-yellow bg-brand-yellow/10" : "border-white/10 hover:border-white/20"
                        )}>
                        <p className={cn("font-medium text-sm", urgency === 'normal' ? "text-brand-yellow" : "text-white")}>Standardní</p>
                        <p className="text-xs text-gray-500 mt-1">Termín dle domluvy s technikem</p>
                      </button>
                      <button type="button" onClick={() => setUrgency('urgent')}
                        className={cn("p-4 rounded-lg border text-left transition-all",
                          urgency === 'urgent' ? "border-red-500 bg-red-500/10" : "border-white/10 hover:border-white/20"
                        )}>
                        <p className={cn("font-medium text-sm", urgency === 'urgent' ? "text-red-400" : "text-white")}>Urgentní</p>
                        <p className="text-xs text-gray-500 mt-1">Co nejdříve, může být příplatek</p>
                      </button>
                    </div>
                  </div>

                  {revisionCategories.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">Typ prostředí (nepovinné)</label>
                      <select value={selectedCategoryId} onChange={e => setSelectedCategoryId(e.target.value)}
                        className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white focus:border-brand-yellow outline-none">
                        <option value="">Vyberte kategorii...</option>
                        {Object.entries(
                          revisionCategories.reduce((acc: Record<string, any[]>, cat: any) => {
                            if (!acc[cat.group]) acc[cat.group] = [];
                            acc[cat.group].push(cat);
                            return acc;
                          }, {})
                        ).map(([group, cats]) => (
                          <optgroup key={group} label={group}>
                            {(cats as any[]).map((cat: any) => (
                              <option key={cat.id} value={cat.id}>{cat.name} ({cat.intervalMonths} měs.)</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Pomůže správně hlídat termín další revize.</p>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* Step 5: Summary */}
          {currentStep === 5 && (
            <motion.div key="s5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-6">
              <h3 className="text-xl font-semibold text-white">Kontrola údajů</h3>

              <div className="bg-[#111] rounded-xl p-6 space-y-4 border border-white/5">
                {[
                  { label: 'Typ revize', value: selectedService?.label || serviceType },
                  { label: 'Typ objektu', value: PROPERTY_TYPES.find(p => p.id === propertyType)?.label },
                  { label: 'Adresa', value: address },
                  floor ? { label: 'Podlaží', value: floor } : null,
                  area ? { label: 'Plocha', value: `${area} m²` } : null,
                  { label: 'Kontaktní osoba', value: `${contactName}, ${contactPhone}` },
                  { label: serviceType === 'vlastni_revize' ? 'Platnost do' : 'Preferovaný termín', value: preferredDate ? new Date(preferredDate).toLocaleDateString('cs-CZ') : 'Dle domluvy' },
                  urgency === 'urgent' ? { label: 'Naléhavost', value: '🔴 URGENTNÍ' } : null,
                  isFirstRevision ? { label: 'Typ revize', value: 'Výchozí (první) revize' } : null,
                ].filter(Boolean).map((item, i) => (
                  <div key={i} className="flex justify-between py-2 border-b border-white/5 last:border-0">
                    <span className="text-gray-400 text-sm">{item!.label}</span>
                    <span className="font-medium text-white text-sm text-right">{item!.value}</span>
                  </div>
                ))}
                {serviceType !== 'vlastni_revize' && (
                  <div className="flex justify-between py-2 pt-4 border-t border-brand-yellow/20">
                    <span className="text-gray-400 font-medium">Odhadovaná cena</span>
                    <span className="font-bold text-brand-yellow text-lg">{selectedService?.price || 'Individuální'}</span>
                  </div>
                )}
                {notes && (
                  <div className="pt-2 border-t border-white/5">
                    <span className="block text-gray-400 text-sm mb-1">Poznámka</span>
                    <p className="text-sm text-white bg-[#1A1A1A] p-3 rounded-lg border border-white/5">{notes}</p>
                  </div>
                )}
                {accessInfo && (
                  <div>
                    <span className="block text-gray-400 text-sm mb-1">Přístup</span>
                    <p className="text-sm text-white bg-[#1A1A1A] p-3 rounded-lg border border-white/5">{accessInfo}</p>
                  </div>
                )}
              </div>

              <div className="flex items-start gap-3 p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-400">
                  Odesláním objednávky souhlasíte se zpracováním osobních údajů a obchodními podmínkami Revizone.
                  Potvrzení obdržíte e-mailem.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between pt-8 mt-8 border-t border-white/10">
          <button type="button" onClick={prevStep} disabled={currentStep === 1}
            className={cn("px-6 py-2.5 rounded-lg font-medium transition-colors",
              currentStep === 1 ? "text-gray-600 cursor-not-allowed" : "text-gray-400 hover:text-white hover:bg-white/5"
            )}>
            Zpět
          </button>

          {currentStep < steps.length ? (
            <button type="button" onClick={nextStep} disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-2.5 bg-brand-yellow text-black font-semibold rounded-lg hover:bg-brand-yellow-hover transition-colors shadow-lg shadow-brand-yellow/10 disabled:opacity-50 disabled:cursor-not-allowed">
              Pokračovat <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button type="button" onClick={onSubmit} disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-2.5 bg-brand-yellow text-black font-semibold rounded-lg hover:bg-brand-yellow-hover transition-colors shadow-lg shadow-brand-yellow/10 disabled:opacity-50">
              {isSubmitting ? 'Odesílání...' : 'Závazně objednat'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
