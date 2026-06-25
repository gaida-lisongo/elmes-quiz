import type { Metadata } from "next";
import React from "react";
import GenericDashboard from "@/components/Dashboard/GenericDashboard";
import AccountBadge from "@/components/Dashboard/AccountBadge";
import CarouselCards from "@/components/Dashboard/CarouselCards";
import type { CarouselCardItem } from "@/components/Dashboard/CarouselCards";
import LeaderboardTable from "@/components/Dashboard/LeaderboardTable";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import {
  ShootingStarIcon,
  DollarLineIcon,
} from "@/icons";
import { getCurrentUserDetailed } from "@/app/actions/auth.actions";
import { getLeaderboard } from "@/app/actions/leaderboard.actions";

export const metadata: Metadata = {
  title:
    "Dashboard | Quiz Genie",
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

  /* ── Métriques dynamiques ── */
  const metrics = [
    {
      title: "Revenue",
      total: "$12,402",
      rate: "15.3%",
      levelUp: true,
      icon: (
        <DollarLineIcon className="text-gray-800 size-6 dark:text-white/90" />
      ),
    },
    {
      title: "Active Users",
      total: "1,294",
      rate: "3.24%",
      levelUp: true,
      icon: (
        <ShootingStarIcon className="text-gray-800 size-6 dark:text-white/90" />
      ),
    },
  ];

  /* ── Cartes du carrousel dynamique ── */
  const carouselCards: CarouselCardItem[] = [
    {
      id: 1,
      image: "/images/carousel/carousel-01.png",
      title: "Summer Flash Sale",
      description: "Get up to 50% off on selected items. Limited time offer!",
      badge: "New",
      badgeColor: "success",
    },
    {
      id: 2,
      image: "/images/carousel/carousel-02.png",
      title: "New Collection Drop",
      description: "Explore the latest arrivals in our premium lineup.",
      badge: "Trending",
      badgeColor: "warning",
    },
    {
      id: 3,
      image: "/images/carousel/carousel-03.png",
      title: "Free Shipping Week",
      description: "Enjoy free delivery on all orders above $50.",
      badge: "Promo",
      badgeColor: "info",
    },
    {
      id: 4,
      image: "/images/carousel/carousel-04.png",
      title: "Loyalty Rewards",
      description: "Earn double points on every purchase this month.",
      badge: "Exclusive",
      badgeColor: "primary",
    },
  ];

  return (
    <GenericDashboard
      accountBadge={accountBadge}
      metrics={metrics}
      chartSection={<MonthlySalesChart />}
      rightSidebar={<MonthlyTarget />}
      carouselComponent={
        <CarouselCards title="Latest Highlights" cards={carouselCards} />
      }
      recentOrdersTable={<LeaderboardTable initialData={top10} />}
    />
  );
}
