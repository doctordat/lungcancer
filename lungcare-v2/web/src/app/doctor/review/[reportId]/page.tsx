"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useClinical } from "@/components/clinical-context";
import {
  StethoscopeIcon,
  CheckCircle2Icon,
  FileTextIcon,
  SparklesIcon,
  ChevronRightIcon,
} from "@/components/icons";

export default function DoctorReviewPage() {
  const { state, isLoading, isMutating, signOffDecision } = useClinical();

  const [outcome, setOutcome] = useState<"care_plan_update" | "no_plan_change" | "needs_information">("care_plan_update");
  const [rationale, setRationale] = useState<string>(
    "Độc tính tiêu hóa độ 2 (CTCAE v5.0) trên nền điều trị Osimertinib kết hợp sốt nhẹ. Chỉ định tạm dừng TKI ngắn hạn 48h và điều trị hỗ trợ Loperamide bù dịch điện giải theo khuyến cáo NCCN 2026."
  );
  const [newPlanSummary, setNewPlanSummary] = useState<string>(
    "Tạm dừng Osimertinib trong 48 giờ. Uống Loperamide 4mg khởi đầu, sau đó 2mg mỗi lần đi ngoài phân lỏng (tối đa 16mg/ngày). Uống bù Oresol 1000ml/ngày. Báo cáo lại triệu chứng sau 24h hoặc đến viện nếu sốt >= 38.5°C."
  );

  if (isLoading || !state) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-medium text-slate-500">Đang tải hồ sơ duyệt lâm sàng...</p>
      </div>
    );
  }

  const { patient, activeReport, triageAssessment, nurseValidation, activeCarePlan } = state;

  const handleSignOff = async () => {
    if (!activeReport) return;
    try {
      await signOffDecision({
        reportId: activeReport.id,
        expectedVersion: activeReport.workflowVersion,
        outcome,
        rationale,
        newPlanSummary: outcome === "care_plan_update" ? newPlanSummary : undefined,
        doctorName: patient.primaryDoctorName,
      });
    } catch {
      // Handled in context
    }
  };

  const isAlreadySigned =
    activeReport && ["signed", "patient_notified", "acknowledged"].includes(activeReport.status);

  return (
    <div className="space-y-4">
      {/* 1. Doctor Command Header */}
      <section className="bg-slate-900 rounded-3xl p-5 text-white shadow-lg border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <StethoscopeIcon size={16} />
            </div>
            <span className="font-bold text-xs uppercase tracking-wider text-sky-300">
              Clinical Command Center
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-sky-300 text-[11px] font-semibold">
            {patient.primaryDoctorName}
          </span>
        </div>

        <h1 className="text-xl font-bold tracking-tight text-white mb-1">
          Đánh giá & Ký duyệt Lâm sàng
        </h1>
        <p className="text-xs text-slate-400 leading-relaxed">
          Tóm tắt ca bệnh 10 giây, đối chiếu chứng cứ và phê duyệt kế hoạch chăm sóc có giá trị pháp lý.
        </p>
      </section>

      {/* 2. 10-Second High-Signal Clinical Brief */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {patient.name} ({patient.gender}, {patient.age}t)
            </h2>
            <p className="text-xs text-slate-500">
              {patient.medicalRecordNumber} · {patient.hospital}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
              Chu kỳ 3 (Day 14)
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-slate-500 block">Chẩn đoán</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{patient.diagnosis}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">Đột biến gen</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{patient.mutation}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">Phác đồ đích</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{patient.regimen}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">Kế hoạch hiện tại</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">Phiên bản V{activeCarePlan.version}</span>
          </div>
        </div>
      </section>

      {/* 3. Evidence & Clinical Context Card */}
      {activeReport && (
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <FileTextIcon size={14} className="text-sky-600" />
              <span>Dữ liệu lâm sàng & Bối cảnh tiếp nhận</span>
            </div>
            {triageAssessment && (
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  triageAssessment.priority === "urgent"
                    ? "bg-rose-100 text-rose-800"
                    : triageAssessment.priority === "review_today"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {triageAssessment.priority}
              </span>
            )}
          </div>

          <div className="space-y-2 text-xs">
            {/* Patient PRO */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              <div className="font-bold text-slate-800 dark:text-slate-200 mb-1">
                Báo cáo từ người bệnh (PRO lúc {new Date(activeReport.createdAt).toLocaleTimeString("vi-VN")}):
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                • Triệu chứng: <strong className="capitalize">{activeReport.symptom === "diarrhea" ? "Tiêu chảy" : activeReport.symptom}</strong> ({activeReport.diarrheaEpisodes} lần/24h)
                {activeReport.fever && <span className="text-rose-600 font-bold ml-2">• Kèm sốt</span>}
              </p>
              {activeReport.notes && (
                <p className="text-slate-500 italic mt-1 text-[11px]">&ldquo;{activeReport.notes}&rdquo;</p>
              )}
            </div>

            {/* Nurse Validation Context */}
            {nurseValidation ? (
              <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80">
                <div className="flex items-center justify-between font-bold text-indigo-950 dark:text-indigo-200 mb-1">
                  <span>Ghi nhận từ Điều dưỡng ({patient.primaryNurseName}):</span>
                  <span className="font-mono text-[10px] text-indigo-500">
                    {new Date(nurseValidation.validatedAt).toLocaleTimeString("vi-VN")}
                  </span>
                </div>
                <p className="text-indigo-900 dark:text-indigo-300 text-[11px] leading-relaxed">
                  {nurseValidation.context}
                </p>
                {nurseValidation.escalationRequired && (
                  <span className="inline-block mt-1 text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded">
                    Yêu cầu hội chẩn Bác sĩ
                  </span>
                )}
              </div>
            ) : (
              <p className="text-[11px] text-amber-600 italic">Chưa có xác minh từ điều dưỡng.</p>
            )}
          </div>
        </section>
      )}

      {/* 4. Physician Clinical Decision & Sign-Off Engine */}
      {activeReport ? (
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 border-2 border-sky-500/40 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 flex items-center justify-center">
              <StethoscopeIcon size={14} />
            </div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Quyết định Điều trị & Ký duyệt (Sign-Off)
            </h3>
          </div>

          {isAlreadySigned ? (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-xs space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-bold">
                <CheckCircle2Icon size={18} className="text-emerald-600" />
                <span>Bác sĩ đã hoàn tất ký duyệt quyết định lâm sàng</span>
              </div>
              <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-900 space-y-1.5">
                <div className="text-[11px] text-slate-500">Kế hoạch chăm sóc mới đã kích hoạt:</div>
                <div className="font-bold text-slate-900 dark:text-white">Phiên bản V{activeCarePlan.version}</div>
                <p className="text-slate-700 dark:text-slate-300 text-xs">{activeCarePlan.summary}</p>
              </div>
              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                <span>Người ký: {patient.primaryDoctorName}</span>
                <span>Trạng thái: {activeReport.status}</span>
              </div>
              <Link
                href="/patient/today"
                className="mt-2 w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>Xem giao diện Người bệnh</span>
                <ChevronRightIcon size={14} />
              </Link>
            </div>
          ) : (
            <div className="space-y-3.5">
              {/* Outcome Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Hướng xử trí lâm sàng:
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => setOutcome("care_plan_update")}
                    className={`p-2.5 rounded-xl text-left border transition-all text-xs ${
                      outcome === "care_plan_update"
                        ? "border-sky-600 bg-sky-50 dark:bg-sky-950/60 text-sky-950 dark:text-sky-200 ring-2 ring-sky-500/20"
                        : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div className="font-bold">Cập nhật Kế hoạch Chăm sóc (Care Plan Update)</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Tạo phiên bản Kế hoạch mới (V{activeCarePlan.version + 1}) và thông báo cho người bệnh</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOutcome("no_plan_change")}
                    className={`p-2.5 rounded-xl text-left border transition-all text-xs ${
                      outcome === "no_plan_change"
                        ? "border-sky-600 bg-sky-50 dark:bg-sky-950/60 text-sky-950 dark:text-sky-200 ring-2 ring-sky-500/20"
                        : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div className="font-bold">Duy trì Kế hoạch hiện tại (No Plan Change)</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Tiếp tục theo dõi phác đồ hiện hành không đổi</div>
                  </button>
                </div>
              </div>

              {/* New Care Plan Summary Editor */}
              {outcome === "care_plan_update" && (
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Nội dung Kế hoạch Chăm sóc mới (Phiên bản V{activeCarePlan.version + 1}):
                  </label>
                  <textarea
                    value={newPlanSummary}
                    onChange={(e) => setNewPlanSummary(e.target.value)}
                    rows={3}
                    className="w-full p-2.5 rounded-xl border border-sky-200 dark:border-sky-800 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Nhập hướng dẫn cụ thể về liều, thuốc cầm tiêu chảy, bù nước..."
                  />
                </div>
              )}

              {/* Rationale */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Biện luận lâm sàng của Bác sĩ (Clinical Rationale):
                </label>
                <textarea
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="Căn cứ CTCAE, NCCN hoặc diễn tiến lâm sàng..."
                />
              </div>

              {/* Digital Signature Confirmation Block */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block">Ký danh Bác sĩ</span>
                  <span className="font-bold text-slate-900 dark:text-white">{patient.primaryDoctorName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Chứng thư số</span>
                  <span className="font-mono text-[10px] text-slate-600 dark:text-slate-300">MED-CERT-2026-LONG</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSignOff}
                disabled={isMutating}
                className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <SparklesIcon size={16} />
                <span>{isMutating ? "Đang ký duyệt..." : "Ký duyệt & Cập nhật Kế hoạch Chăm sóc"}</span>
              </button>
            </div>
          )}
        </section>
      ) : (
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200/80 dark:border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <CheckCircle2Icon size={24} />
          </div>
          <h3 className="font-bold text-sm text-slate-800 dark:text-white">
            Không có ca bệnh cần review
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Hàng đợi lâm sàng hiện tại đã được giải quyết hoặc chưa có báo cáo mới.
          </p>
          <Link
            href="/patient/today"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs"
          >
            <span>Tạo ca mới từ Người bệnh</span>
            <ChevronRightIcon size={14} />
          </Link>
        </section>
      )}
    </div>
  );
}
