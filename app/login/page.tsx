"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { SEED_USERS } from "@/lib/constants";
import { setLocalCurrentUser } from "@/lib/auth";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("idam@primarib.com");
  const [password, setPassword] = useState("primarib2026");
  const [selectedUserId, setSelectedUserId] = useState(SEED_USERS[0].id);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (authError) {
          setError(authError.message);
          setLoading(false);
          return;
        }
      } else {
        // Localhost development mode
        const matchedByEmail = SEED_USERS.find(
          (u) => u.email?.toLowerCase() === email.trim().toLowerCase()
        );
        setLocalCurrentUser(matchedByEmail ? matchedByEmail.id : selectedUserId);
      }

      router.push("/dashboard");
    } catch {
      setError("Terjadi kesalahan saat login. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoSelect = (userId: string) => {
    setSelectedUserId(userId);
    const user = SEED_USERS.find((u) => u.id === userId);
    if (user?.email) {
      setEmail(user.email);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-[#284078] px-4 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          src="/logo.png"
          alt="Logo Prima RIB"
          className="mx-auto h-16 w-16 rounded-2xl object-contain shadow-lg"
        />
        <h1 className="mt-4 text-center text-2xl font-bold tracking-tight text-white">
          PRIMA RIB CONTENT PLAN
        </h1>
        <p className="mt-1 text-center text-sm text-white/75">
          Internal Content Management & Production Workflow System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                Email
              </label>
              <div className="relative mt-1.5">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm text-slate-900 focus:border-[#284078] focus:outline-none"
                  placeholder="nama@primarib.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                Password
              </label>
              <div className="relative mt-1.5">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm text-slate-900 focus:border-[#284078] focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#284078] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1e305a] disabled:opacity-50"
            >
              <span>{loading ? "Memproses..." : "Login ke Dashboard"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Localhost Quick Role Login Selector */}
          <div className="mt-6 border-t border-slate-100 pt-5">
            <div className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <ShieldCheck className="h-4 w-4 text-[#DDB02E]" />
              <span>Mode Pengembangan Localhost — Pilih Akun Role:</span>
            </div>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {SEED_USERS.map((user) => {
                const isSelected = selectedUserId === user.id;
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleQuickDemoSelect(user.id)}
                    className={`flex flex-col items-start rounded-lg border p-2 text-left transition ${
                      isSelected
                        ? "border-[#284078] bg-[#284078]/5"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-xs font-semibold text-slate-800">
                      {user.full_name}
                    </span>
                    <span className="text-[10px] font-medium text-[#284078]">
                      {user.roles?.join(" + ")}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
