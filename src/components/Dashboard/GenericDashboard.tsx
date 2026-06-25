import React from "react";
import MetricCard from "./MetricCard";

export interface MetricCardData {
  title: string;
  total: string | number;
  rate?: string;
  levelUp?: boolean;
  icon: React.ReactNode;
}

export interface GenericDashboardProps {
  /** Array of metric cards displayed at the top of the dashboard */
  metrics: MetricCardData[];
  /** Optional chart component rendered in the main content area (e.g. MonthlySalesChart / QuizStats) */
  chartSection?: React.ReactNode;
  /** Optional right sidebar content (e.g. MonthlyTarget, DemographicCard) */
  rightSidebar?: React.ReactNode;
  /** New dynamic carousel / cards component placed just above the orders table */
  carouselComponent?: React.ReactNode;
  /** Recent orders or transactions table */
  recentOrdersTable?: React.ReactNode;
  /** Account badge displayed before metrics */
  accountBadge?: React.ReactNode;
}

const GenericDashboard: React.FC<GenericDashboardProps> = ({
  metrics,
  chartSection,
  rightSidebar,
  carouselComponent,
  recentOrdersTable,
  accountBadge,
}) => {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      {/* ── Account Badge (type de compte connecté) ── */}
      {accountBadge && <div className="col-span-12">{accountBadge}</div>}

      {/* ── Metrics Section ── */}
      <div className="col-span-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-1 md:gap-6">
          {metrics.map((metric, index) => (
            <MetricCard
              key={index}
              title={metric.title}
              total={metric.total}
              rate={metric.rate}
              levelUp={metric.levelUp}
              icon={metric.icon}
            />
          ))}
        </div>
      </div>

      {rightSidebar && (
        <div className="col-span-6">
          {rightSidebar}
        </div>
      )}
      {/* ── Chart Section (main) + optional right sidebar ── */}
      {chartSection && (
        <div className="col-span-12 space-y-6 xl:col-span-12">
          {chartSection}
        </div>
      )}

      {/* ── Carousel / Dynamic Cards ── */}
      {carouselComponent && (
        <div className="col-span-12">
          {carouselComponent}
        </div>
      )}

      {/* ── Recent Orders Table ── */}
      {recentOrdersTable && (
        <div className="col-span-12">
          {recentOrdersTable}
        </div>
      )}
    </div>
  );
};

export default GenericDashboard;