"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useClinical } from "@/components/clinical-context";
import {
  ShieldCheckIcon,
  AlertTriangleIcon,
  CheckCircle2Icon,
  ChevronRightIcon,
  ActivityIcon,
} from "@/components/icons";

export default function NurseQueuePage() {
  const { state, isLoading, isMutating, validateReport } = useClinical();

  const [nurseContext, setNurseContext] = useState<string>(
    "Đã liên hệ người bệnh qua điện thoại lúc 08:30. Bệnh nhân tỉnh táo nhưng mệt nhiều, đi ngoài phân lỏng 4-5 lần từ sáng kèm sốt nhẹ 38.1°C, chưa dùng thuốc cầm tiêu chảy. Đề nghị Bác sĩ hội chẩn xử trí độc tính TKI độ 2."
  );
  const [escalationRequired, setEscalationRequired] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<"all" | "pending" | "escalated">("all");

  if (isLoading || !state) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-medium text-slate-500">Đang tải hàng đợi điều phối...</p>
      </div>
    );
  }

  const { patient, activeReport, triageAssessment, nurseValidation } = state;

  const handleValidate = async (escalate: boolean) => {
    if (!activeReport) return;
    try {
      await validateReport({
        reportId: activeReport.id,
        expectedVersion: activeReport.workflowVersion,
        escalationRequired: escalate,
        context: nurseContext,
      });
    } catch {
      // Handled in context
    }
  };

  const isPendingValidation = activeReport && activeReport.status === "submitted";

  return (
    <div className="space-y-4">
      {/* 1. Nurse Command Header */}
      <section className="bg-slate-900 rounded-3xl p-5 text-white shadow-lg border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <ShieldCheckIcon size={16} />
            </div>
            <span className="font-bold text-xs uppercase tracking-wider text-indigo-300">
              Care Command Center
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-semibold">
            {patient.primaryNurseName}
          </span>
        </div>

        <h1 className="text-xl font-bold tracking-tight text-white mb-1">
          Hàng đợi Phân tầng Lâm sàng
        </h1>
        <p className="text-xs text-slate-400 leading-relaxed">
          Xác minh thông tin PRO, kiểm tra dấu hiệu sinh tồn và điều phối ca bệnh trước khi chuyển bác sĩ.
        </p>

        {/* Filter Pills */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3.5 border-t border-slate-800 text-xs">
          <button
            onClick={() => setActiveFilter("all")}
            className={`py-1.5 px-2 rounded-xl font-bold text-center transition-all ${
              activeFilter === "all"
                ? "bg-indigo-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            Tất cả ({activeReport ? 1 : 0})
          </button>
          <button
            onClick={() => setActiveFilter("pending")}
            className={`py-1.5 px-2 rounded-xl font-bold text-center transition-all ${
              activeFilter === "pending"
                ? "bg-indigo-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            Chờ duyệt ({isPendingValidation ? 1 : 0})
          </button>
          <button
            onClick={() => setActiveFilter("escalated")}
            className={`py-1.5 px-2 rounded-xl font-bold text-center transition-all ${
              activeFilter === "escalated"
                ? "bg-indigo-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            Đã chuyển ({activeReport?.status === "escalated" ? 1 : 0})
          </button>
        </div>
      </section>

      {/* 2. Main Priority Queue Item Card */}
      {activeReport ? (
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          {/* Priority Header Stripe */}
          <div
            className={`px-4 py-3 flex items-center justify-between border-b ${
              triageAssessment?.priority === "urgent"
                ? "bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200"
                : triageAssessment?.priority === "review_today"
                ? "bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200"
                : "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertTriangleIcon size={16} />
              <span className="font-bold text-xs uppercase tracking-wider">
                {triageAssessment?.priority === "urgent"
                  ? "KHẨN CẤP · URGENT"
                  : triageAssessment?.priority === "review_today"
                  ? "CẦN XEM HÔM NAY · REVIEW TODAY"
                  : "THEO DÕI ỔN ĐỊNH · STABLE"}
              </span>
            </div>
            <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-white/70 dark:bg-slate-800/80 font-bold border border-current/20">
              Trạng thái: {activeReport.status}
            </span>
          </div>

          <div className="p-4 space-y-4">
            {/* Patient Header Summary */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {patient.name}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {patient.gender}, {patient.age} tuổi · {patient.medicalRecordNumber}
                </p>
                <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 mt-1">
                  {patient.diagnosis}
                </p>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {new Date(activeReport.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>

            {/* Deterministic Triage Rule Rationale */}
            {triageAssessment && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 text-xs">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Căn cứ phân tầng thuật toán (Deterministic Triage)</span>
                  <span className="font-mono text-slate-400">{triageAssessment.ruleVersion}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  {triageAssessment.explanation}
                </p>
                {triageAssessment.triggers.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {triageAssessment.triggers.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[10px] font-bold"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Patient Reported PRO Data */}
            <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs space-y-2">
              <div className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <ActivityIcon size={14} className="text-indigo-600" />
                <span>Dữ liệu báo cáo từ người bệnh (PRO)</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                  <span className="text-[10px] text-slate-500 block">Triệu chứng chính</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 capitalize">
                    {activeReport.symptom === "diarrhea" ? "Tiêu chảy" : activeReport.symptom}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                  <span className="text-[10px] text-slate-500 block">Số lần đi ngoài</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">
                    {activeReport.diarrheaEpisodes} lần / 24h
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                  <span className="text-[10px] text-slate-500 block">Sốt</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">
                    {activeReport.fever ? "Có sốt (>= 38.0°C)" : "Không sốt"}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                  <span className="text-[10px] text-slate-500 block">Phác đồ hiện tại</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">
                    Osimertinib 80mg
                  </span>
                </div>
              </div>

              {activeReport.notes && (
                <div className="pt-2 text-[11px] text-slate-600 dark:text-slate-300 italic border-t border-slate-100 dark:border-slate-700">
                  &ldquo;{activeReport.notes}&rdquo;
                </div>
              )}
            </div>

            {/* Structured Nurse Validation Action Form */}
            {isPendingValidation ? (
              <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border-2 border-indigo-500/40 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon size={16} className="text-indigo-600 dark:text-indigo-400" />
                  <h3 className="font-bold text-xs text-indigo-950 dark:text-indigo-200 uppercase tracking-wider">
                    Xác minh & Điều phối Điều dưỡng
                  </h3>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Ghi chú lâm sàng & bối cảnh thực tế:
                  </label>
                  <textarea
                    value={nurseContext}
                    onChange={(e) => setNurseContext(e.target.value)}
                    rows={3}
                    className="w-full p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ghi nhận sinh tồn, tiếp xúc người bệnh qua điện thoại..."
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900">
                  <div className="text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">Yêu cầu Bác sĩ xem xét khẩn (Escalate)</span>
                    <span className="text-[10px] text-slate-500">Chuyển trực tiếp vào hàng đợi bác sĩ điều trị</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEscalationRequired(!escalationRequired)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                      escalationRequired ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-600"
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        escalationRequired ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleValidate(false)}
                    disabled={isMutating}
                    className="py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all disabled:opacity-50"
                  >
                    Lưu xác minh chuẩn
                  </button>
                  <button
                    type="button"
                    onClick={() => handleValidate(true)}
                    disabled={isMutating}
                    className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    <ShieldCheckIcon size={14} />
                    <span>Xác minh & Chuyển Bác sĩ</span>
                  </button>
                </div>
              </div>
            ) : nurseValidation ? (
              <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900 dark:text-emerald-200">
                    <CheckCircle2Icon size={14} className="text-emerald-600" />
                    <span>Đã xác minh bởi {patient.primaryNurseName}</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-500">
                    {new Date(nurseValidation.validatedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                  {nurseValidation.context}
                </p>
                {nurseValidation.escalationRequired && (
                  <div className="pt-2 flex items-center justify-between border-t border-emerald-200/60 dark:border-emerald-900">
                    <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 uppercase">
                      Đã kích hoạt chuyển khẩn Bác sĩ
                    </span>
                    <Link
                      href={`/doctor/review/${activeReport.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:underline"
                    >
                      <span>Mở màn hình Bác sĩ</span>
                      <ChevronRightIcon size={13} />
                    </Link>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </section>
      ) : (
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200/80 dark:border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <CheckCircle2Icon size={24} />
          </div>
          <h3 className="font-bold text-sm text-slate-800 dark:text-white">
            Hàng đợi trống
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Chưa có báo cáo triệu chứng mới từ người bệnh cần xử lý.
          </p>
          <Link
            href="/patient/today"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
          >
            <span>Tạo báo cáo mẫu từ Người bệnh</span>
            <ChevronRightIcon size={14} />
          </Link>
        </section>
      )}
    </div>
  );
}
