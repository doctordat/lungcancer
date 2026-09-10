"use client";

import React from "react";
import Link from "next/link";
import { useClinical } from "@/components/clinical-context";
import {
  StethoscopeIcon,
  AlertTriangleIcon,
  CheckCircle2Icon,
  ActivityIcon,
  SparklesIcon,
} from "@/components/icons";

export default function DoctorCommandCenterPage() {
  const { state, isLoading } = useClinical();

  if (isLoading || !state) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-medium text-slate-500">Đang tải Clinical Command Center...</p>
      </div>
    );
  }

  const { patient, activeReport, triageAssessment, nurseValidation, activeCarePlan } = state;

  const isUrgentPulmonaryEvent =
    activeReport?.symptom === "dyspnea" ||
    nurseValidation?.escalationRequired ||
    triageAssessment?.priority === "urgent";

  const isDecisionSigned =
    activeReport && ["signed", "patient_notified", "acknowledged"].includes(activeReport.status);

  return (
    <div className="space-y-4 pb-16">
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Clinical Command Center
          </h1>
          <p className="text-xs text-slate-500">
            {patient.primaryDoctorName} · {patient.primaryDoctorTitle}
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-bold text-xs border border-sky-200 dark:border-sky-800">
          Oncology Review
        </span>
      </div>

      {/* 2. Top Patient Identity Ribbon */}
      <section className="bg-slate-900 text-white rounded-3xl p-4 shadow-md space-y-2 border border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base text-white">{patient.name}</span>
            <span className="text-xs text-slate-400">({patient.gender}, {patient.age}t)</span>
          </div>
          {isUrgentPulmonaryEvent && (
            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-[10px] font-bold animate-pulse">
              KHẨN CẤP · CẦN REVIEW
            </span>
          )}
        </div>

        <div className="text-xs text-slate-300 space-y-0.5">
          <p className="font-medium text-sky-300">{patient.diagnosis} ({patient.stage})</p>
          <p className="text-slate-400 text-[11px]">{patient.mutation} · {patient.regimen} · Chu kỳ 3 (Ngày 14/28)</p>
        </div>
      </section>

      {/* 3. NEW SINCE LAST REVIEW */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-4 border-2 border-rose-400/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 flex items-center justify-center">
              <AlertTriangleIcon size={14} />
            </div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-rose-950 dark:text-rose-300">
              Diễn biến mới từ lần khám trước (New Since Last Review)
            </h2>
          </div>
          <span className="text-[10px] font-bold text-rose-600 font-mono">Hôm nay</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 rounded-2xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-1">
            <span className="text-[10px] text-slate-500 block">Khó thở khi nghỉ</span>
            <span className="font-bold text-rose-900 dark:text-rose-200 text-sm">Khởi phát đợt mới</span>
            <span className="text-[10px] text-rose-600 block font-semibold">Chưa từng có trước đó</span>
          </div>

          <div className="p-3 rounded-2xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-1">
            <span className="text-[10px] text-slate-500 block">Độ bão hòa oxy SpO2</span>
            <span className="font-bold text-rose-900 dark:text-rose-200 text-sm">91% (Giảm ↓)</span>
            <span className="text-[10px] text-rose-600 block font-semibold">Nền 96-98%</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="text-[10px] text-slate-500 block">Thân nhiệt</span>
            <span className="font-bold text-amber-600 text-sm">38.1°C</span>
            <span className="text-[10px] text-slate-500 block">Sốt nhẹ</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="text-[10px] text-slate-500 block">Cân nặng</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm">62.8 kg (↓ 1.2 kg)</span>
            <span className="text-[10px] text-slate-500 block">Xu hướng giảm nhẹ</span>
          </div>
        </div>
      </section>

      {/* 4. CLINICAL SNAPSHOT */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Tổng quan Lâm sàng (Clinical Snapshot)
        </h2>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">Đáp ứng (Response)</span>
            <div className="font-bold text-slate-900 dark:text-white">{patient.recistResponse.split(" ")[0]}</div>
            <p className="text-[10px] text-slate-500">{patient.targetLesions}</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase">Thể trạng (Performance)</span>
            <div className="font-bold text-slate-900 dark:text-white">ECOG 0 → ?</div>
            <p className="text-[10px] text-slate-500">Giảm 1.2kg trong 1 tháng</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="text-[10px] font-bold text-sky-700 dark:text-sky-400 uppercase">An toàn (Safety)</span>
            <div className="font-bold text-slate-900 dark:text-white">QTc {patient.qtc} ms · eGFR {patient.egfr}</div>
            <p className="text-[10px] text-slate-500">Chức năng gan/thận đạt</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase">Độc tính (Toxicity)</span>
            <div className="font-bold text-slate-900 dark:text-white">Tiêu chảy G2 · Ban G1</div>
            <p className="text-[10px] text-rose-600 font-semibold">Khó thở: Đang đánh giá</p>
          </div>
        </div>
      </section>

      {/* 5. REQUIRES REVIEW */}
      <section className="bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950/40 rounded-3xl p-4 border-2 border-sky-500/80 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-sky-600 text-white flex items-center justify-center">
              <StethoscopeIcon size={16} />
            </div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
              Cần đánh giá & Xử trí (Requires Review)
            </h3>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
            ƯU TIÊN CAO
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-sky-200 dark:border-sky-800/60 space-y-1.5">
            <span className="font-bold text-slate-900 dark:text-white block">
              Chẩn đoán phân biệt cần loại trừ (Differentials):
            </span>
            <ul className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 list-disc pl-4">
              <li>Viêm phổi kẽ / Độc tính phổi do Osimertinib (Drug-induced ILD/Pneumonitis)</li>
              <li>Viêm phổi nhiễm trùng / Sốt giảm bạch cầu</li>
              <li>Thuyên tắc mạch phổi (PE) hoặc tiến triển bệnh lý tim mạch</li>
            </ul>
          </div>

          <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-sky-200 dark:border-sky-800/60 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white block">
              Dữ liệu cận lâm sàng còn thiếu trước khi quyết định:
            </span>
            <p className="text-[11px] text-slate-600 dark:text-slate-300">
              • Cần chụp HRCT lồng ngực khẩn · CTM + CRP · Khám lâm sàng chuyên khoa hô hấp
            </p>
          </div>
        </div>

        {isDecisionSigned ? (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-bold">
              <CheckCircle2Icon size={16} className="text-emerald-600" />
              <span>Đã ký duyệt Kế hoạch Chăm sóc V{activeCarePlan.version}</span>
            </div>
            <Link
              href={`/doctor/review/${activeReport?.id || "demo"}`}
              className="text-xs font-bold text-sky-600 hover:underline"
            >
              Xem chi tiết
            </Link>
          </div>
        ) : (
          <Link
            href={`/doctor/review/${activeReport?.id || "demo"}`}
            className="w-full py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all block text-center"
          >
            <SparklesIcon size={16} />
            <span>Mở & Ký duyệt Xử trí Đợt khó thở (Review Pulmonary Episode)</span>
          </Link>
        )}
      </section>

      {/* 6. THERAPY DIGITAL TWIN */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center">
              <ActivityIcon size={14} />
            </div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Mô hình Diễn tiến Điều trị (Therapy Digital Twin)
            </h2>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Chu kỳ 1 → 3</span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            <span>Khởi đầu Osimertinib</span>
            <span>PR −34%</span>
            <span className="text-rose-600 font-bold">Khó thở SpO2 91%</span>
          </div>

          <div className="relative h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 bg-emerald-500 w-3/4 rounded-l-full" />
            <div className="absolute right-0 top-0 bottom-0 bg-rose-500 w-1/4 rounded-r-full" />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
            <span>Chu kỳ 1 (Tháng 7)</span>
            <span>Chu kỳ 2 (Tháng 8)</span>
            <span>Hôm nay (C3D14)</span>
          </div>
        </div>
      </section>

      {/* 7. NEXT DECISIONS */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Các quyết định tiếp theo (Next Decisions)
        </h2>
        <div className="space-y-2 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
            <span className="font-semibold text-slate-800 dark:text-slate-200">• Đánh giá & xử trí đợt khó thở cấp</span>
            <span className="text-rose-600 font-bold text-[10px]">Ưu tiên cao</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
            <span className="font-semibold text-slate-800 dark:text-slate-200">• Kiểm tra an toàn độc tính tiêu hóa G2</span>
            <span className="text-amber-600 font-bold text-[10px]">Đang theo dõi</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
            <span className="font-semibold text-slate-800 dark:text-slate-200">• Đối chiếu CT ngực ngày 15/09</span>
            <span className="text-sky-600 font-bold text-[10px]">Còn 5 ngày</span>
          </div>
        </div>
      </section>
    </div>
  );
}
