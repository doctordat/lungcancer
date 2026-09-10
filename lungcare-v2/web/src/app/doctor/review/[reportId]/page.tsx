"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { useClinical } from "@/components/clinical-context";
import {
  StethoscopeIcon,
  CheckCircle2Icon,
  FileTextIcon,
  SparklesIcon,
  ShieldCheckIcon,
} from "@/components/icons";

export default function DoctorReviewPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  use(params);
  const { state, isLoading, isMutating, signOffDecision } = useClinical();

  const [outcome, setOutcome] = useState<"care_plan_update" | "no_plan_change" | "needs_information">("care_plan_update");
  const [rationale] = useState<string>(
    "Khó thở mới xuất hiện khi nghỉ ngơi kèm SpO2 giảm xuống 91% và sốt nhẹ trên bệnh nhân đang điều trị Osimertinib. Nghi ngờ biến cố viêm phổi kẽ/độc tính phổi do thuốc hoặc viêm phổi nhiễm trùng. Cần tạm hoãn thuốc và chụp HRCT ngực khẩn."
  );
  const [clinicalActions, setClinicalActions] = useState<string>(
    "Tạm dừng Osimertinib 80mg từ hôm nay. Chỉ định chụp HRCT lồng ngực khẩn, xét nghiệm CTM, CRP, cấy đờm, khí máu động mạch và khám chuyên khoa hô hấp."
  );
  const [patientInstructionsPlain, setPatientInstructionsPlain] = useState<string>(
    "Bác An tạm dừng uống viên Osimertinib hôm nay. Bác hãy nghỉ ngơi tại giường, đo lại SpO2 sau mỗi 2 giờ. Điều dưỡng Mai sẽ gọi điện hướng dẫn và hẹn giờ kiểm tra lúc 18:00 hôm nay."
  );
  const [monitoring, setMonitoring] = useState<string>(
    "Theo dõi SpO2 liên tục, đo thân nhiệt mỗi 4 giờ, đếm nhịp thở."
  );
  const [followUpTime] = useState<string>("Hôm nay · 18:00");
  const [isSigned, setIsSigned] = useState<boolean>(false);

  if (isLoading || !state) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-medium text-slate-500">Đang tải hồ sơ duyệt...</p>
      </div>
    );
  }

  const { patient, activeReport, nurseValidation, activeCarePlan } = state;

  const handleSignOff = async () => {
    if (!activeReport) return;
    try {
      await signOffDecision({
        reportId: activeReport.id,
        expectedVersion: activeReport.workflowVersion,
        outcome,
        rationale,
        differentials: [
          "Viêm phổi kẽ / Độc tính phổi do Osimertinib (Drug-induced ILD/Pneumonitis)",
          "Viêm phổi nhiễm trùng / Sốt giảm bạch cầu",
          "Thuyên tắc mạch phổi (PE)",
        ],
        investigationsOrdered: [
          "Chụp HRCT lồng ngực khẩn",
          "Công thức máu (CBC), CRP",
          "Khí máu động mạch (ABG)",
          "Khám chuyên khoa hô hấp",
        ],
        clinicalActions,
        patientInstructionsPlain,
        monitoring,
        followUpAssignedTo: patient.primaryNurseName,
        followUpTime,
        doctorName: patient.primaryDoctorName,
      });
      setIsSigned(true);
    } catch {
      // Handled in context
    }
  };

  const isAlreadySigned =
    isSigned || (activeReport && ["signed", "patient_notified", "acknowledged"].includes(activeReport.status));

  return (
    <div className="space-y-4 pb-16">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between pt-1">
        <Link href="/doctor/command" className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1">
          ← Command Center
        </Link>
        <span className="text-[11px] font-bold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950 px-2 py-0.5 rounded-full border border-sky-200 dark:border-sky-800">
          Quyết định Điều trị & Kế hoạch
        </span>
      </div>

      {/* 1. Patient & Regimen Strip */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-bold text-slate-900 dark:text-white">
            {patient.name} (Nam, 58t)
          </h1>
          <span className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900">
            Đợt khó thở cấp
          </span>
        </div>
        <p className="text-xs text-slate-500">
          {patient.diagnosis} · {patient.regimen} · Chu kỳ 3 (Ngày 14/28)
        </p>
      </section>

      {/* 2. Structured Evidence Panel */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <FileTextIcon size={16} className="text-sky-600" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Tổng hợp Chứng cứ Lâm sàng (Clinical Evidence)
          </h2>
        </div>

        <div className="space-y-2.5 text-xs">
          {/* Patient PRO */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
            <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
              <span>Báo cáo triệu chứng từ Người bệnh (PRO)</span>
              <span className="text-[10px] text-slate-400 font-mono">
                {activeReport ? new Date(activeReport.createdAt).toLocaleTimeString("vi-VN") : "08:30"}
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-300">
              • Triệu chứng: <strong>Khó thở khi nghỉ (Dyspnea at rest)</strong> · SpO2 khai báo: <strong>91%</strong> · Thân nhiệt: <strong>38.1°C</strong>
            </p>
            {activeReport?.notes && (
              <p className="text-slate-500 italic text-[11px]">&ldquo;{activeReport.notes}&rdquo;</p>
            )}
          </div>

          {/* Nurse Structured Assessment */}
          <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 space-y-1.5">
            <div className="flex items-center justify-between font-bold text-indigo-950 dark:text-indigo-200">
              <div className="flex items-center gap-1.5">
                <ShieldCheckIcon size={14} className="text-indigo-600" />
                <span>Đánh giá từ Điều dưỡng ({patient.primaryNurseName})</span>
              </div>
              <span className="text-[10px] text-indigo-500 font-mono">
                {nurseValidation ? new Date(nurseValidation.validatedAt).toLocaleTimeString("vi-VN") : "08:35"}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-[11px] font-semibold text-indigo-900 dark:text-indigo-200">
              <span>SpO2 đo lại: <strong>{nurseValidation?.repeatSpo2 || 91}%</strong></span>
              <span>Nhịp thở: <strong>{nurseValidation?.respiratoryRate || 24} l/p</strong></span>
              <span>Thân nhiệt: <strong>{nurseValidation?.temperature || 38.1}°C</strong></span>
            </div>
            <p className="text-[11px] text-indigo-800 dark:text-indigo-300 leading-relaxed pt-1">
              {nurseValidation?.context || "Đã liên hệ điện thoại: bệnh nhân mệt nhiều, hụt hơi khi nghỉ, ho khan ít. Đề nghị bác sĩ hội chẩn khẩn cấp."}
            </p>
          </div>

          {/* Clinical Assistant Summary */}
          <div className="p-3 rounded-2xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/80 space-y-1 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-sky-950 dark:text-sky-200">
              <SparklesIcon size={14} className="text-sky-600" />
              <span>Khuyến cáo hỗ trợ từ Clinical Engine (Decision Support)</span>
            </div>
            <p className="text-[11px] text-sky-800 dark:text-sky-300 leading-relaxed">
              Phân tầng NCCN/CTCAE v5.0: Đợt khó thở mới ở bệnh nhân dùng Osimertinib có SpO2 91% cần tạm hoãn TKI, chụp HRCT ngực khẩn và xét nghiệm vi sinh/khí máu trước khi quyết định can thiệp steroid hoặc kháng sinh.
            </p>
          </div>
        </div>
      </section>

      {/* 3. PHYSICIAN DECISION ENGINE */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 border-sky-500 shadow-md space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-sky-600 text-white flex items-center justify-center">
            <StethoscopeIcon size={16} />
          </div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Quyết định Điều trị của Bác sĩ (Physician Decision)
          </h2>
        </div>

        {isAlreadySigned ? (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs space-y-3">
            <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-bold text-sm">
              <CheckCircle2Icon size={18} className="text-emerald-600" />
              <span>KẾ HOẠCH CHĂM SÓC ĐÃ ĐƯỢC KÝ DUYỆT (CARE PLAN UPDATED)</span>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-900 space-y-1 text-xs">
              <div className="font-bold text-slate-900 dark:text-white">Phiên bản V{activeCarePlan.version}</div>
              <p className="text-slate-700 dark:text-slate-300">{activeCarePlan.clinicalActions || activeCarePlan.summary}</p>
              <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-100 dark:border-slate-700 space-y-0.5">
                <p>• Hướng dẫn người bệnh: {activeCarePlan.patientInstructionsPlain}</p>
                <p>• Phân công: <strong>{activeCarePlan.followUpAssignedTo}</strong> ({activeCarePlan.followUpTime})</p>
                <p>• Người ký: <strong>{activeCarePlan.signedByName}</strong> lúc {new Date(activeCarePlan.signedAt).toLocaleTimeString("vi-VN")}</p>
              </div>
            </div>

            <Link
              href="/patient/today"
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs text-center block shadow-xs"
            >
              Xem giao diện Người bệnh (Patient View) →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Action Option Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Hướng xử trí lâm sàng:
              </label>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setOutcome("care_plan_update")}
                  className={`p-3 rounded-2xl text-left border transition-all ${
                    outcome === "care_plan_update"
                      ? "border-sky-600 bg-sky-50 dark:bg-sky-950/60 font-bold text-sky-950 dark:text-sky-200 ring-2 ring-sky-500/20"
                      : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div className="font-bold">Cập nhật Kế hoạch Chăm sóc (Care Plan Update)</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 font-normal">
                    Tạm dừng Osimertinib, chỉ định HRCT ngực khẩn và gán lịch tái đánh giá cho Điều dưỡng Mai lúc 18:00
                  </div>
                </button>
              </div>
            </div>

            {/* Clinical Actions Input */}
            <div>
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 block">
                Chỉ định y lệnh lâm sàng (Clinical Actions):
              </label>
              <textarea
                value={clinicalActions}
                onChange={(e) => setClinicalActions(e.target.value)}
                rows={2}
                className="w-full p-2.5 rounded-xl border border-sky-200 dark:border-sky-800 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Plain Language Patient Instructions */}
            <div>
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 block">
                Hướng dẫn cho Người bệnh (Plain Language Vietnamese):
              </label>
              <textarea
                value={patientInstructionsPlain}
                onChange={(e) => setPatientInstructionsPlain(e.target.value)}
                rows={2}
                className="w-full p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Monitoring & Follow-up Assignment */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 block">Theo dõi trọng tâm</span>
                <input
                  type="text"
                  value={monitoring}
                  onChange={(e) => setMonitoring(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-800 dark:text-slate-200 bg-transparent focus:outline-none mt-0.5"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 block">Giao việc Điều dưỡng</span>
                <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                  ĐD. Mai ({followUpTime})
                </div>
              </div>
            </div>

            {/* Physician Digital Signature Certificate */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 block">Bác sĩ ký duyệt</span>
                <span className="font-bold text-slate-900 dark:text-white">{patient.primaryDoctorName}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block">Chứng thư số</span>
                <span className="font-mono text-[10px] text-slate-600 dark:text-slate-300">MED-CERT-2026-LONG</span>
              </div>
            </div>

            {/* Sign Button */}
            <button
              type="button"
              onClick={handleSignOff}
              disabled={isMutating}
              className="w-full py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <SparklesIcon size={16} />
              <span>{isMutating ? "Đang ký duyệt..." : "Ký duyệt & Cập nhật Kế hoạch Chăm sóc"}</span>
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
