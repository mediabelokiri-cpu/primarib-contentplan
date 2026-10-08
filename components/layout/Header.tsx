"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  Search,
  Bell,
  FileText,
  CalendarDays,
  Kanban,
  Plus,
  Clock,
} from "lucide-react";
import { Profile } from "@/types/database";
import { useAppStore } from "@/lib/store";
import { formatDateTime } from "@/lib/utils";

interface HeaderProps {
  currentUser: Profile;
  onOpenMobileMenu: () => void;
  onSwitchUser: (userId: string) => void;
}

export function Header({
  currentUser,
  onOpenMobileMenu,
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { enrichedContents } = useAppStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [readNotifIds, setReadNotifIds] = useState<string[]>([]);

  const getPageMeta = () => {
    if (pathname === "/dashboard") {
      return {
        title: "Dashboard",
        subtitle: "Ringkasan rencana konten & distribusi jadwal tayang Prima RIB",
      };
    }
    if (pathname.startsWith("/content") || pathname.startsWith("/ideas")) {
      return {
        title: "Input Konten",
        subtitle: "Buat ide konten baru, poin script Reel, dan isi per slide Carousel",
      };
    }
    if (pathname.startsWith("/production")) {
      return {
        title: "Production Board",
        subtitle: "Susun jadwal tayang Senin–Jumat dengan Drag & Drop",
      };
    }
    if (pathname.startsWith("/calendar")) {
      return {
        title: "Schedule Post",
        subtitle: "Kalender tayang konten & panduan script untuk Talent",
      };
    }
    if (pathname.startsWith("/settings")) {
      return {
        title: "Settings",
        subtitle: "Kelola Wilayah Konten, Pilar, Format, dan Platform",
      };
    }
    return {
      title: "Dashboard",
      subtitle: "Prima RIB Content Plan",
    };
  };

  const pageMeta = getPageMeta();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setIsSearchFocused(false);
    router.push(`/content?q=${encodeURIComponent(q)}`);
  };

  const activeContents = enrichedContents.filter(
    (c) => c.status !== "ARCHIVED"
  );

  const q = searchQuery.trim().toLowerCase();
  const matchedContents = q
    ? activeContents
        .filter(
          (c) =>
            c.title.toLowerCase().includes(q) ||
            c.content_code.toLowerCase().includes(q) ||
            (c.program?.name || "").toLowerCase().includes(q) ||
            (c.pillar?.name || "").toLowerCase().includes(q) ||
            (c.talent_category || "").toLowerCase().includes(q)
        )
        .slice(0, 6)
    : [];

  // Scheduled notifications
  const notifications = activeContents
    .filter((c) => c.scheduled_at)
    .slice(0, 5)
    .map((c) => ({
      id: `notif-sched-${c.id}`,
      title: c.title,
      subtitle: `${c.program?.name || "CPNS"} • ${
        c.format?.name || "Konten"
      } • ${formatDateTime(c.scheduled_at)}`,
      href: `/calendar`,
    }));

  const unreadCount = notifications.filter(
    (n) => !readNotifIds.includes(n.id)
  ).length;

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-xs sm:px-6 lg:px-8">
      {/* Left: Mobile Menu, Brand Logo & Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 lg:hidden"
          aria-label="Buka menu navigasi"
        >
          <Menu className="h-4 w-4" />
        </button>

        <img
          src="/logo.png"
          alt="Logo Prima RIB"
          className="h-8 w-8 shrink-0 rounded-xl object-contain lg:hidden"
        />

        <div className="min-w-0">
          <h1 className="truncate text-base font-bold tracking-tight text-slate-900 sm:text-lg">
            {pageMeta.title}
          </h1>
          <p className="hidden truncate text-xs text-slate-500 md:block">
            {pageMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Search Bar, Quick Shortcuts & Notifications */}
      <div className="flex items-center gap-2.5">
        {/* Global Search Input */}
        <div className="relative w-44 sm:w-64">
          <form onSubmit={handleSearchSubmit}>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 180)}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul, wilayah, talent..."
              className="w-full rounded-xl border border-slate-200/90 bg-slate-50/80 py-1.5 pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 transition focus:border-[#6D4AFF] focus:bg-white focus:outline-none"
            />
          </form>

          {isSearchFocused && q.length > 0 && (
            <div className="absolute right-0 left-0 mt-1.5 max-h-[65vh] min-w-[290px] overflow-y-auto rounded-xl border border-slate-200 bg-white p-2.5 shadow-xl">
              {matchedContents.length === 0 ? (
                <p className="py-4 text-center text-xs text-slate-400">
                  Tidak ada konten untuk &ldquo;{searchQuery}&rdquo;
                </p>
              ) : (
                <div className="space-y-1 text-xs">
                  <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Hasil Pencarian ({matchedContents.length})
                  </p>
                  {matchedContents.map((c) => (
                    <Link
                      key={c.id}
                      href="/calendar"
                      className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 hover:bg-slate-50"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-800">
                          {c.title}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {c.program?.name} • {c.format?.name}
                          {c.talent_category ? ` (${c.talent_category})` : ""}
                        </p>
                      </div>
                      <FileText className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Nav Buttons on Desktop */}
        <Link
          href="/production"
          className="hidden items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 xl:inline-flex"
        >
          <Kanban className="h-3.5 w-3.5 text-[#6D4AFF]" />
          <span>Production Board</span>
        </Link>

        <Link
          href="/calendar"
          className="hidden items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 sm:inline-flex"
        >
          <CalendarDays className="h-3.5 w-3.5 text-[#6D4AFF]" />
          <span>Schedule Post</span>
        </Link>

        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications((prev) => !prev)}
            className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            aria-label="Jadwal Terdekat"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#6D4AFF]" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-1.5 w-80 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xl">
              <div className="mb-2.5 flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-900">
                  Jadwal Konten Terdekat ({unreadCount})
                </span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      setReadNotifIds(notifications.map((n) => n.id))
                    }
                    className="text-[11px] font-semibold text-[#6D4AFF] hover:underline"
                  >
                    Tandai dibaca
                  </button>
                )}
              </div>

              <div className="max-h-72 space-y-1.5 overflow-y-auto text-xs">
                {notifications.length === 0 ? (
                  <p className="py-4 text-center text-slate-400">
                    Belum ada jadwal konten aktif.
                  </p>
                ) : (
                  notifications.map((notif) => {
                    const isRead = readNotifIds.includes(notif.id);
                    return (
                      <Link
                        key={notif.id}
                        href={notif.href}
                        onClick={() => {
                          setReadNotifIds((prev) =>
                            prev.includes(notif.id)
                              ? prev
                              : [...prev, notif.id]
                          );
                          setShowNotifications(false);
                        }}
                        className={`flex items-start gap-2.5 rounded-lg border p-2.5 transition ${
                          isRead
                            ? "border-slate-100 bg-white opacity-60"
                            : "border-slate-200/80 bg-slate-50/70 hover:border-[#6D4AFF]/40"
                        }`}
                      >
                        <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#6D4AFF]" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-slate-800">
                            {notif.title}
                          </p>
                          <p className="mt-0.5 truncate text-[11px] text-slate-500">
                            {notif.subtitle}
                          </p>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
