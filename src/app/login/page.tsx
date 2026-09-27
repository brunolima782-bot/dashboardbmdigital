"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2, TrendingUp } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Não foi possível entrar");
        setLoading(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2">
      {/* Lado esquerdo - branding */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-black via-brand-950 to-brand-800 p-12 text-white relative overflow-hidden">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand-400/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-brand-400/10 blur-3xl" />

        <div className="relative flex items-center gap-4 text-3xl font-bold tracking-tight">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/bbm-digital-icon.jpeg"
            alt="BM Digital"
            className="h-14 w-14 rounded-xl object-cover ring-1 ring-white/20"
          />
          BM Digital
        </div>

        <div className="relative space-y-6 max-w-md">
          <p className="text-xs font-semibold tracking-[0.2em] text-brand-300 uppercase">
            Tráfego · Estratégia · Resultados
          </p>
          <h1 className="text-4xl font-bold leading-tight">
            Gestão profissional de tráfego pago para sua empresa.
          </h1>
          <p className="text-brand-100 text-lg leading-relaxed">
            A BM Digital cuida do seu tráfego pago em Meta Ads, Google Ads e LinkedIn Ads — aqui você
            acompanha o investimento e os resultados das suas campanhas em tempo real, com total
            transparência.
          </p>
          <div className="flex items-center gap-2 text-brand-100">
            <TrendingUp className="h-5 w-5" />
            <span className="text-sm">Seus relatórios sempre atualizados, a um clique de distância.</span>
          </div>
        </div>

        <p className="relative text-sm text-brand-300">
          &copy; {new Date().getFullYear()} BM Digital. Todos os direitos reservados.
        </p>
      </div>

      {/* Lado direito - formulário */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-slate-50 dark:bg-surface-dark">
        <div className="w-full max-w-sm space-y-8 animate-fade-in">
          <div className="lg:hidden flex items-center gap-3 text-2xl font-bold tracking-tight text-brand-700 dark:text-brand-300">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/bbm-digital-icon.jpeg"
              alt="BM Digital"
              className="h-12 w-12 rounded-xl object-cover"
            />
            BM Digital
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Entrar na plataforma</h2>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              Acesse o dashboard de gestão de tráfego pago.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="email">
                E-mail
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  required
                  className="input pl-10"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="password">
                Senha
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  required
                  className="input pl-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-sm text-red-700 dark:bg-red-950/40 dark:border-red-900 dark:text-red-300">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
