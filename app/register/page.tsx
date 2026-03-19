"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "motion/react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/login";
  const inviteCode = searchParams.get("invite");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(inviteCode ? "PENDING_SUPPORT" : "CUSTOMER");
  const [companyId, setCompanyId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<{id: string, name: string | null, email: string | null}[]>([]);

  useEffect(() => {
    if (role === "TECHNICIAN") {
      fetch("/api/public/companies")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setCompanies(data);
          }
        })
        .catch(err => console.error("Failed to load companies", err));
    }
  }, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          role, 
          companyId: role === "TECHNICIAN" ? companyId : undefined,
          inviteCode 
        }),
      });

      if (res.ok) {
        if (inviteCode) {
          router.push(`/login?message=${encodeURIComponent('Registrace byla úspěšná. Nyní vyčkejte na schválení administrátorem.')}`);
        } else {
          router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
        }
      } else {
        const data = await res.json();
        setError(data.message || "Došlo k chybě při registraci");
      }
    } catch (err) {
      setError("Došlo k chybě při registraci");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#111111] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-yellow/5 rounded-full blur-3xl pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md bg-[#1A1A1A] border border-white/10 rounded-2xl p-8 shadow-2xl"
      >
        <div className="flex justify-center mb-6">
          <div className="relative flex items-center justify-center w-12 h-12 bg-brand-yellow rounded-xl shadow-lg shadow-brand-yellow/20">
            <ShieldCheck className="w-7 h-7 text-black" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white text-center mb-2">
          {inviteCode ? 'Připojit se k týmu' : 'Registrace'}
        </h1>
        <p className="text-gray-400 text-center text-sm mb-8">
          {inviteCode ? 'Vytvořte si účet zaměstnance' : 'Vytvořte si účet v REVIZONE APLIKACE'}
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Jméno a příjmení</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#111111] border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-brand-yellow/50 transition-colors"
              placeholder="Jan Novák"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#111111] border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-brand-yellow/50 transition-colors"
              placeholder="vas@email.cz"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Heslo</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#111111] border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-brand-yellow/50 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Typ účtu</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-[#111111] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-yellow/50 transition-colors"
            >
              {inviteCode ? (
                <>
                  <option value="PENDING_SUPPORT">Podpora</option>
                  <option value="PENDING_CONTRACTOR">Zhotovitel</option>
                </>
              ) : (
                <>
                  <option value="CUSTOMER">Zákazník</option>
                  <option value="TECHNICIAN">Revizní technik</option>
                  <option value="COMPANY_ADMIN">Firma</option>
                  <option value="ADMIN">Administrátor</option>
                  <option value="REALTY">Realitní makléř</option>
                </>
              )}
            </select>
          </div>

          {role === "TECHNICIAN" && !inviteCode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="overflow-hidden"
            >
              <label className="block text-sm font-medium text-gray-300 mb-1 mt-2">Připojit se k firmě (volitelné)</label>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full bg-[#111111] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-yellow/50 transition-colors"
              >
                <option value="">-- Bez firmy --</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.name || company.email}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Pokud vyberete firmu, bude jí odeslána žádost o připojení.
              </p>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-yellow hover:bg-brand-yellow-hover text-black font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Zaregistrovat se"}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Již máte účet?{" "}
          <Link href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="text-white hover:text-brand-yellow transition-colors">
            Přihlásit se
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#111111]"><Loader2 className="w-8 h-8 animate-spin text-brand-yellow" /></div>}>
      <RegisterForm />
    </Suspense>
  );
}
