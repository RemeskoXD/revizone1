"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function NewOrderPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    serviceType: "Elektroinstalace",
    propertyType: "Byt",
    address: "",
    notes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        const data = await res.json();
        setError(data.message || "Došlo k chybě při vytváření objednávky");
      }
    } catch (err) {
      setError("Došlo k chybě při vytváření objednávky");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8 flex items-center gap-4">
              <Link href="/dashboard" className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Nová objednávka revize</h1>
                <p className="text-gray-400 text-sm mt-1">Vyplňte formulář pro objednání nové revize</p>
              </div>
            </div>

            {success ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Objednávka byla úspěšně vytvořena</h2>
                <p className="text-gray-400">Budete přesměrováni zpět na nástěnku...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-[#111111] border border-white/5 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-4 rounded-xl">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Typ revize</label>
                    <select
                      name="serviceType"
                      value={formData.serviceType}
                      onChange={handleChange}
                      className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-yellow/50 transition-colors"
                    >
                      <option value="Elektroinstalace">Elektroinstalace</option>
                      <option value="Hromosvody">Hromosvody</option>
                      <option value="Spotřebiče">Spotřebiče</option>
                      <option value="Plyn">Plyn</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Typ objektu</label>
                    <select
                      name="propertyType"
                      value={formData.propertyType}
                      onChange={handleChange}
                      className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-yellow/50 transition-colors"
                    >
                      <option value="Byt">Byt</option>
                      <option value="Rodinný dům">Rodinný dům</option>
                      <option value="Kancelář">Kancelář</option>
                      <option value="Průmyslová hala">Průmyslová hala</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Adresa objektu</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Např. Václavské náměstí 1, Praha 1"
                    required
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-brand-yellow/50 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Doplňující informace (volitelné)</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Specifické požadavky, preferovaný čas..."
                    rows={4}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-brand-yellow/50 transition-colors resize-none"
                  ></textarea>
                </div>

                <div className="pt-4 flex justify-end gap-4">
                  <Link
                    href="/dashboard"
                    className="px-6 py-3 rounded-xl font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Zrušit
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-brand-yellow hover:bg-brand-yellow-hover text-black font-bold py-3 px-8 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Odeslat objednávku"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
