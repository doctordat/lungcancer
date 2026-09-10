"use client";

import React from "react";
import Link from "next/link";
import { useClinical } from "@/components/clinical-context";
import {
  ChevronRightIcon,
} from "@/components/icons";

export default function Home() {
  const { state } = useClinical();

  const planVersion = state?.activeCarePlan?.version || 1;
  const isUrgent = state?.activeReport?.symptom === "dyspnea";

  return (
    <div className="space-y-4 pb-16">
      {/* North Star Header */}
      <section className="bg-slate-900 rounded-3xl p-5 text-white shadow-lg border border-slate-800 space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[11px] border border-emerald-500/30">
            LUNGCARE V4 — GATE A
          </span>
          <span className="text-[11px] text-slate-400">6 Connected Screens</span>
        </div>

        <h1 className="text-xl font-bold tracking-tight text-white">
          Vòng lặp Chăm sóc Đa vai trò
        </h1>
        <p className="text-xs text-slate-300 leading-relaxed">
          Trải nghiệm khép kín liên vai trò giữa <strong>Người bệnh</strong>, <strong>Điều dưỡng</strong> và <strong>Bác sĩ</strong> với Kế hoạch Chăm sóc V{planVersion} được ký duyệt và lưu trữ toàn vẹn.
        </p>
      </section>

      {/* 6 Screens Directory */}
      <div className="space-y-2.5">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 px-1">
          Danh mục 6 Màn hình Chuẩn
        </div>

        {/* 1. Patient Today */}
        <Link
          href="/patient/today"
          className="group block p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500 shadow-xs transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <div>
                <h2 className="font-bold text-xs text-slate-900 dark:text-white">
                  Màn hình 1: Patient Today
                </h2>
                <p className="text-[11px] text-slate-500">
                  Việc cần làm hôm nay, tóm tắt phác đồ, nút &ldquo;Tôi thấy không ổn&rdquo;
                </p>
              </div>
            </div>
            <ChevronRightIcon size={16} className="text-slate-400 group-hover:text-emerald-600" />
          </div>
        </Link>

        {/* 2. Patient Symptom Check */}
        <Link
          href="/patient/symptom-check"
          className="group block p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500 shadow-xs transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <div>
                <h2 className="font-bold text-xs text-slate-900 dark:text-white">
                  Màn hình 2: Patient Symptom Check
                </h2>
                <p className="text-[11px] text-slate-500">
                  Khảo sát đợt khó thở tăng dần, chỉ số SpO2 91%, tiến trình xử lý
                </p>
              </div>
            </div>
            <ChevronRightIcon size={16} className="text-slate-400 group-hover:text-emerald-600" />
          </div>
        </Link>

        {/* 3. Nurse Care Queue */}
        <Link
          href="/nurse/queue"
          className="group block p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500 shadow-xs transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-xs text-slate-900 dark:text-white">
                    Màn hình 3: Nurse Care Queue
                  </h2>
                  {isUrgent && (
                    <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-bold">
                      Khẩn cấp
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  Hàng đợi ưu tiên (Khẩn cấp / Trong hôm nay / Ổn định)
                </p>
              </div>
            </div>
            <ChevronRightIcon size={16} className="text-slate-400 group-hover:text-indigo-600" />
          </div>
        </Link>

        {/* 4. Nurse Assessment Workspace */}
        <Link
          href={`/nurse/patient/${state?.patient.id || "demo"}/assessment`}
          className="group block p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500 shadow-xs transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold text-xs">
                4
              </div>
              <div>
                <h2 className="font-bold text-xs text-slate-900 dark:text-white">
                  Màn hình 4: Nurse Assessment Workspace
                </h2>
                <p className="text-[11px] text-slate-500">
                  Bảng kiểm tra hô hấp nhanh, mini-trend SpO2/cân nặng, chuyển khẩn
                </p>
              </div>
            </div>
            <ChevronRightIcon size={16} className="text-slate-400 group-hover:text-indigo-600" />
          </div>
        </Link>

        {/* 5. Doctor Clinical Command Center */}
        <Link
          href="/doctor/command"
          className="group block p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-sky-500 shadow-xs transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 flex items-center justify-center font-bold text-xs">
                5
              </div>
              <div>
                <h2 className="font-bold text-xs text-slate-900 dark:text-white">
                  Màn hình 5: Doctor Clinical Command Center
                </h2>
                <p className="text-[11px] text-slate-500">
                  Tóm tắt 10 giây, chẩn đoán phân biệt đợt khó thở, Digital Twin
                </p>
              </div>
            </div>
            <ChevronRightIcon size={16} className="text-slate-400 group-hover:text-sky-600" />
          </div>
        </Link>

        {/* 6. Doctor Decision -> Shared Care Plan */}
        <Link
          href={`/doctor/review/${state?.activeReport?.id || "demo"}`}
          className="group block p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-sky-500 shadow-xs transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 flex items-center justify-center font-bold text-xs">
                6
              </div>
              <div>
                <h2 className="font-bold text-xs text-slate-900 dark:text-white">
                  Màn hình 6: Doctor Decision & Shared Care Plan
                </h2>
                <p className="text-[11px] text-slate-500">
                  Y lệnh lâm sàng, hướng dẫn bệnh nhân plain-language, ký số
                </p>
              </div>
            </div>
            <ChevronRightIcon size={16} className="text-slate-400 group-hover:text-sky-600" />
          </div>
        </Link>
      </div>
    </div>
  );
}
