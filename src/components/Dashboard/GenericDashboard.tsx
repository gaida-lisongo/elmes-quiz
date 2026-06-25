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
  /** Chart component displayed next to metrics (e.g. PartiesChart) */
  chartSection?: React.ReactNode;
  /** New dynamic carousel / cards component placed just below metrics+chart */
  carouselComponent?: React.ReactNode;
  /** Recent orders or transactions table */
  recentOrdersTable?: React.ReactNode;
  /** Account badge displayed before metrics */
  accountBadge?: React.ReactNode;
}

const GenericDashboard: React.FC<GenericDashboardProps> = ({
  metrics,
  chartSection,
  carouselComponent,
  recentOrdersTable,
  accountBadge,
}) => {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      {/* ── Account Badge (type de compte connecté) ── */}
      {accountBadge && <div className="col-span-12">{accountBadge}</div>}

      {/* ── Metrics + Chart side by side ── */}
      <div className="col-span-12 xl:col-span-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
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

      {chartSection && (
        <div className="col-span-12 xl:col-span-6">
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