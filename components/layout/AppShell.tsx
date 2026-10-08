"use client";

import React, { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { getLocalCurrentUser, setLocalCurrentUser } from "@/lib/auth";
import { SEED_USERS } from "@/lib/constants";
import { Profile } from "@/types/database";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<Profile>(SEED_USERS[0]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setCurrentUser(getLocalCurrentUser());
    const handleAuthChange = () => {
      setCurrentUser(getLocalCurrentUser());
    };
    window.addEventListener("primarib-auth-change", handleAuthChange);
    return () =>
      window.removeEventListener("primarib-auth-change", handleAuthChange);
  }, []);

  if (pathname === "/login" || pathname.startsWith("/talent")) {
    return <>{children}</>;
  }

  const handleSwitchUser = (userId: string) => {
    const updated = setLocalCurrentUser(userId);
    setCurrentUser(updated);
  };

  const handleLogout = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#F4F5F8] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1600px] overflow-hidden bg-[#F8FAFC] lg:shadow-xs">
        <Suspense fallback={null}>
          <Sidebar
            currentUser={currentUser}
            isOpenMobile={isMobileMenuOpen}
            onCloseMobile={() => setIsMobileMenuOpen(false)}
            onLogout={handleLogout}
          />
        </Suspense>

        <div className="flex min-w-0 flex-1 flex-col bg-[#F8FAFC]">
          <Header
            currentUser={currentUser}
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
            onSwitchUser={handleSwitchUser}
          />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
