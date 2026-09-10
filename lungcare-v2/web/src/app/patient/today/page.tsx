"use client";

import React, { useState } from "react";
import { useClinical } from "@/components/clinical-context";
import type { SymptomKind } from "@/domain/schemas";
import {
  HeartPulseIcon,
  PillIcon,
  CheckCircle2Icon,
  ClockIcon,
  UserIcon,
  SparklesIcon,
  StethoscopeIcon,
} from "@/components/icons";

export default function PatientTodayPage() {
  const { state, isLoading, isMutating, submitReport, acknowledgeCarePlan } = useClinical();

  const [symptom, setSymptom] = useState<SymptomKind>("diarrhea");
  const [diarrheaEpisodes, setDiarrheaEpisodes] = useState<number>(4);
  const [fever, setFever] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>("Bắt đầu đi ngoài nhiều lần từ sáng nay, cảm thấy người hơi gai sốt và mệt mỏi.");
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  if (isLoading || !state) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-medium text-slate-500">Đang tải hồ sơ điều trị...</p>
      </div>
    );
  }

  const { patient, activeCarePlan, activeReport, carePlanVersions, acknowledgements } = state;
  const isPendingAck =
    activeReport?.status === "patient_notified" ||
    (carePlanVersions.length > 1 && !acknowledgements.some((a) => a.carePlanVersionId === activeCarePlan.id));

  const isReportInReview =
    activeReport && ["submitted", "nurse_validated", "escalated", "doctor_reviewed"].includes(activeReport.status);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitReport({
        symptom,
        diarrheaEpisodes: symptom === "diarrhea" ? diarrheaEpisodes : 0,
        fever,
        notes,
      });
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 4000);
    } catch {
      // Handled in context
    }
  };

  const handleAcknowledge = async () => {
    if (!activeCarePlan || !activeReport) return;
    try {
      await acknowledgeCarePlan({
        carePlanVersionId: activeCarePlan.id,
        expectedVersion: activeReport.workflowVersion,
      });
    } catch {
      // Handled in context
    }
  };

  const symptomsList: { id: SymptomKind; label: string; desc: string }[] = [
    { id: "diarrhea", label: "Tiêu chảy", desc: "Đi ngoài phân lỏng nhiều lần" },
    { id: "dyspnea", label: "Khó thở", desc: "Hụt hơi, thở dốc khi nghỉ" },
    { id: "chest_pain", label: "Đau ngực", desc: "Tức nặng vùng lồng ngực" },
    { id: "rash", label: "Phát ban da", desc: "Mẩn đỏ, ngứa hoặc mụn mủ" },
    { id: "none", label: "Ổn định", desc: "Không có triệu chứng mới" },
  ];

  return (
    <div className="space-y-4">
      {/* 1. Reassuring Patient Hero Card */}
      <section className="bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 rounded-3xl p-5 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-36 h-36 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 font-semibold text-[11px] tracking-wide border border-emerald-400/30">
              Đồng hành Ung bướu
            </span>
          </div>
          <span className="text-[11px] text-emerald-200/80 font-medium">Hôm nay</span>
        </div>

        <h1 className="text-xl font-bold tracking-tight text-white mb-1">
          Chào Bác {patient.name.split(" ").slice(-1)[0]}
        </h1>
        <p className="text-xs text-emerald-100/90 leading-relaxed max-w-sm">
          {patient.regimen} · {patient.currentCycle}
        </p>

        <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between text-[11px] text-emerald-200/90">
          <div className="flex items-center gap-1.5">
            <UserIcon size={13} className="text-emerald-300" />
            <span>{patient.medicalRecordNumber}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <StethoscopeIcon size={13} className="text-emerald-300" />
            <span>{patient.primaryDoctorName}</span>
          </div>
        </div>
      </section>

      {/* 2. PROMINENT ATTENTION CARD: Care Plan Update Awaiting Patient Acknowledgement */}
      {isPendingAck && (
        <section className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/70 dark:to-slate-900 rounded-2xl p-4 border-2 border-emerald-500 shadow-md animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <SparklesIcon size={18} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">
                  Chỉ định mới từ Bác sĩ
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                  Kế hoạch V{activeCarePlan.version}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                {patient.primaryDoctorName} đã cập nhật kế hoạch chăm sóc của bạn
              </p>
              <div className="mt-2 p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-emerald-200 dark:border-emerald-800/60 text-xs text-slate-800 dark:text-slate-100 font-medium leading-relaxed">
                {activeCarePlan.summary}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                Ký duyệt lúc {new Date(activeCarePlan.signedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
              </p>

              <button
                onClick={handleAcknowledge}
                disabled={isMutating}
                className="mt-3 w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <CheckCircle2Icon size={16} />
                <span>Tôi đã hiểu và cam kết làm theo hướng dẫn</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 3. Active Care Plan Card */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center">
              <PillIcon size={14} />
            </div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Kế hoạch điều trị hiện hành (V{activeCarePlan.version})
            </h2>
          </div>
          {acknowledgements.some((a) => a.carePlanVersionId === activeCarePlan.id) && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2Icon size={11} />
              Đã xác nhận
            </span>
          )}
        </div>

        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          {activeCarePlan.summary}
        </p>

        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Người ký: {patient.primaryDoctorName}</span>
          <span>Bản ký điện tử</span>
        </div>
      </section>

      {/* 4. Symptom Reporting Section */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <HeartPulseIcon size={14} />
            </div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Báo cáo Triệu chứng & Tác dụng phụ
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">PRO Daily</span>
        </div>

        {isReportInReview && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                <ClockIcon size={14} />
                Đang được đội ngũ y tế xử lý
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 font-bold text-[10px] uppercase">
                {activeReport.status}
              </span>
            </div>
            <p className="text-[11px] text-amber-800 dark:text-amber-200 mt-1">
              Báo cáo lúc {new Date(activeReport.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} đang được Điều dưỡng và Bác sĩ đánh giá.
            </p>
          </div>
        )}

        {submitSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2Icon size={16} className="text-emerald-600 shrink-0" />
            <span>Báo cáo triệu chứng đã được gửi thành công đến đội ngũ chăm sóc!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Symptom Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Triệu chứng bạn đang gặp phải hôm nay:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {symptomsList.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setSymptom(item.id)}
                  className={`p-2.5 rounded-xl text-left border transition-all ${
                    symptom === item.id
                      ? "border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/40"
                  }`}
                >
                  <div className="font-bold text-xs">{item.label}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Diarrhea Specific Counter */}
          {symptom === "diarrhea" && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Số lần đi ngoài phân lỏng / 24h</div>
                  <div className="text-[11px] text-slate-500">Từ 4 lần trở lên cần được bác sĩ đánh giá sớm</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDiarrheaEpisodes(Math.max(1, diarrheaEpisodes - 1))}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white font-bold text-sm flex items-center justify-center hover:bg-slate-100"
                  >
                    -
                  </button>
                  <span className="w-7 text-center font-bold text-sm text-slate-900 dark:text-white">
                    {diarrheaEpisodes}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDiarrheaEpisodes(diarrheaEpisodes + 1)}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white font-bold text-sm flex items-center justify-center hover:bg-slate-100"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Fever Switch */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Bạn có bị sốt không?</div>
              <div className="text-[11px] text-slate-500">Thân nhiệt đo được từ 38.0°C trở lên</div>
            </div>
            <button
              type="button"
              onClick={() => setFever(!fever)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                fever ? "bg-rose-600" : "bg-slate-300 dark:bg-slate-600"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  fever ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Ghi chú thêm cho Bác sĩ & Điều dưỡng:
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Mô tả cảm giác mệt mỏi, đau, ăn uống..."
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={isMutating}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <HeartPulseIcon size={16} />
            <span>{isMutating ? "Đang gửi..." : "Gửi Báo Cáo Triệu Chứng"}</span>
          </button>
        </form>
      </section>

      {/* 5. Care Team Footer Information */}
      <section className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs">
        <h3 className="text-slate-500 font-bold text-[11px] uppercase tracking-wider mb-2">
          Đội ngũ y tế phụ trách ca bệnh
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800 dark:text-slate-200">{patient.primaryDoctorName}</span>
            <span className="text-slate-500 text-[11px]">{patient.primaryDoctorTitle}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800 dark:text-slate-200">{patient.primaryNurseName}</span>
            <span className="text-slate-500 text-[11px]">Điều phối viên chăm sóc</span>
          </div>
        </div>
      </section>
    </div>
  );
}
