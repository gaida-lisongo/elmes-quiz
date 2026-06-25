"use client";

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { User, Settings, HelpCircle, LogOut, Wallet, ArrowUpRight } from 'lucide-react';
import { Dropdown } from '@/components/ui/dropdown/Dropdown';
import { DropdownItem } from '@/components/ui/dropdown/DropdownItem';
import { logoutUser } from '@/app/actions/auth.actions';

interface UserDropdownProps {
  user: {
    _id: string;
    pseudo: string;
    telephone: string;
    email?: string | null;
    photo?: string | null;
    solde: number;
    role: string;
    profile?: any;
  } | null;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || name.charAt(0).toUpperCase();
}

function getSettingsLink(role: string): string {
  if (role === 'ADMIN') return '/autorisations';
  return '/recharges'; // PLAYER ou MOD
}

export default function UserDropdown({ user }: UserDropdownProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function toggleDropdown(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  function handleLogout() {
    startTransition(async () => {
      await logoutUser();
      router.push('/signin');
      router.refresh();
    });
  }

  const formatSolde = (amount: number) =>
    amount.toLocaleString('fr-FR') + ' FC';

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-2 text-gray-700 dark:text-gray-400 dropdown-toggle"
      >
        <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-brand-100 text-sm font-bold text-brand-600 dark:bg-brand-600/20 dark:text-brand-400">
          {user?.photo ? (
            <img
              src={user.photo}
              alt={user.pseudo}
              className="h-full w-full object-cover"
            />
          ) : (
            getInitials(user?.pseudo || '?')
          )}
        </span>
        <span className="hidden text-sm font-medium text-gray-700 dark:text-gray-300 md:block">
          {user?.pseudo || '...'}
        </span>
        <svg
          className={`hidden h-4 w-4 stroke-gray-500 transition-transform duration-200 dark:stroke-gray-400 md:block ${
            isOpen ? 'rotate-180' : ''
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[280px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        {/* En-tête : infos utilisateur */}
        <div className="border-b border-gray-100 pb-3 dark:border-gray-800">
          <span className="block text-sm font-semibold text-gray-800 dark:text-white/90">
            {user?.pseudo}
          </span>
          <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
            {user?.telephone}
          </span>
          {user && (
            <>
              {user.role === 'PLAYER' ? (
                <span className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-brand-600 dark:text-brand-400">
                  <Wallet className="h-3.5 w-3.5" />
                  Parties : {user.profile?.parties ?? 0}
                </span>
              ) : (
                <span className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-success-600 dark:text-success-400">
                  <Wallet className="h-3.5 w-3.5" />
                  Solde : {formatSolde(user.solde)}
                </span>
              )}
            </>
          )}
        </div>

        {/* Menu items */}
        <ul className="flex flex-col gap-1 py-3">
          <li>
            <DropdownItem onItemClick={closeDropdown} tag="a" href="/profile" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300">
              <User className="h-5 w-5 text-gray-400" />
              Mon Profil
            </DropdownItem>
          </li>
          {user?.role === 'PLAYER' && (
            <li>
              <DropdownItem onItemClick={closeDropdown} tag="a" href="/recharges" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300">
                <Wallet className="h-5 w-5 text-gray-400" />
                Recharges
              </DropdownItem>
            </li>
          )}
          <li>
            <DropdownItem onItemClick={closeDropdown} tag="a" href="/retraits" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300">
              <ArrowUpRight className="h-5 w-5 text-gray-400" />
              Retraits
            </DropdownItem>
          </li>
          <li>
            <DropdownItem onItemClick={closeDropdown} tag="a" href={user ? getSettingsLink(user.role) : '/recharges'} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300">
              <Settings className="h-5 w-5 text-gray-400" />
              {user?.role === 'ADMIN' ? "Panneau d'administration" : 'Paramètres'}
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/support"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              <HelpCircle className="h-5 w-5 text-gray-400" />
              Support
            </DropdownItem>
          </li>
        </ul>

        {/* Déconnexion */}
        <div className="border-t border-gray-100 pt-2 dark:border-gray-800">
          <button
            onClick={handleLogout}
            disabled={isPending}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
          >
            <LogOut className="h-5 w-5 text-gray-400" />
            {isPending ? 'Déconnexion...' : 'Se déconnecter'}
          </button>
        </div>
      </Dropdown>
    </div>
  );
}