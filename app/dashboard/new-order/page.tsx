'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Check, ChevronRight, Home, Zap, FileText, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';

// Schema definition
const orderSchema = z.object({
  serviceType: z.enum(['elektro_byt', 'elektro_dum', 'hromosvod', 'plyn', 'vlastni_revize']),
  propertyAddress: z.string().min(5, "Adresa musí mít alespoň 5 znaků"),
  propertyType: z.enum(['byt', 'dum', 'firma', 'svj']),
  notes: z.string().optional(),
  preferredDate: z.string().optional(),
  yearOfManufacture: z.string().optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;

const steps = [
  { id: 1, name: 'Typ revize', icon: Zap },
  { id: 2, name: 'Nemovitost', icon: Home },
  { id: 3, name: 'Termín', icon: Calendar },
  { id: 4, name: 'Shrnutí', icon: FileText },
];

export default function NewOrderPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [reportFile, setReportFile] = useState<string | null>(null);
  const [revisionCategories, setRevisionCategories] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  useEffect(() => {
    fetch('/api/revisions').then(r => r.json()).then(setRevisionCategories).catch(() => {});
  }, []);

  const { register, handleSubmit, watch, formState: { errors }, trigger } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      serviceType: 'elektro_byt',
      propertyType: 'byt',
    }
  });

  const formData = watch();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReportFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const nextStep = async () => {
    let isValid = false;
    if (currentStep === 1) isValid = await trigger(['serviceType']);
    if (currentStep === 2) isValid = await trigger(['propertyAddress', 'propertyType']);
    if (currentStep === 3) isValid = true; // Date is optional

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data: OrderFormData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: data.serviceType,
          propertyType: data.propertyType,
          address: data.propertyAddress,
          notes: data.notes,
          preferredDate: data.preferredDate,
          reportFile: data.serviceType === 'vlastni_revize' ? reportFile : null,
          revisionCategoryId: selectedCategoryId || null,
        }),
      });

      if (res.ok) {
        setIsSuccess(true);
      } else {
        alert('Došlo k chybě při odesílání objednávky.');
      }
    } catch (error) {
      console.error(error);
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
        <p className="text-gray-400">
          Děkujeme za vaši objednávku. Náš technik vás bude brzy kontaktovat pro potvrzení termínu.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Link href="/dashboard" className="px-6 py-3 bg-[#1A1A1A] text-white rounded-lg border border-white/10 hover:bg-[#252525] transition-colors">
            Zpět na přehled
          </Link>
          <Link href="/dashboard/orders" className="px-6 py-3 bg-brand-yellow text-black font-semibold rounded-lg hover:bg-brand-yellow-hover transition-colors">
            Sledovat objednávku
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Nová objednávka revize</h1>
        <p className="text-gray-400">Vyplňte prosím údaje o požadované revizi.</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-12">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-[#1A1A1A] -z-10"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-yellow -z-10 transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          ></div>
          
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center gap-2 bg-[#111111] px-2">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                currentStep >= step.id 
                  ? "border-brand-yellow bg-brand-yellow text-black" 
                  : "border-[#333] bg-[#1A1A1A] text-gray-500"
              )}>
                <step.icon className="w-5 h-5" />
              </div>
              <span className={cn(
                "text-xs font-medium transition-colors",
                currentStep >= step.id ? "text-brand-yellow" : "text-gray-500"
              )}>{step.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-8 shadow-xl overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
          {/* Step 1: Service Type */}
          {currentStep === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-semibold text-white mb-4">O jakou revizi máte zájem?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'elektro_byt', label: 'Elektroinstalace - Byt', desc: 'Revize elektroinstalace v bytové jednotce', price: 'od 1 500 Kč' },
                  { id: 'elektro_dum', label: 'Elektroinstalace - Dům', desc: 'Kompletní revize rodinného domu', price: 'od 2 500 Kč' },
                  { id: 'hromosvod', label: 'Hromosvod', desc: 'Revize systému ochrany před bleskem', price: 'od 1 000 Kč' },
                  { id: 'plyn', label: 'Plynové zařízení', desc: 'Kontrola plynových spotřebičů a rozvodů', price: 'od 1 200 Kč' },
                  { id: 'vlastni_revize', label: 'Vlastní hotová revize', desc: 'Nahrání již zhotovené revize pro naši správu', price: 'Zdarma' },
                ].map((type) => (
                  <label 
                    key={type.id}
                    className={cn(
                      "relative flex flex-col p-4 cursor-pointer rounded-xl border-2 transition-all hover:bg-white/5",
                      formData.serviceType === type.id 
                        ? "border-brand-yellow bg-brand-yellow/5" 
                        : "border-white/10"
                    )}
                  >
                    <input 
                      type="radio" 
                      value={type.id} 
                      {...register('serviceType')} 
                      className="sr-only"
                    />
                    <div className="flex justify-between items-start mb-2">
                      <span className={cn("font-semibold", formData.serviceType === type.id ? "text-brand-yellow" : "text-white")}>
                        {type.label}
                      </span>
                      {formData.serviceType === type.id && <Check className="w-5 h-5 text-brand-yellow" />}
                    </div>
                    <p className="text-sm text-gray-400 mb-4">{type.desc}</p>
                    <span className="text-xs font-mono text-gray-500 mt-auto">{type.price}</span>
                  </label>
                ))}
              </div>
              {errors.serviceType && <p className="text-red-500 text-sm">{errors.serviceType.message}</p>}
            </motion.div>
          )}

          {/* Step 2: Property Details */}
          {currentStep === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-semibold text-white mb-4">Kde bude revize probíhat?</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Typ objektu</label>
                  <select 
                    {...register('propertyType')}
                    className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow outline-none transition-all"
                  >
                    <option value="byt">Bytová jednotka</option>
                    <option value="dum">Rodinný dům</option>
                    <option value="firma">Firemní prostory</option>
                    <option value="svj">Společné prostory SVJ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Adresa objektu</label>
                  <input 
                    type="text" 
                    {...register('propertyAddress')}
                    placeholder="Ulice, Číslo popisné, Město, PSČ"
                    className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow outline-none transition-all"
                  />
                  {errors.propertyAddress && <p className="text-red-500 text-sm mt-1">{errors.propertyAddress.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Rok stáří instalace / zařízení (nepovinné)</label>
                  <input 
                    type="number" 
                    {...register('yearOfManufacture')}
                    placeholder="Např. 2015"
                    className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow outline-none transition-all"
                  />
                </div>

                {formData.serviceType === 'vlastni_revize' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Nahrát dokument revize (PDF, JPG)</label>
                    <input 
                      type="file" 
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="w-full bg-[#111] border border-white/10 rounded-lg p-2 text-white focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-yellow file:text-black hover:file:bg-brand-yellow-hover"
                    />
                    {reportFile && <p className="text-sm text-green-500 mt-2">Soubor byl úspěšně nahrán.</p>}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Poznámka pro technika (nepovinné)</label>
                  <textarea 
                    {...register('notes')}
                    rows={3}
                    placeholder="Např. klíče jsou u sousedů, pes na zahradě..."
                    className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow outline-none transition-all"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Scheduling */}
          {currentStep === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {formData.serviceType === 'vlastni_revize' ? (
                <>
                  <h3 className="text-xl font-semibold text-white mb-4">Platnost revize</h3>
                  <p className="text-gray-400 mb-6">
                    Zadejte datum, do kdy je vaše revize platná (pokud víte). My vás včas upozorníme na blížící se konec platnosti.
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Platnost do (nepovinné)</label>
                    <input 
                      type="date" 
                      {...register('preferredDate')}
                      className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow outline-none transition-all"
                    />
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-semibold text-white mb-4">Kdy se vám to hodí?</h3>
                  <p className="text-gray-400 mb-6">
                    Vyberte preferovaný termín. Technik vám termín potvrdí nebo navrhne nejbližší možný.
                  </p>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Preferované datum</label>
                    <input 
                      type="date" 
                      {...register('preferredDate')}
                      className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow outline-none transition-all"
                    />
                  </div>

                  {revisionCategories.length > 0 && (
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-400 mb-1">Typ prostředí (pro správný výpočet lhůty)</label>
                      <select
                        value={selectedCategoryId}
                        onChange={(e) => setSelectedCategoryId(e.target.value)}
                        className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white focus:border-brand-yellow outline-none"
                      >
                        <option value="">Vyberte kategorii (nepovinné)...</option>
                        {Object.entries(
                          revisionCategories.reduce((acc: Record<string, any[]>, cat: any) => {
                            if (!acc[cat.group]) acc[cat.group] = [];
                            acc[cat.group].push(cat);
                            return acc;
                          }, {})
                        ).map(([group, cats]) => (
                          <optgroup key={group} label={group}>
                            {(cats as any[]).map((cat: any) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name} ({cat.intervalMonths} měs.)
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Pomůže nám správně hlídat termín další revize.</p>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* Step 4: Summary */}
          {currentStep === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-semibold text-white mb-4">Kontrola údajů</h3>
              
              <div className="bg-[#111] rounded-xl p-6 space-y-4 border border-white/5">
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-gray-400">Typ služby</span>
                  <span className="font-medium text-white">
                    {{
                      elektro_byt: 'Elektroinstalace - Byt',
                      elektro_dum: 'Elektroinstalace - Dům',
                      hromosvod: 'Hromosvod',
                      plyn: 'Plynové zařízení',
                      vlastni_revize: 'Vlastní hotová revize'
                    }[formData.serviceType as string] || formData.serviceType}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-gray-400">Typ objektu</span>
                  <span className="font-medium text-white">
                    {{
                      byt: 'Bytová jednotka',
                      dum: 'Rodinný dům',
                      firma: 'Firemní prostory',
                      svj: 'Společné prostory SVJ'
                    }[formData.propertyType as string] || formData.propertyType}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-gray-400">Adresa</span>
                  <span className="font-medium text-white text-right">{formData.propertyAddress}</span>
                </div>
                {formData.yearOfManufacture && (
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-gray-400">Rok stáří</span>
                    <span className="font-medium text-white text-right">{formData.yearOfManufacture}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-gray-400">
                    {formData.serviceType === 'vlastni_revize' ? 'Platnost do' : 'Preferovaný termín'}
                  </span>
                  <span className="font-medium text-white">{formData.preferredDate || (formData.serviceType === 'vlastni_revize' ? 'Nezadáno' : 'Dle domluvy')}</span>
                </div>
                {formData.serviceType !== 'vlastni_revize' && (
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-gray-400">Odhadovaná cena</span>
                    <span className="font-medium text-brand-yellow">
                      {(() => {
                        switch (formData.serviceType) {
                          case 'elektro_byt': return '2 500 Kč';
                          case 'elektro_dum': return '3 500 Kč';
                          case 'hromosvod': return '3 000 Kč';
                          case 'plyn': return '1 800 Kč';
                          default: return 'od 1 500 Kč';
                        }
                      })()}
                    </span>
                  </div>
                )}
                {formData.notes && (
                  <div className="py-2">
                    <span className="block text-gray-400 mb-1">Poznámka</span>
                    <p className="text-sm text-white bg-[#1A1A1A] p-3 rounded-lg border border-white/5">
                      {formData.notes}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-start gap-3 p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                <div className="mt-0.5">
                  <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-500">i</span>
                  </div>
                </div>
                <p className="text-sm text-gray-400">
                  Odesláním objednávky souhlasíte se zpracováním osobních údajů a obchodními podmínkami Revizone.
                </p>
              </div>
            </motion.div>
          )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-8 mt-8 border-t border-white/10">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1 || isSubmitting}
              className={cn(
                "px-6 py-2.5 rounded-lg font-medium transition-colors",
                currentStep === 1 
                  ? "text-gray-600 cursor-not-allowed" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              Zpět
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-2.5 bg-brand-yellow text-black font-semibold rounded-lg hover:bg-brand-yellow-hover transition-colors shadow-lg shadow-brand-yellow/10"
              >
                Pokračovat <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-2.5 bg-brand-yellow text-black font-semibold rounded-lg hover:bg-brand-yellow-hover transition-colors shadow-lg shadow-brand-yellow/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Odesílání...' : 'Závazně objednat'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
