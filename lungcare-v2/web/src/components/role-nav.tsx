"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClinical } from "./clinical-context";
import {
  HeartPulseIcon,
  StethoscopeIcon,
  ShieldCheckIcon,
  HistoryIcon,
  RefreshCwIcon,
} from "./icons";

export function RoleNav() {
  const pathname = usePathname();
  const { state, resetState } = useClinical();
  const [showAudit, setShowAudit] = useState(false);

  const getActiveRole = () => {
    if (pathname?.startsWith("/patient")) return "patient";
    if (pathname?.startsWith("/nurse")) return "nurse";
    if (pathname?.startsWith("/doctor")) return "doctor";
    return "home";
  };

  const activeRole = getActiveRole();
  const reportStatus = state?.activeReport?.status;
  const unreadCarePlan =
    state?.activeReport?.status === "patient_notified" ||
    (state?.carePlanVersions && state.carePlanVersions.length > 1 && !state?.acknowledgements?.some(a => a.carePlanVersionId === state.activeCarePlan.id));

  return (
    <>
      {/* Top Ambient Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-md mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                <HeartPulseIcon size={18} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">LungCare</span>
                  <span className="text-[10px] font-semibold tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">V3</span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium block -mt-0.5">Connected Oncology</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowAudit(true)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
              title="Xem lịch sử kiểm toán"
            >
              <HistoryIcon size={14} />
              <span className="hidden sm:inline">Audit</span>
              {state?.auditEvents && state.auditEvents.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] flex items-center justify-center font-bold">
                  {state.auditEvents.length}
                </span>
              )}
            </button>

            <button
              onClick={() => resetState()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Khôi phục trạng thái ban đầu"
            >
              <RefreshCwIcon size={15} />
            </button>
          </div>
        </div>

        {/* Dynamic Role Switcher Navigation (Mobile Segmented Control) */}
        <div className="max-w-md mx-auto px-3 pb-2.5">
          <div className="grid grid-cols-3 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
            {/* Patient Role */}
            <Link
              href="/patient/today"
              className={`relative flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg transition-all ${
                activeRole === "patient"
                  ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <HeartPulseIcon size={15} className={activeRole === "patient" ? "text-emerald-600" : "text-slate-400"} />
              <span>Người bệnh</span>
              {unreadCarePlan && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse absolute top-1.5 right-1.5" />
              )}
            </Link>

            {/* Nurse Role */}
            <Link
              href="/nurse/queue"
              className={`relative flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg transition-all ${
                activeRole === "nurse"
                  ? "bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-sm font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <ShieldCheckIcon size={15} className={activeRole === "nurse" ? "text-indigo-600" : "text-slate-400"} />
              <span>Điều dưỡng</span>
              {reportStatus === "submitted" && (
                <span className="px-1 py-0.2 text-[9px] rounded-full bg-rose-500 text-white font-bold absolute top-1 right-1">
                  1
                </span>
              )}
            </Link>

            {/* Doctor Role */}
            <Link
              href={state?.activeReport ? `/doctor/review/${state.activeReport.id}` : "/doctor/review/demo"}
              className={`relative flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg transition-all ${
                activeRole === "doctor"
                  ? "bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-400 shadow-sm font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <StethoscopeIcon size={15} className={activeRole === "doctor" ? "text-sky-600" : "text-slate-400"} />
              <span>Bác sĩ</span>
              {(reportStatus === "escalated" || reportStatus === "nurse_validated") && (
                <span className="px-1 py-0.2 text-[9px] rounded-full bg-amber-500 text-white font-bold absolute top-1 right-1">
                  !
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Global Live Status Banner */}
        {state?.activeReport && (
          <div className="bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200/60 dark:border-slate-800/60 px-4 py-1.5 text-[11px] flex items-center justify-between max-w-md mx-auto">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-semibold">Báo cáo hiện tại:</span>
              <span className="font-mono text-slate-500 truncate max-w-[120px]">{state.activeReport.id.slice(0, 8)}...</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-500">Trạng thái:</span>
              <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase tracking-wider ${
                reportStatus === "submitted" ? "bg-amber-100 text-amber-800" :
                reportStatus === "nurse_validated" ? "bg-indigo-100 text-indigo-800" :
                reportStatus === "escalated" ? "bg-rose-100 text-rose-800" :
                reportStatus === "doctor_reviewed" ? "bg-sky-100 text-sky-800" :
                reportStatus === "signed" ? "bg-teal-100 text-teal-800" :
                reportStatus === "patient_notified" ? "bg-emerald-100 text-emerald-800" :
                reportStatus === "acknowledged" ? "bg-emerald-600 text-white" :
                "bg-slate-100 text-slate-800"
              }`}>
                {reportStatus}
              </span>
            </div>
          </div>
        )}
      </header>

      {/* Audit History Drawer */}
      {showAudit && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full overflow-y-auto shadow-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                    <HistoryIcon size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Lịch sử Kiểm toán Lâm sàng</h3>
                    <p className="text-[11px] text-slate-500">Immutable Audit Trail (V3 Specification)</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAudit(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {state?.auditEvents && state.auditEvents.length > 0 ? (
                  state.auditEvents.map((evt, idx) => (
                    <div key={evt.id || idx} className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            evt.actorRole === "patient" ? "bg-emerald-100 text-emerald-800" :
                            evt.actorRole === "nurse" ? "bg-indigo-100 text-indigo-800" :
                            evt.actorRole === "doctor" ? "bg-sky-100 text-sky-800" :
                            "bg-slate-200 text-slate-800"
                          }`}>
                            {evt.actorRole}
                          </span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {evt.fromStatus} → {evt.toStatus}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400">
                          v{evt.workflowVersion}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                        {evt.reason}
                      </p>
                      <div className="mt-1.5 text-[10px] text-slate-400 font-mono flex items-center justify-between">
                        <span>{new Date(evt.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
                        <span>{evt.id.slice(0, 8)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-8">Chưa có sự kiện nào được ghi nhận.</p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowAudit(false)}
                className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
