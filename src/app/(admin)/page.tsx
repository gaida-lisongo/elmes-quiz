import type { Metadata } from "next";
import React from "react";
import GenericDashboard from "@/components/Dashboard/GenericDashboard";
import AccountBadge from "@/components/Dashboard/AccountBadge";
import LeaderboardTable from "@/components/Dashboard/LeaderboardTable";
import JetonCarousel from "@/components/Dashboard/JetonCarousel";
import CategorieCarouselPlayer from "@/components/Dashboard/CategorieCarouselPlayer";
import CategorieCarouselMod from "@/components/Dashboard/CategorieCarouselMod";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import {
  ShootingStarIcon,
  DollarLineIcon,
  GroupIcon,
  BoxIconLine,
} from "@/icons";
import { getCurrentUserDetailed } from "@/app/actions/auth.actions";
import { getLeaderboard } from "@/app/actions/leaderboard.actions";
import { getAllCategories, getAllCategoriesAdmin } from "@/app/actions/categorie.actions";

export const metadata: Metadata = {
  title: "Dashboard | Quiz Genie",
  description: "Dashboard Quiz Genie",
};

export default async function Ecommerce() {
  const user = await getCurrentUserDetailed();
  const { top10 } = await getLeaderboard();

  /* ── Badge du compte connecté ── */
  const accountBadge = user ? (
    <AccountBadge
      pseudo={user.pseudo}
      role={user.role}
      solde={user.solde}
    />
  ) : undefined;

  /* ── Métriques dynamiques selon le rôle ── */
  const metrics =
    user?.role === "ADMIN"
      ? [
          {
            title: "Revenu Total",
            total: "$18,240",
            rate: "12.5%",
            levelUp: true,
            icon: (
              <DollarLineIcon className="text-gray-800 size-6 dark:text-white/90" />
            ),
          },
          {
            title: "Joueurs Actifs",
            total: "1,482",
            rate: "8.7%",
            levelUp: true,
            icon: (
              <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
            ),
          },
        ]
      : user?.role === "MOD"
      ? [
          {
            title: "Parties Créées",
            total: "342",
            rate: "5.2%",
            levelUp: true,
            icon: (
              <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
            ),
          },
          {
            title: "Catégories",
            total: "8",
            rate: "2",
            levelUp: true,
            icon: (
              <ShootingStarIcon className="text-gray-800 size-6 dark:text-white/90" />
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
      chartSection={<MonthlySalesChart />}
      rightSidebar={<MonthlyTarget />}
      carouselComponent={carouselComponent}
      recentOrdersTable={<LeaderboardTable initialData={top10} />}
    />
  );
}
