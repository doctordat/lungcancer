"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useClinical } from "@/components/clinical-context";
import {
  ShieldCheckIcon,
  CheckCircle2Icon,
} from "@/components/icons";

export default function NurseQueuePage() {
  const { state, isLoading } = useClinical();
  const [activeTab, setActiveTab] = useState<"urgent" | "today" | "stable">("urgent");

  if (isLoading || !state) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-medium text-slate-500">Đang tải hàng đợi điều phối...</p>
      </div>
    );
  }

  const { patient, activeReport, triageAssessment } = state;

  const isAnUrgent =
    activeReport?.symptom === "dyspnea" ||
    triageAssessment?.priority === "urgent" ||
    activeReport?.status === "submitted";

  const isAnAssessed = activeReport && ["nurse_validated", "escalated", "doctor_reviewed", "signed", "patient_notified", "acknowledged"].includes(activeReport.status);

  return (
    <div className="space-y-4 pb-16">
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Hàng đợi Phân tầng Điều dưỡng
          </h1>
          <p className="text-xs text-slate-500">
            {patient.primaryNurseName} · Trung tâm Ung bướu
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800">
          Ca trực hôm nay
        </span>
      </div>

      {/* 2. Top Workload Summary Metrics */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setActiveTab("urgent")}
          className={`p-3 rounded-2xl border text-left transition-all ${
            activeTab === "urgent"
              ? "bg-rose-50/80 border-rose-300 dark:bg-rose-950/60 dark:border-rose-800 text-rose-950 dark:text-rose-200 ring-2 ring-rose-500/20"
              : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
          }`}
        >
          <div className="text-[10px] font-semibold text-rose-700 dark:text-rose-400 uppercase">
            Cần xử lý ngay
          </div>
          <div className="text-xl font-bold mt-0.5 text-rose-600 dark:text-rose-400">
            {isAnUrgent && !isAnAssessed ? "3" : "2"}
          </div>
          <div className="text-[9px] text-slate-400 mt-0.5">Ưu tiên đỏ</div>
        </button>

        <button
          onClick={() => setActiveTab("today")}
          className={`p-3 rounded-2xl border text-left transition-all ${
            activeTab === "today"
              ? "bg-amber-50/80 border-amber-300 dark:bg-amber-950/60 dark:border-amber-800 text-amber-950 dark:text-amber-200 ring-2 ring-amber-500/20"
              : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
          }`}
        >
          <div className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 uppercase">
            Trong hôm nay
          </div>
          <div className="text-xl font-bold mt-0.5 text-amber-600 dark:text-amber-400">8</div>
          <div className="text-[9px] text-slate-400 mt-0.5">Theo dõi độc tính</div>
        </button>

        <button
          onClick={() => setActiveTab("stable")}
          className={`p-3 rounded-2xl border text-left transition-all ${
            activeTab === "stable"
              ? "bg-emerald-50/80 border-emerald-300 dark:bg-emerald-950/60 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/20"
              : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
          }`}
        >
          <div className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase">
            Đang theo dõi
          </div>
          <div className="text-xl font-bold mt-0.5 text-emerald-600 dark:text-emerald-400">12</div>
          <div className="text-[9px] text-slate-400 mt-0.5">Phác đồ ổn định</div>
        </button>
      </div>

      {/* 3. Priority Queue List */}
      <div className="space-y-3">
        {/* Main Urgent Card: Nguyễn Văn An */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-rose-500/80 shadow-md overflow-hidden animate-fadeIn">
          {/* Top Urgent Strip */}
          <div className="bg-rose-50 dark:bg-rose-950/70 px-4 py-2 border-b border-rose-200 dark:border-rose-900 flex items-center justify-between text-xs text-rose-900 dark:text-rose-200">
            <div className="flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>CẦN XỬ LÝ KHẨN CẤP · URGENT</span>
            </div>
            <span className="text-[11px] font-mono">
              {activeReport ? new Date(activeReport.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "08:30"}
            </span>
          </div>

          <div className="p-4 space-y-3">
            {/* Patient Name & MRN */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {patient.name}
                </h2>
                <p className="text-xs text-slate-500">
                  {patient.gender}, {patient.age}t · {patient.medicalRecordNumber} · {patient.regimen} (C3D14)
                </p>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                K Phổi IVB
              </span>
            </div>

            {/* Acute Finding Highlights */}
            <div className="p-3 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/60 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-900 dark:text-rose-200">
                  {activeReport?.symptom === "dyspnea" ? "Khó thở đợt mới khi nghỉ (Dyspnea at rest) — MỚI" : "Khó thở & Sốt mới ghi nhận"}
                </span>
                <span className="text-rose-700 font-bold font-mono">SpO2 91% ↓</span>
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-300 grid grid-cols-2 gap-1 pt-1">
                <span>• Thân nhiệt: <strong>38.1°C</strong></span>
                <span>• Diễn tiến: <strong>Nặng hơn hôm qua</strong></span>
                <span>• Độc tính nền: Tiêu chảy G2</span>
                <span>• Thuốc đích: Osimertinib 80mg</span>
              </div>
            </div>

            {/* Action Section */}
            {isAnAssessed ? (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-semibold">
                  <CheckCircle2Icon size={16} className="text-emerald-600" />
                  <span>Đã hoàn tất đánh giá & chuyển BS Long</span>
                </div>
                <Link
                  href={`/nurse/patient/${patient.id}/assessment`}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Xem lại
                </Link>
              </div>
            ) : (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-[11px] text-amber-700 dark:text-amber-300">
                  <span>Chưa hoàn tất: Bảng kiểm tra hô hấp (Respiratory assessment)</span>
                </div>
                <Link
                  href={`/nurse/patient/${patient.id}/assessment`}
                  className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all block text-center"
                >
                  <ShieldCheckIcon size={16} />
                  <span>Đánh giá ngay</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Other Context Queue Items */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2 opacity-80">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-sm text-slate-800 dark:text-slate-200">Trần Thị Bích (Nữ, 62t)</span>
              <p className="text-xs text-slate-500">HSBA-2026-8102 · Osimertinib C2D21 · Giảm bạch cầu G1</p>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
              Xem hôm nay
            </span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            Kết quả CTM: Neutrophil 1.6 x10^9/L. Đang theo dõi ăn uống và thân nhiệt.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2 opacity-70">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-sm text-slate-800 dark:text-slate-200">Lê Hoàng Nam (Nam, 54t)</span>
              <p className="text-xs text-slate-500">HSBA-2026-7734 · Osimertinib C4D01 · Tái khám định kỳ</p>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              Ổn định
            </span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            Không có triệu chứng mới. Đã hoàn tất cấp phát thuốc chu kỳ 4.
          </p>
        </div>
      </div>
    </div>
  );
}
