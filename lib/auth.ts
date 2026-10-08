import { Profile, RoleName } from "@/types/database";
import { SEED_USERS } from "@/lib/constants";

const LOCAL_AUTH_STORAGE_KEY = "primarib_current_user_id";
const STORE_KEY = "primarib_content_plan_store_v1";

function getUsersFromLocalStore(): Profile[] {
  if (typeof window === "undefined") return SEED_USERS;
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return SEED_USERS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.users) && parsed.users.length > 0) {
      return parsed.users as Profile[];
    }
    return SEED_USERS;
  } catch {
    return SEED_USERS;
  }
}

export function getLocalCurrentUser(): Profile {
  if (typeof window === "undefined") {
    return SEED_USERS[0];
  }
  const users = getUsersFromLocalStore();
  const storedUserId = window.localStorage.getItem(LOCAL_AUTH_STORAGE_KEY);
  const found = users.find((u) => u.id === storedUserId && u.is_active);
  return found || users.find((u) => u.is_active) || SEED_USERS[0];
}

export function setLocalCurrentUser(userId: string): Profile {
  const users = getUsersFromLocalStore();
  const found = users.find((u) => u.id === userId) || users[0] || SEED_USERS[0];
  if (typeof window !== "undefined") {
    window.localStorage.setItem(LOCAL_AUTH_STORAGE_KEY, found.id);
    window.dispatchEvent(new Event("primarib-auth-change"));
  }
  return found;
}

// ============================================================================
// ROLE-BASED ACCESS CONTROL (RBAC) HELPERS (Masterplan Section 22 & PRD 03)
// ============================================================================
export function hasRole(user: Profile | null, role: RoleName): boolean {
  if (!user || !user.roles) return false;
  return user.roles.includes("Admin") || user.roles.includes(role);
}

export function isAdmin(user: Profile | null): boolean {
  return Boolean(user?.roles?.includes("Admin"));
}

export function isAdminOrPlanner(user: Profile | null): boolean {
  if (!user || !user.roles) return false;
  return (
    user.roles.includes("Admin") || user.roles.includes("Content Planner")
  );
}

export function canAccessSettings(user: Profile | null): boolean {
  return isAdminOrPlanner(user);
}

export function canManageUsers(user: Profile | null): boolean {
  return isAdmin(user);
}

export function canReviewAndApprove(user: Profile | null): boolean {
  if (!user || !user.roles) return false;
  return (
    user.roles.includes("Admin") ||
    user.roles.includes("Reviewer") ||
    user.roles.includes("Content Planner")
  );
}

export function canDeletePermanently(user: Profile | null): boolean {
  return isAdmin(user);
}

export function getRoleFocusDescription(user: Profile | null): string {
  if (!user || !user.roles || user.roles.length === 0) return "Team Member";
  if (user.roles.includes("Admin")) {
    return "Full Access — Mengelola seluruh sistem, workflow, & user";
  }
  if (user.roles.includes("Content Planner")) {
    return "Planning Focus — Mengelola Ide, Kalender, Brief, & Assignment";
  }
  if (user.roles.includes("Reviewer")) {
    return "Quality Control — Memeriksa, meminta revisi, & menyetujui konten";
  }
  if (user.roles.includes("Copywriter")) {
    return "Copywriting Focus — Menyusun Hook, Main Copy, Caption, CTA, & Script";
  }
  if (user.roles.includes("Designer")) {
    return "Visual Focus — Melihat Creative Brief & mengupload asset Desain";
  }
  if (user.roles.includes("Video Editor")) {
    return "Video Focus — Melihat Script & mengupload asset Video/Reels";
  }
  return user.roles.join(" • ");
}
