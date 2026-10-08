"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FilePlus2,
  Kanban,
  CalendarDays,
  SlidersHorizontal,
  LogOut,
  X,
  Plus,
} from "lucide-react";
import { Profile } from "@/types/database";

interface SidebarProps {
  currentUser: Profile;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onLogout: () => void;
}

export function Sidebar({
  currentUser,
  isOpenMobile,
  onCloseMobile,
  onLogout,
}: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Dashboard",
      description: "Ringkasan & progres jadwal",
      href: "/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      label: "Input Konten",
      description: "Buat ide, script & slide",
      href: "/content",
      icon: FilePlus2,
      active:
        pathname.startsWith("/content") || pathname.startsWith("/ideas"),
    },
    {
      label: "Production Board",
      description: "Susun jadwal drag & drop",
      href: "/production",
      icon: Kanban,
      active: pathname.startsWith("/production"),
    },
    {
      label: "Schedule Post",
      description: "Kalender tayang & talent",
      href: "/calendar",
      icon: CalendarDays,
      active: pathname.startsWith("/calendar"),
    },
    {
      label: "Settings",
      description: "Atur wilayah, pilar & format",
      href: "/settings",
      icon: SlidersHorizontal,
      active: pathname.startsWith("/settings"),
    },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white px-4 py-5 text-slate-800">
      {/* Top: Brand Header + Navigation */}
      <div className="flex min-h-0 flex-1 flex-col">
        {/* Brand Identity */}
        <div className="mb-6 flex items-center justify-between px-2">
          <Link
            href="/dashboard"
            onClick={onCloseMobile}
            className="flex items-center gap-3"
          >
            <img
              src="/logo.png"
              alt="Logo Prima RIB"
              className="h-9 w-9 shrink-0 rounded-xl object-contain shadow-2xs"
            />
            <div>
              <span className="block text-sm font-bold tracking-tight text-slate-900">
                Prima RIB
              </span>
              <span className="block text-[11px] font-medium text-slate-400">
                Content Planner
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
            aria-label="Tutup menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick CTA Button */}
        <div className="mb-5 px-1">
          <Link
            href="/content"
            onClick={onCloseMobile}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#6D4AFF] px-3.5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#5B38E8]"
          >
            <Plus className="h-4 w-4" />
            <span>Buat Konten Baru</span>
          </Link>
        </div>

        {/* Section Label */}
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Menu Utama
        </p>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${
                  item.active
                    ? "bg-[#F3F0FF] text-[#6D4AFF]"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                    item.active
                      ? "bg-[#6D4AFF] text-white"
                      : "bg-slate-100 text-slate-500 group-hover:bg-slate-200/70 group-hover:text-slate-700"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate text-xs ${
                      item.active
                        ? "font-bold text-slate-900"
                        : "font-semibold text-slate-700"
                    }`}
                  >
                    {item.label}
                  </p>
                  <p className="truncate text-[10px] text-slate-400">
                    {item.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Shortcut View Talent, Pola Jadwal Rutin & User Footer */}
      <div className="space-y-3 border-t border-slate-100 pt-4">
        <Link
          href="/talent"
          target="_blank"
          onClick={onCloseMobile}
          className="flex items-center justify-between rounded-xl border border-[#DCD4FF] bg-[#F3F0FF]/80 px-3 py-2.5 text-xs font-bold text-[#6D4AFF] transition hover:bg-[#6D4AFF] hover:text-white"
        >
          <span>Halaman View Talent</span>
          <span className="rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-extrabold text-[#6D4AFF]">
            View-Only ↗
          </span>
        </Link>

        <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3">
          <p className="text-[11px] font-bold text-slate-800">
            Pola Jadwal Mingguan
          </p>
          <div className="mt-2 space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between text-slate-600">
              <span>Senin, Rabu, Jumat</span>
              <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200/60">
                Feed
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Selasa & Kamis</span>
              <span className="rounded bg-[#F3F0FF] px-1.5 py-0.5 text-[10px] font-semibold text-[#6D4AFF] border border-[#DCD4FF]">
                Reel
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
              {currentUser.full_name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-800">
                {currentUser.full_name}
              </p>
              <p className="truncate text-[10px] text-slate-400">
                Admin Content Plan
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            title="Keluar"
            aria-label="Keluar"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col border-r border-slate-200/80 bg-white">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative z-50 flex w-72 max-w-[85vw] flex-col overflow-hidden bg-white shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
