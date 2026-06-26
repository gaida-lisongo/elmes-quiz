import type { Metadata } from "next";
import React from "react";
import GenericDashboard from "@/components/Dashboard/GenericDashboard";
import AccountBadge from "@/components/Dashboard/AccountBadge";
import LeaderboardTable from "@/components/Dashboard/LeaderboardTable";
import JetonCarousel from "@/components/Dashboard/JetonCarousel";
import CategorieCarouselPlayer from "@/components/Dashboard/CategorieCarouselPlayer";
import CategorieCarouselMod from "@/components/Dashboard/CategorieCarouselMod";
import PartiesChart from "@/components/Dashboard/PartiesChart";
import ProgressBar from "@/components/Dashboard/ProgressBar";
import {
  ShootingStarIcon,
  DollarLineIcon,
  GroupIcon,
  BoxIconLine,
} from "@/icons";
import { getCurrentUserDetailed } from "@/app/actions/auth.actions";
import { getLeaderboard } from "@/app/actions/leaderboard.actions";
import { getAllCategories, getAllCategoriesAdmin } from "@/app/actions/categorie.actions";
import { getPartiesStats } from "@/app/actions/partieStats.actions";
import { getAgentMetrics } from "@/app/actions/agentMetrics.actions";
import { getEquipesCount } from "@/app/actions/equipe.actions";
import { getProgressData } from "@/app/actions/progress.actions";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "ELMES-QUIZ — Tableau de bord. Gérez vos quiz, suivez vos performances et participez aux compétitions pour gagner de l'argent.",
};

export default async function Ecommerce() {
  const user = await getCurrentUserDetailed();
  const { top10 } = await getLeaderboard();

  // ── Métriques agents (ADMIN / MOD) : chiffre d'affaires + joueurs ──
  const { revenue, totalPlayers } = await getAgentMetrics();
  const equipesCount = await getEquipesCount();

  // ── Données de progression (barre teaser) ──
  const progressData = await getProgressData();

  /* ── Badge du compte connecté ── */
  const accountBadge = user ? (
    <AccountBadge
      pseudo={user.pseudo}
      role={user.role}
      solde={user.solde}
      level={user?.profile?.level}
      equipesCount={equipesCount}
      progressComponent={
        progressData ? (
          <ProgressBar
            initialData={progressData}
            userId={user._id?.toString()}
          />
        ) : undefined
      }
    />
  ) : undefined;

  /* ── Métriques dynamiques selon le rôle ── */
  const metrics =
    user?.role === "ADMIN" || user?.role === "MOD"
      ? [
          {
            title: "Chiffre d'affaires",
            total: `${revenue.toLocaleString()} FC`,
            rate: "",
            icon: (
              <DollarLineIcon className="text-gray-800 size-6 dark:text-white/90" />
            ),
          },
          {
            title: "Joueurs inscrits",
            total: totalPlayers,
            rate: "",
            icon: (
              <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
            ),
          },
        ]
      : [
          {
            title: "Mon Score",
            total: user?.profile?.metrics?.totalScore ?? 0,
            rate: "",
            icon: (
              <ShootingStarIcon className="text-gray-800 size-6 dark:text-white/90" />
            ),
          },
          {
            title: "Parties Jouées",
            total: user?.profile?.metrics?.partiesJouees ?? 0,
            rate: "",
            icon: (
              <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
            ),
          },
        ];

  // ── Statistiques des parties pour le graphique ──
  const partiesStats = await getPartiesStats();

  /* ── Carrousel selon le rôle ── */
  let carouselComponent: React.ReactNode = null;

  if (user?.role === "ADMIN") {
    carouselComponent = <JetonCarousel />;
  } else if (user?.role === "MOD") {
    const categories = await getAllCategoriesAdmin();
    carouselComponent = <CategorieCarouselMod categories={categories} />;
  } else if (user?.role === "PLAYER") {
    const categories = await getAllCategories();
    carouselComponent = <CategorieCarouselPlayer categories={categories} />;
  }

  return (
    <GenericDashboard
      accountBadge={accountBadge}
      metrics={metrics}
      chartSection={<PartiesChart data={partiesStats} />}
      carouselComponent={carouselComponent}
      recentOrdersTable={<LeaderboardTable initialData={top10} />}
    />
  );
}
