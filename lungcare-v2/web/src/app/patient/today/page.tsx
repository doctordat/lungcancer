"use client";

import React from "react";
import Link from "next/link";
import { useClinical } from "@/components/clinical-context";
import {
  HeartPulseIcon,
  PillIcon,
  CheckCircle2Icon,
  ClockIcon,
  AlertTriangleIcon,
  UserIcon,
  SparklesIcon,
  StethoscopeIcon,
  ChevronRightIcon,
  ActivityIcon,
} from "@/components/icons";

export default function PatientTodayPage() {
  const { state, isLoading, isMutating, acknowledgeCarePlan } = useClinical();

  if (isLoading || !state) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-medium text-slate-500">Đang tải hồ sơ hôm nay...</p>
      </div>
    );
  }

  const { patient, activeCarePlan, activeReport, carePlanVersions, acknowledgements } = state;

  const isPendingAck =
    activeReport?.status === "patient_notified" ||
    (carePlanVersions.length > 1 && !acknowledgements.some((a) => a.carePlanVersionId === activeCarePlan.id));

  const isReportInReview =
    activeReport && ["submitted", "nurse_validated", "escalated", "doctor_reviewed"].includes(activeReport.status);

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

  return (
    <div className="space-y-4 pb-20">
      {/* 1. Header & Greeting */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Chào bác An
          </h1>
          <p className="text-xs text-slate-500">
            Hôm nay, Thứ Năm 10/09/2026 · {patient.currentCycle}
          </p>
        </div>
        <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-xs border border-emerald-300 dark:border-emerald-800">
          VA
        </div>
      </div>

      {/* 2. PROMINENT CARE PLAN UPDATE NOTIFICATION BANNER (When doctor signs off) */}
      {isPendingAck && (
        <section className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/80 dark:to-slate-900 rounded-3xl p-4 border-2 border-emerald-500 shadow-md animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <SparklesIcon size={16} />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">
                  Chỉ định mới từ Bác sĩ
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                  Kế hoạch mới
                </span>
              </div>

              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                BS Long đã cập nhật kế hoạch chăm sóc của bác
              </h2>

              <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800/60 text-xs text-slate-800 dark:text-slate-100 leading-relaxed space-y-1.5">
                <p className="font-semibold text-emerald-900 dark:text-emerald-300">
                  {activeCarePlan.patientInstructionsPlain || activeCarePlan.summary}
                </p>
                {activeCarePlan.followUpTime && (
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-100 dark:border-slate-700">
                    • Hẹn gọi kiểm tra: <strong>{activeCarePlan.followUpAssignedTo}</strong> ({activeCarePlan.followUpTime})
                  </p>
                )}
              </div>

              <button
                onClick={handleAcknowledge}
                disabled={isMutating}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <CheckCircle2Icon size={15} />
                <span>Tôi đã hiểu và cam kết làm theo hướng dẫn</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 3. ACTIVE REPORT STATUS (If submitted and in review) */}
      {isReportInReview && (
        <section className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
              <ClockIcon size={14} />
              Báo cáo triệu chứng đang được xử lý
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 font-bold text-[10px]">
              {activeReport.status === "submitted" ? "Đã gửi đội chăm sóc" : activeReport.status === "escalated" ? "Đang chuyển bác sĩ" : "Bác sĩ đang đánh giá"}
            </span>
          </div>
          <p className="text-[11px] text-amber-800 dark:text-amber-200">
            Triệu chứng: {activeReport.symptom === "dyspnea" ? "Khó thở đợt mới" : activeReport.symptom}. ĐD Mai và BS Long đang xem xét ca bệnh.
          </p>
        </section>
      )}

      {/* 4. PERSISTENT STRONG CTA: "Tôi thấy không ổn" */}
      <Link
        href="/patient/symptom-check"
        className="w-full p-4 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-600 hover:to-amber-700 active:scale-[0.99] text-white font-bold text-sm shadow-md flex items-center justify-between transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <AlertTriangleIcon size={18} className="text-white" />
          </div>
          <div className="text-left">
            <div className="text-sm font-bold">Tôi thấy không ổn</div>
            <div className="text-[11px] text-white/90 font-normal">Báo ngay triệu chứng mệt, khó thở hoặc sốt</div>
          </div>
        </div>
        <ChevronRightIcon size={18} className="group-hover:translate-x-1 transition-transform" />
      </Link>

      {/* 5. HÔM NAY — 3 việc cần làm */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Hôm nay — Việc cần làm
          </h2>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">1 / 3 hoàn thành</span>
        </div>

        <div className="space-y-2">
          {patient.dailyTasks.map((task) => (
            <div
              key={task.id}
              className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                task.completed
                  ? "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 line-through"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    task.completed ? "bg-emerald-500 text-white" : "border-2 border-slate-300 dark:border-slate-600"
                  }`}
                >
                  {task.completed ? "✓" : "○"}
                </div>
                <span className="font-medium">{task.title}</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">{task.time}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Treatment Summary Card */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center">
              <PillIcon size={14} />
            </div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Phác đồ điều trị
            </h2>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
            Tuân thủ 96%
          </span>
        </div>

        <div className="space-y-1">
          <div className="text-sm font-bold text-slate-900 dark:text-white">
            {patient.regimen}
          </div>
          <p className="text-xs text-slate-500">
            {patient.currentCycle} · Ngày {patient.dayInCycle} / {patient.totalCycleDays}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-emerald-600 h-full rounded-full transition-all"
            style={{ width: `${(patient.dayInCycle / patient.totalCycleDays) * 100}%` }}
          />
        </div>

        <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-xs flex items-center justify-between">
          <div>
            <span className="font-bold text-emerald-900 dark:text-emerald-200 block">Đang đáp ứng điều trị</span>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-300">{patient.targetLesions}</span>
          </div>
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-200">{patient.recistResponse.split(" ")[0]}</span>
        </div>
      </section>

      {/* 7. Upcoming Section */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Sắp tới
        </h2>
        {patient.upcomingAppointments.map((app, idx) => (
          <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
            <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
              <span>{app.title}</span>
              <span className="text-sky-600 dark:text-sky-400">Còn {app.remainingDays} ngày ({app.date})</span>
            </div>
            <p className="text-[11px] text-slate-500">{app.prep}</p>
          </div>
        ))}
      </section>

      {/* 8. 7-Day Health Summary */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Sức khỏe 7 ngày qua
        </h2>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] text-slate-500 block">Ăn uống</span>
            <span className="font-bold text-emerald-700 dark:text-emerald-400">Ổn định</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] text-slate-500 block">Cân nặng</span>
            <span className="font-bold text-amber-700 dark:text-amber-400">↓ 1.2 kg (62.8 kg)</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] text-slate-500 block">Tiêu chảy</span>
            <span className="font-bold text-amber-700 dark:text-amber-400">Cần theo dõi</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] text-slate-500 block">Khó thở</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">Chưa ghi nhận trước đó</span>
          </div>
        </div>
      </section>

      {/* 9. Care Team & Contact */}
      <section className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs space-y-3">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Đội ngũ y tế phụ trách
        </h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StethoscopeIcon size={14} className="text-slate-400" />
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200">{patient.primaryDoctorName}</span>
                <span className="text-[11px] text-slate-500 block">{patient.primaryDoctorTitle}</span>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-medium">Bác sĩ</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserIcon size={14} className="text-slate-400" />
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200">{patient.primaryNurseName}</span>
                <span className="text-[11px] text-slate-500 block">Điều phối viên chăm sóc</span>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-medium">Điều dưỡng</span>
          </div>
        </div>

        <Link
          href="/patient/symptom-check"
          className="block w-full py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-800 dark:text-slate-200 font-bold text-xs text-center transition-colors"
        >
          Nhắn tin & Gửi kiểm tra triệu chứng
        </Link>
      </section>

      {/* 10. Bottom Navigation Bar (Patient) */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 py-2 backdrop-blur-md">
        <div className="max-w-md mx-auto px-4 grid grid-cols-5 text-center text-[10px] font-semibold text-slate-500">
          <Link href="/patient/today" className="text-emerald-700 dark:text-emerald-400 flex flex-col items-center gap-0.5">
            <HeartPulseIcon size={16} />
            <span>Hôm nay</span>
          </Link>
          <div className="flex flex-col items-center gap-0.5 hover:text-slate-800 cursor-pointer">
            <ActivityIcon size={16} />
            <span>Hành trình</span>
          </div>
          <Link href="/patient/symptom-check" className="flex flex-col items-center gap-0.5 hover:text-slate-800">
            <AlertTriangleIcon size={16} />
            <span>Sức khỏe</span>
          </Link>
          <div className="flex flex-col items-center gap-0.5 hover:text-slate-800 cursor-pointer">
            <PillIcon size={16} />
            <span>Chi phí</span>
          </div>
          <div className="flex flex-col items-center gap-0.5 hover:text-slate-800 cursor-pointer">
            <UserIcon size={16} />
            <span>Tôi</span>
          </div>
        </div>
      </nav>
    </div>
  );
}
