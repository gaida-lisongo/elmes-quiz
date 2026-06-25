"use client";
import React from "react";
import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon } from "@/icons";

interface MetricCardProps {
  title: string;
  total: string | number;
  rate?: string;
  levelUp?: boolean;
  icon: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  total,
  rate,
  levelUp,
  icon,
}) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
        {icon}
      </div>

      <div className="flex items-end justify-between mt-5">
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {title}
          </span>
          <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
            {total}
          </h4>
        </div>
        {rate && (
          <Badge color={levelUp ? "success" : "error"}>
            {levelUp ? (
              <ArrowUpIcon />
            ) : (
              <ArrowDownIcon className="text-error-500" />
            )}
            {rate}
          </Badge>
        )}
      </div>
    </div>
  );
};

export default MetricCard;