"use client";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import UserDropdown from "@/components/header/UserDropdown";
import Logo from "@/components/common/Logo";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/app/actions/auth.actions";
import { User, Wallet, ArrowUpRight, Settings, LogOut } from "lucide-react";
import React, { useState, useTransition } from "react";

const AppHeader: React.FC<{ user: any }> = ({ user }) => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const toggleApplicationMenu = () => {
    setApplicationMenuOpen(!isApplicationMenuOpen);
  };

  const closeMenu = () => setApplicationMenuOpen(false);

  const handleLogout = () => {
    startTransition(async () => {
      await logoutUser();
      router.push("/signin");
      router.refresh();
    });
  };

  const formatSolde = (amount: number) =>
    amount.toLocaleString("fr-FR") + " FC";

  const getInitials = (name: string) =>
    name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || name.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 flex w-full bg-white border-gray-200 z-99999 dark:border-gray-800 dark:bg-gray-900 lg:border-b">
      <div className="flex items-center justify-between w-full px-4 py-2.5 lg:px-6 lg:py-3">
        {/* Logo */}
        <Logo width={56} height={56} />

        {/* Mobile menu toggle */}
        <button
          onClick={toggleApplicationMenu}
          className="flex items-center justify-center w-10 h-10 text-gray-700 rounded-lg z-99999 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
          aria-label="Menu"
        >
          {isApplicationMenuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z" fill="currentColor" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M5.99902 10.4951C6.82745 10.4951 7.49902 11.1667 7.49902 11.9951V12.0051C7.49902 12.8335 6.82745 13.5051 5.99902 13.5051C5.1706 13.5051 4.49902 12.8335 4.49902 12.0051V11.9951C4.49902 11.1667 5.1706 10.4951 5.99902 10.4951ZM17.999 10.4951C18.8275 10.4951 19.499 11.1667 19.499 11.9951V12.0051C19.499 12.8335 18.8275 13.5051 17.999 13.5051C17.1706 13.5051 16.499 12.8335 16.499 12.0051V11.9951C16.499 11.1667 17.1706 10.4951 17.999 10.4951ZM13.499 11.9951C13.499 11.1667 12.8275 10.4951 11.999 10.4951C11.1706 10.4951 10.499 11.1667 10.499 11.9951V12.0051C10.499 12.8335 11.1706 13.5051 11.999 13.5051C12.8275 13.5051 13.499 12.8335 13.499 12.0051V11.9951Z" fill="currentColor" />
            </svg>
          )}
        </button>

        {/* Desktop right side (always visible) */}
        <div className="hidden lg:flex items-center gap-3">
          <ThemeToggleButton />
          <UserDropdown user={user} />
        </div>
      </div>

      {/* Mobile Modal centrée */}
      {isApplicationMenuOpen && (
        <div className="fixed inset-0 z-99998 flex items-center justify-center p-4 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeMenu}
          />
          {/* Modal panel centrée */}
          <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl animate-popIn overflow-hidden">
            {/* Bouton fermer */}
            <button
              onClick={closeMenu}
              className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>

            <div className="flex flex-col items-center gap-5 px-6 py-8">
              {/* Avatar + infos utilisateur */}
              <div className="flex flex-col items-center gap-2">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-600 dark:bg-brand-600/20 dark:text-brand-400">
                  {user?.photo ? (
                    <img src={user.photo} alt={user?.pseudo} className="h-full w-full rounded-full object-cover" />
                  ) : (
                    getInitials(user?.pseudo || "?")
                  )}
                </span>
                <span className="text-sm font-semibold text-gray-800 dark:text-white/90">
                  {user?.pseudo}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.telephone}
                </span>
                {user?.role === "PLAYER" ? (
                  <span className="text-xs font-medium text-brand-600 dark:text-brand-400">
                    🎮 {user?.profile?.parties ?? 0} parties
                  </span>
                ) : (
                  <span className="text-xs font-medium text-success-600 dark:text-success-400">
                    💰 {formatSolde(user?.solde ?? 0)}
                  </span>
                )}
              </div>

              {/* Liens de navigation */}
              <div className="w-full space-y-1">
                <Link href="/profile" onClick={closeMenu} className="flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5">
                  <User className="h-4 w-4" /> Mon Profil
                </Link>
                {user?.role === "PLAYER" && (
                  <Link href="/recharges" onClick={closeMenu} className="flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5">
                    <Wallet className="h-4 w-4" /> Recharges
                  </Link>
                )}
                <Link href="/retraits" onClick={closeMenu} className="flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5">
                  <ArrowUpRight className="h-4 w-4" /> Retraits
                </Link>
                <Link href={user?.role === "ADMIN" ? "/autorisations" : "/recharges"} onClick={closeMenu} className="flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5">
                  <Settings className="h-4 w-4" /> {user?.role === "ADMIN" ? "Administration" : "Paramètres"}
                </Link>
              </div>

              {/* Séparateur */}
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />

              {/* Theme toggle */}
              <ThemeToggleButton />

              {/* Déconnexion */}
              <button
                onClick={handleLogout}
                disabled={isPending}
                className="flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-500/10"
              >
                <LogOut className="h-4 w-4" />
                {isPending ? "Déconnexion..." : "Déconnexion"}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default AppHeader;
