"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { MoreDotIcon } from "@/icons";
import { useState, useMemo } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import type { CategorieStat } from "@/app/actions/partieStats.actions";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

type FilterMode = "all" | "won" | "lost";

const FILTER_OPTIONS: { value: FilterMode; label: string }[] = [
  { value: "all", label: "Toutes" },
  { value: "won", label: "Gagnées" },
  { value: "lost", label: "Perdues" },
];

interface PartiesChartProps {
  data: CategorieStat[];
}

const PartiesChart: React.FC<PartiesChartProps> = ({ data }) => {
  const [filter, setFilter] = useState<FilterMode>("all");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const categories = data.map((d) => d.designation);

  const series = useMemo(() => {
    let values: number[];
    let color: string;
    let name: string;

    switch (filter) {
      case "won":
        values = data.map((d) => d.won);
        color = "#22c55e"; // vert
        name = "Gagnées (note=3)";
        break;
      case "lost":
        values = data.map((d) => d.lost);
        color = "#ef4444"; // rouge
        name = "Perdues (note=0)";
        break;
      default:
        values = data.map((d) => d.total);
        color = "#465fff"; // bleu
        name = "Toutes";
        break;
    }

    return [{ name, data: values, color }];
  }, [data, filter]);

  const options: ApexOptions = {
    colors: series.map((s) => s.color),
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 220,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 4, colors: ["transparent"] },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    yaxis: { title: { text: undefined } },
    grid: {
      yaxis: { lines: { show: true } },
    },
    fill: { opacity: 1 },
    tooltip: {
      x: { show: false },
      y: {
        formatter: (val: number) => `${val} partie${val > 1 ? "s" : ""}`,
      },
    },
  };

  const currentLabel =
    FILTER_OPTIONS.find((o) => o.value === filter)?.label ?? "Toutes";

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Parties par catégorie
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Filtre actif&nbsp;: <span className="font-medium">{currentLabel}</span>
          </p>
        </div>

        <div className="relative inline-block">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="dropdown-toggle"
          >
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
          </button>
          <Dropdown
            isOpen={dropdownOpen}
            onClose={() => setDropdownOpen(false)}
            className="w-40 p-2"
          >
            {FILTER_OPTIONS.map((opt) => (
              <DropdownItem
                key={opt.value}
                onItemClick={() => {
                  setFilter(opt.value);
                  setDropdownOpen(false);
                }}
                className={`flex w-full font-normal text-left rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300 ${
                  filter === opt.value
                    ? "text-brand-500 font-medium"
                    : "text-gray-500"
                }`}
              >
                {opt.label}
              </DropdownItem>
            ))}
          </Dropdown>
        </div>
      </div>

      {/* Chart */}
      {data.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-gray-400 dark:text-gray-500 text-sm">
          Aucune partie terminée pour le moment.
        </div>
      ) : (
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
            <ReactApexChart
              options={options}
              series={series}
              type="bar"
              height={220}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PartiesChart;