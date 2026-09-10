"use client";

import React from "react";
import Link from "next/link";
import { useClinical } from "@/components/clinical-context";
import {
  HeartPulseIcon,
  ShieldCheckIcon,
  StethoscopeIcon,
  ChevronRightIcon,
  ActivityIcon,
} from "@/components/icons";

export default function Home() {
  const { state } = useClinical();

  const reportStatus = state?.activeReport?.status;
  const planVersion = state?.activeCarePlan?.version || 1;

  return (
    <div className="space-y-4">
      {/* North Star Hero */}
      <section className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-44 h-44 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="flex items-center gap-2 mb-3">
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[11px] tracking-wider border border-emerald-500/30">
            VERTICAL SLICE #1
          </span>
          <span className="text-[11px] text-slate-400">Connected Oncology Loop</span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
          Vòng lặp Chăm sóc Đa vai trò
        </h1>
        <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
          Luồng liên thông thực tế giữa <strong>Người bệnh</strong> → <strong>Điều dưỡng</strong> → <strong>Bác sĩ</strong> với Kế hoạch Chăm sóc V{planVersion} được ký duyệt và lưu trữ toàn vẹn.
        </p>

        {/* Real-time Status Card */}
        <div className="mt-5 p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-xs">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
            <span className="font-semibold text-slate-300">Trạng thái vòng lặp hiện hành</span>
            <span className="font-mono text-emerald-400">Live Sync</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-bold text-white uppercase text-xs">
              {reportStatus ? `Báo cáo: ${reportStatus}` : "Sẵn sàng khởi tạo ca mới"}
            </span>
          </div>
        </div>
      </section>

      {/* Role Navigation Cards with Visibly Different IA */}
      <div className="space-y-3">
        {/* 1. Patient Companion */}
        <Link
          href="/patient/today"
          className="group block p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500 shadow-xs transition-all"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                <HeartPulseIcon size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                    Người bệnh · Cancer Companion
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Báo cáo triệu chứng PRO, xem Kế hoạch Chăm sóc và xác nhận chỉ định
                </p>
              </div>
            </div>
            <ChevronRightIcon size={18} className="text-slate-400 group-hover:text-emerald-600 transition-colors mt-1" />
          </div>
        </Link>

        {/* 2. Nurse Care Command Center */}
        <Link
          href="/nurse/queue"
          className="group block p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500 shadow-xs transition-all"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                <ShieldCheckIcon size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                    Điều dưỡng · Care Command Center
                  </h2>
                  {reportStatus === "submitted" && (
                    <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                      Cần xử lý
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Hàng đợi ưu tiên, phân tầng thuật toán deterministic và xác minh/chuyển khẩn
                </p>
              </div>
            </div>
            <ChevronRightIcon size={18} className="text-slate-400 group-hover:text-indigo-600 transition-colors mt-1" />
          </div>
        </Link>

        {/* 3. Doctor Clinical Command Center */}
        <Link
          href={state?.activeReport ? `/doctor/review/${state.activeReport.id}` : "/doctor/review/demo"}
          className="group block p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-sky-500 shadow-xs transition-all"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                <StethoscopeIcon size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                    Bác sĩ · Clinical Command Center
                  </h2>
                  {(reportStatus === "escalated" || reportStatus === "nurse_validated") && (
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                      Chờ ký duyệt
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tóm tắt ca 10 giây, đối chiếu độc tính và ký duyệt cập nhật Kế hoạch V{planVersion + 1}
                </p>
              </div>
            </div>
            <ChevronRightIcon size={18} className="text-slate-400 group-hover:text-sky-600 transition-colors mt-1" />
          </div>
        </Link>
      </div>

      {/* Workflow Loop Diagram */}
      <section className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider mb-2">
          <ActivityIcon size={14} className="text-emerald-600" />
          <span>Quy trình Khép kín (Loop Contract)</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Người bệnh báo cáo triệu chứng → Phân tầng ưu tiên Triage → Điều dưỡng xác minh/chuyển viện → Bác sĩ đánh giá & ký duyệt chỉ định mới → Cập nhật Kế hoạch Chăm sóc (Care Plan) → Người bệnh xác nhận tuân thủ.
        </p>
      </section>
    </div>
  );
}
