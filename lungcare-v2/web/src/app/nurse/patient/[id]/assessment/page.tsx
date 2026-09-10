"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { useClinical } from "@/components/clinical-context";
import {
  ShieldCheckIcon,
  AlertTriangleIcon,
  CheckCircle2Icon,
} from "@/components/icons";
import { TrendSparkline } from "@/components/ui-components";

export default function NurseAssessmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  use(params);
  const { state, isMutating, validateReport } = useClinical();

  const [repeatSpo2, setRepeatSpo2] = useState<number>(91);
  const [respiratoryRate, setRespiratoryRate] = useState<number>(24);
  const [temp, setTemp] = useState<number>(38.1);
  const [dyspneaSeverity] = useState<"none" | "mild" | "moderate" | "at_rest">("at_rest");
  const [cough, setCough] = useState<boolean>(true);
  const [chestPain, setChestPain] = useState<boolean>(false);
  const [syncope, setSyncope] = useState<boolean>(false);
  const [cyanosis, setCyanosis] = useState<boolean>(false);
  const [nurseContext, setNurseContext] = useState<string>(
    "Đã liên hệ điện thoại lúc 08:35. Bệnh nhân hụt hơi khi ngồi nghỉ, SpO2 đo lại 91%, nhịp thở 24 l/p, sốt 38.1°C, ho khan ít. Chưa dùng thuốc hạ sốt hay kháng sinh. Đề nghị Bác sĩ hội chẩn khẩn cấp."
  );
  const [escalateError, setEscalateError] = useState<string | null>(null);
  const [isEscalated, setIsEscalated] = useState<boolean>(false);

  if (!state) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-medium text-slate-500">Đang tải hồ sơ đánh giá...</p>
      </div>
    );
  }

  const { patient, activeReport } = state;

  const handleEscalate = async (e: React.FormEvent) => {
    e.preventDefault();
    setEscalateError(null);
    if (!activeReport) {
      setEscalateError("Không tìm thấy báo cáo triệu chứng để đánh giá.");
      return;
    }
    try {
      await validateReport({
        reportId: activeReport.id,
        expectedVersion: activeReport.workflowVersion,
        repeatSpo2,
        respiratoryRate,
        temperature: temp,
        dyspneaSeverity,
        cough,
        chestPain,
        syncope,
        cyanosis,
        onsetProgression: "Khó thở khi nghỉ từ sáng nay, SpO2 91%, nhịp thở 24 l/p, ho khan ít.",
        escalationRequired: true,
        context: nurseContext,
      });
      setIsEscalated(true);
    } catch (err) {
      setEscalateError(err instanceof Error ? err.message : "Chuyển tuyến bác sĩ thất bại. Vui lòng thử lại.");
    }
  };

  const spo2Points = [
    { label: "01/09", value: 98 },
    { label: "05/09", value: 97 },
    { label: "08/09", value: 96 },
    { label: "Hôm nay", value: 91 },
  ];

  const weightPoints = [
    { label: "01/08", value: 64.0 },
    { label: "15/08", value: 64.0 },
    { label: "01/09", value: 63.0 },
    { label: "Hôm nay", value: 62.8 },
  ];

  return (
    <div className="space-y-4 pb-16">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between pt-1">
        <Link href="/nurse/queue" className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1">
          ← Hàng đợi điều phối
        </Link>
        <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
          Không gian Đánh giá Hô hấp
        </span>
      </div>

      {escalateError && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-900 text-xs text-rose-900 dark:text-rose-200 flex items-start justify-between gap-2 animate-fadeIn">
          <div className="flex items-start gap-2">
            <AlertTriangleIcon size={16} className="text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Lỗi chuyển tuyến Bác sĩ</div>
              <p className="text-[11px] text-rose-800 dark:text-rose-300">{escalateError}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEscalateError(null)}
            className="text-[10px] font-bold px-2 py-1 rounded bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100"
          >
            Đóng
          </button>
        </div>
      )}

      {isEscalated ? (
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center">
              <CheckCircle2Icon size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Đã chuyển khẩn Bác sĩ Trần Hoàng Long
              </h2>
              <p className="text-xs text-slate-500">
                Ca bệnh đã hiển thị trực tiếp trong Clinical Command Center của Bác sĩ
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
            <div className="font-bold text-slate-800 dark:text-slate-200">Tóm tắt đánh giá điều dưỡng:</div>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              {nurseContext}
            </p>
            <div className="pt-2 text-[10px] text-slate-500 border-t border-slate-200 dark:border-slate-700 flex justify-between">
              <span>SpO2: {repeatSpo2}% · Nhịp thở: {respiratoryRate} l/p</span>
              <span>Trạng thái: ESCALATED</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Link
              href="/nurse/queue"
              className="py-3 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs text-center block"
            >
              Về hàng đợi
            </Link>
            <Link
              href="/doctor/command"
              className="py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs text-center block shadow-xs"
            >
              Mở màn hình Bác sĩ →
            </Link>
          </div>
        </section>
      ) : (
        <form onSubmit={handleEscalate} className="space-y-4">
          {/* Patient Header */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {patient.name} (Nam, 58t)
              </h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                {patient.medicalRecordNumber}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {patient.diagnosis} · {patient.regimen} (Chu kỳ 3, Ngày 14)
            </p>
          </section>

          {/* 1. WHY THIS MATTERS */}
          <section className="p-4 rounded-3xl bg-rose-50/80 dark:bg-rose-950/50 border-2 border-rose-400/80 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-rose-950 dark:text-rose-200 text-xs uppercase tracking-wider">
              <AlertTriangleIcon size={16} className="text-rose-600" />
              <span>Bối cảnh lâm sàng trọng yếu (Why this matters)</span>
            </div>
            <p className="text-slate-800 dark:text-slate-200 text-xs leading-relaxed font-medium">
              Người bệnh xuất hiện <strong>khó thở đợt mới khi nghỉ ngơi</strong> kèm <strong>sốt 38.1°C</strong> và <strong>SpO2 giảm xuống 91%</strong> trong khi đang điều trị thuốc đích ức chế EGFR (Osimertinib).
            </p>
            <p className="text-[11px] text-rose-800 dark:text-rose-300 italic">
              * Cần bác sĩ đánh giá phân biệt viêm phổi kẽ/độc tính phổi do thuốc với viêm phổi nhiễm trùng hoặc tắc mạch phổi trước khi tiếp tục liều.
            </p>
          </section>

          {/* 2. QUICK ASSESSMENT */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2">
              <ShieldCheckIcon size={16} className="text-indigo-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Bảng kiểm tra hô hấp nhanh (Quick Assessment)
              </h3>
            </div>

            {/* Vitals Input Grid */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[10px] text-slate-500 block">SpO2 đo lại (%)</span>
                <input
                  type="number"
                  value={repeatSpo2}
                  onChange={(e) => setRepeatSpo2(Number(e.target.value))}
                  className="w-full text-base font-bold text-rose-600 bg-transparent focus:outline-none"
                />
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[10px] text-slate-500 block">Nhịp thở (l/p)</span>
                <input
                  type="number"
                  value={respiratoryRate}
                  onChange={(e) => setRespiratoryRate(Number(e.target.value))}
                  className="w-full text-base font-bold text-slate-900 dark:text-white bg-transparent focus:outline-none"
                />
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[10px] text-slate-500 block">Thân nhiệt (°C)</span>
                <input
                  type="number"
                  step="0.1"
                  value={temp}
                  onChange={(e) => setTemp(Number(e.target.value))}
                  className="w-full text-base font-bold text-amber-600 bg-transparent focus:outline-none"
                />
              </div>
            </div>

            {/* Symptoms Checklist */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <label className="text-slate-700 dark:text-slate-300 font-bold block text-[11px]">
                Dấu hiệu kèm theo:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCough(!cough)}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between ${
                    cough ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 font-bold text-indigo-900 dark:text-indigo-200" : "border-slate-200 dark:border-slate-700 text-slate-600"
                  }`}
                >
                  <span>Ho khan ít</span>
                  <span>{cough ? "Có (+)" : "Không"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChestPain(!chestPain)}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between ${
                    chestPain ? "border-rose-600 bg-rose-50 dark:bg-rose-950/60 font-bold text-rose-900" : "border-slate-200 dark:border-slate-700 text-slate-600"
                  }`}
                >
                  <span>Đau ngực</span>
                  <span>{chestPain ? "Có (+)" : "Không (-)"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSyncope(!syncope)}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between ${
                    syncope ? "border-rose-600 bg-rose-50 dark:bg-rose-950/60 font-bold text-rose-900" : "border-slate-200 dark:border-slate-700 text-slate-600"
                  }`}
                >
                  <span>Ngất / Choáng</span>
                  <span>{syncope ? "Có (+)" : "Không (-)"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCyanosis(!cyanosis)}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between ${
                    cyanosis ? "border-rose-600 bg-rose-50 dark:bg-rose-950/60 font-bold text-rose-900" : "border-slate-200 dark:border-slate-700 text-slate-600"
                  }`}
                >
                  <span>Tím tái môi/đầu chi</span>
                  <span>{cyanosis ? "Có (+)" : "Không (-)"}</span>
                </button>
              </div>
            </div>

            {/* Nurse Structured Context */}
            <div>
              <label className="text-slate-700 dark:text-slate-300 font-bold block text-[11px] mb-1">
                Ghi chú điều dưỡng & bối cảnh tiếp xúc:
              </label>
              <textarea
                value={nurseContext}
                onChange={(e) => setNurseContext(e.target.value)}
                rows={3}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </section>

          {/* 3. PATIENT TREND */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 px-1">
              Diễn tiến người bệnh (Patient Trend)
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <TrendSparkline
                label="SpO2 (%)"
                points={spo2Points}
                unit="%"
                targetWarningValue={92}
              />
              <TrendSparkline
                label="Cân nặng (kg)"
                points={weightPoints}
                unit="kg"
              />
            </div>
          </section>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isMutating}
            className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <ShieldCheckIcon size={16} />
            <span>{isMutating ? "Đang chuyển..." : "Chuyển Bác sĩ Đánh giá Khẩn cấp"}</span>
          </button>
        </form>
      )}
    </div>
  );
}
