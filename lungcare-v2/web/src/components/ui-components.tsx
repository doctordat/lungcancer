"use client";

import React from "react";

interface StatusChipProps {
  status: "stable" | "review_today" | "urgent" | "submitted" | "nurse_validated" | "escalated" | "doctor_reviewed" | "signed" | "patient_notified" | "acknowledged" | "needs_information" | string;
  label?: string;
  size?: "sm" | "md";
  className?: string;
}

export function ClinicalStatusChip({ status, label, size = "md", className = "" }: StatusChipProps) {
  let style = "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
  let dotColor = "bg-slate-400";
  let displayLabel = label || status;

  switch (status) {
    case "urgent":
    case "escalated":
      style = "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900";
      dotColor = "bg-rose-500";
      displayLabel = label || (status === "urgent" ? "Cần xử lý khẩn" : "Đã chuyển bác sĩ");
      break;
    case "review_today":
    case "submitted":
      style = "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900";
      dotColor = "bg-amber-500";
      displayLabel = label || (status === "review_today" ? "Cần xem hôm nay" : "Đang chờ điều dưỡng");
      break;
    case "nurse_validated":
    case "doctor_reviewed":
      style = "bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-900";
      dotColor = "bg-sky-500";
      displayLabel = label || (status === "nurse_validated" ? "Đã kiểm tra" : "Bác sĩ đang đánh giá");
      break;
    case "stable":
    case "signed":
    case "patient_notified":
    case "acknowledged":
      style = "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900";
      dotColor = "bg-emerald-500";
      displayLabel = label || (status === "stable" ? "Theo dõi ổn định" : status === "acknowledged" ? "Đã xác nhận" : "Kế hoạch đã kích hoạt");
      break;
  }

  const sizeClass = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${sizeClass} ${style} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{displayLabel}</span>
    </span>
  );
}

export function VitalMetric({
  label,
  value,
  unit,
  trend,
  isAlert = false,
  sublabel,
}: {
  label: string;
  value: string | number;
  unit?: string;
  trend?: string;
  isAlert?: boolean;
  sublabel?: string;
}) {
  return (
    <div
      className={`p-3 rounded-2xl border transition-all ${
        isAlert
          ? "bg-rose-50/70 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900 text-rose-950 dark:text-rose-200"
          : "bg-white dark:bg-slate-800/90 border-slate-200/80 dark:border-slate-700/80 text-slate-900 dark:text-white"
      }`}
    >
      <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
        <span>{label}</span>
        {trend && (
          <span className={`font-semibold ${isAlert ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
            {trend}
          </span>
        )}
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-xl font-bold tracking-tight">{value}</span>
        {unit && <span className="text-xs text-slate-500 font-medium">{unit}</span>}
      </div>
      {sublabel && <div className="text-[10px] text-slate-500 mt-0.5">{sublabel}</div>}
    </div>
  );
}

export function TrendSparkline({
  points,
  unit = "",
  label,
  targetWarningValue,
}: {
  points: { label: string; value: number }[];
  unit?: string;
  label: string;
  targetWarningValue?: number;
}) {
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return (
    <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-700 dark:text-slate-300">{label}</span>
        <span className="font-bold text-slate-900 dark:text-white">
          {points[points.length - 1]?.value} {unit}
        </span>
      </div>

      {/* SVG Simple Sparkline */}
      <div className="h-10 w-full flex items-end justify-between gap-2 pt-2">
        {points.map((p, idx) => {
          const heightPercent = Math.max(20, Math.min(100, ((p.value - min) / range) * 80 + 20));
          const isWarning = targetWarningValue !== undefined && p.value <= targetWarningValue;
          return (
            <div key={p.label || idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
              <div
                style={{ height: `${heightPercent}%` }}
                className={`w-full rounded-t-md transition-all ${
                  isWarning ? "bg-rose-500" : idx === points.length - 1 ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                }`}
              />
              <span className="text-[9px] text-slate-400 font-mono">{p.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
