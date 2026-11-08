"use client";

import React, { useState, useEffect } from "react";
import {
  Download,
  Smartphone,
  Share,
  PlusSquare,
  CheckCircle2,
  X,
  Info,
  Check,
} from "lucide-react";

interface TalentInstallPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDismissForever?: () => void;
  deferredPrompt?: any;
}

export function TalentInstallPromptModal({
  isOpen,
  onClose,
  onDismissForever,
  deferredPrompt: propDeferredPrompt,
}: TalentInstallPromptModalProps) {
  const [deviceType, setDeviceType] = useState<"ANDROID" | "IOS" | "OTHER">("ANDROID");
  const [localDeferredPrompt, setLocalDeferredPrompt] = useState<any>(null);
  const [isInstalledSuccess, setIsInstalledSuccess] = useState(false);
  const [showAndroidManualTip, setShowAndroidManualTip] = useState(false);

  // Active deferredPrompt between prop or captured local event
  const activePrompt = propDeferredPrompt || localDeferredPrompt;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ua = window.navigator.userAgent.toLowerCase();
    const isIos =
      /iphone|ipad|ipod/.test(ua) ||
      (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);
    const isAndroid = /android/.test(ua);

    if (isIos) {
      setDeviceType("IOS");
    } else if (isAndroid) {
      setDeviceType("ANDROID");
    } else {
      setDeviceType("OTHER");
    }

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setLocalDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalledSuccess(true);
      setLocalDeferredPrompt(null);
      setTimeout(() => {
        onClose();
      }, 2500);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [onClose]);

  if (!isOpen) return null;

  const handleInstallAndroid = async () => {
    if (activePrompt) {
      try {
        activePrompt.prompt();
        const choice = await activePrompt.userChoice;
        if (choice.outcome === "accepted") {
          setIsInstalledSuccess(true);
          setTimeout(() => onClose(), 2200);
        } else {
          onClose();
        }
      } catch (err) {
        setShowAndroidManualTip(true);
      }
    } else {
      setShowAndroidManualTip(true);
    }
  };

  const handleDismiss = () => {
    // Simpan tanda dismiss ke localStorage (berlaku 2 hari)
    try {
      localStorage.setItem(
        "prima_talent_install_dismissed_until",
        String(Date.now() + 2 * 24 * 60 * 60 * 1000)
      );
    } catch (e) {
      // ignore
    }
    if (onDismissForever) onDismissForever();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-slate-900 animate-in slide-in-from-bottom-6 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="relative bg-[#284078] text-white px-5 pt-5 pb-4">
          <button
            type="button"
            onClick={handleDismiss}
            className="absolute top-4 right-4 rounded-full p-1.5 text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition"
            aria-label="Tutup"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Prima RIB Talent"
              className="h-11 w-11 rounded-2xl bg-white p-1.5 object-contain shadow-md shrink-0"
            />
            <div className="min-w-0">
              <span className="inline-block rounded-md bg-[#DDB02E] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#284078]">
                {deviceType === "IOS" ? "Apple iOS (iPhone)" : "Android App"}
              </span>
              <h3 className="text-base font-extrabold text-white leading-tight mt-0.5 truncate">
                {deviceType === "IOS"
                  ? "Tambahkan ke Layar Utama"
                  : "Pasang Aplikasi Prima RIB"}
              </h3>
            </div>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="p-5 max-h-[75vh] overflow-y-auto space-y-4">
          {isInstalledSuccess ? (
            <div className="py-6 text-center space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h4 className="text-base font-bold text-slate-900">
                Aplikasi Berhasil Dipasang!
              </h4>
              <p className="text-xs text-slate-500">
                Ikon Prima RIB Talent kini sudah ada di Layar Utama HP Anda.
              </p>
            </div>
          ) : deviceType === "IOS" ? (
            /* ============================================================= */
            /* iOS (IPHONE / IPAD) TUTORIAL STEP-BY-STEP                     */
            /* ============================================================= */
            <div className="space-y-3.5">
              <p className="text-xs text-slate-600 leading-relaxed">
                Jadikan <strong>Prima RIB Talent</strong> aplikasi layar penuh di iPhone Anda tanpa URL bar Safari:
              </p>

              {/* Step 1 */}
              <div className="flex items-start gap-3 rounded-2xl border border-slate-200/90 bg-slate-50/70 p-3.5 transition hover:bg-slate-50">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#284078] text-white shadow-xs">
                  <Share className="h-4 w-4" />
                </div>
                <div className="text-xs leading-snug">
                  <span className="font-extrabold text-[#284078] block mb-0.5">
                    Langkah 1: Ketuk Ikon Bagikan (Share)
                  </span>
                  <span className="text-slate-600">
                    Ketuk tombol <strong>Bagikan</strong> (ikon kotak dengan panah ke atas) pada bilah navigasi bawah browser Safari.
                  </span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3 rounded-2xl border border-slate-200/90 bg-slate-50/70 p-3.5 transition hover:bg-slate-50">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#DDB02E] text-[#284078] shadow-xs">
                  <PlusSquare className="h-4 w-4" />
                </div>
                <div className="text-xs leading-snug">
                  <span className="font-extrabold text-[#284078] block mb-0.5">
                    Langkah 2: Pilih Tambahkan ke Layar Utama
                  </span>
                  <span className="text-slate-600">
                    Gulir ke bawah pada menu opsi hingga menemukan <strong>"Tambahkan ke Layar Utama"</strong> (<em>Add to Home Screen</em>).
                  </span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3 rounded-2xl border border-slate-200/90 bg-slate-50/70 p-3.5 transition hover:bg-slate-50">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                  <Check className="h-4 w-4" />
                </div>
                <div className="text-xs leading-snug">
                  <span className="font-extrabold text-[#284078] block mb-0.5">
                    Langkah 3: Ketuk Tambah (Add)
                  </span>
                  <span className="text-slate-600">
                    Ketuk tombol <strong>"Tambah"</strong> di sudut kanan atas layar iPhone Anda.
                  </span>
                </div>
              </div>

              {/* Benefit Note */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-2.5 text-[11px] text-amber-900 flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-[#284078] shrink-0" />
                <span>
                  Selesai! Aplikasi akan terbuka otomatis dari Homescreen layaknya aplikasi App Store.
                </span>
              </div>
            </div>
          ) : (
            /* ============================================================= */
            /* ANDROID (CHROME / SAMSUNG INTERNET) VIEW                      */
            /* ============================================================= */
            <div className="space-y-3.5">
              <p className="text-xs text-slate-600 leading-relaxed">
                Pasang portal jadwal dan panduan shooting talent langsung di layar utama HP Android Anda:
              </p>

              {/* Key Features */}
              <div className="space-y-2 rounded-2xl bg-slate-50 border border-slate-200/80 p-3">
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Akses instan 1x ketuk tanpa repot mengetik link</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Lihat jadwal shooting & naskah secara fullscreen</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Hemat memori & kuota, selalu tersinkron otomatis</span>
                </div>
              </div>

              {/* Fallback Tip if manual install is needed */}
              {showAndroidManualTip && (
                <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-xs text-sky-900 flex items-start gap-2">
                  <Info className="h-4 w-4 text-sky-700 shrink-0 mt-0.5" />
                  <div className="leading-snug">
                    <strong>Panduan Manual:</strong> Ketuk tombol menu titik tiga (<strong>⋮</strong>) di sudut kanan atas Chrome, lalu pilih <strong>"Instal aplikasi"</strong> atau <strong>"Tambahkan ke Layar Utama"</strong>.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* MODAL FOOTER ACTIONS */}
        <div className="border-t border-slate-100 bg-slate-50/80 px-5 py-4">
          {deviceType === "IOS" ? (
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleDismiss}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#284078] py-3 text-xs font-bold text-white shadow-md hover:bg-[#1e315e] active:scale-98 transition"
              >
                <span>Saya Mengerti & Siap Pasang</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <button
                type="button"
                onClick={handleInstallAndroid}
                className="w-full flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#284078] py-3 text-xs font-bold text-white shadow-md hover:bg-[#1e315e] active:scale-98 transition"
              >
                <Download className="h-4 w-4 text-[#DDB02E]" />
                <span>Install Aplikasi Sekarang</span>
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-600 hover:bg-slate-100 active:scale-98 transition"
              >
                Nanti Saja
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
