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
  const isUrgent = state?.triageAssessment?.priority === "urgent" || state?.activeReport?.symptom === "dyspnea";

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-md mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
                <HeartPulseIcon size={16} />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">LungCare</span>
                <span className="text-[10px] font-semibold text-slate-400">V4 Gate A</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowAudit(true)}
              className="px-2 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
              title="Xem nhật ký kiểm toán"
            >
              <HistoryIcon size={14} />
              <span className="text-[11px]">Audit</span>
              {state?.auditEvents && (
                <span className="text-[10px] text-slate-400 font-mono">({state.auditEvents.length})</span>
              )}
            </button>

            <button
              onClick={() => resetState()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Khôi phục trạng thái mặc định"
            >
              <RefreshCwIcon size={14} />
            </button>
          </div>
        </div>

        {/* Dynamic Role Switcher Tabs */}
        <div className="max-w-md mx-auto px-3 pb-2">
          <div className="grid grid-cols-3 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
            {/* Patient */}
            <Link
              href="/patient/today"
              className={`relative flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition-all ${
                activeRole === "patient"
                  ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <HeartPulseIcon size={14} className={activeRole === "patient" ? "text-emerald-600" : "text-slate-400"} />
              <span>Bác An</span>
              {reportStatus === "patient_notified" && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse absolute top-1 right-1" />
              )}
            </Link>

            {/* Nurse */}
            <Link
              href="/nurse/queue"
              className={`relative flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition-all ${
                activeRole === "nurse"
                  ? "bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <ShieldCheckIcon size={14} className={activeRole === "nurse" ? "text-indigo-600" : "text-slate-400"} />
              <span>ĐD. Mai</span>
              {reportStatus === "submitted" && (
                <span className="px-1.5 py-0.2 text-[9px] rounded-full bg-rose-500 text-white font-bold absolute top-0.5 right-1">
                  1
                </span>
              )}
            </Link>

            {/* Doctor */}
            <Link
              href="/doctor/command"
              className={`relative flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition-all ${
                activeRole === "doctor"
                  ? "bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-400 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <StethoscopeIcon size={14} className={activeRole === "doctor" ? "text-sky-600" : "text-slate-400"} />
              <span>BS. Long</span>
              {isUrgent && (reportStatus === "escalated" || reportStatus === "submitted") && (
                <span className="px-1.5 py-0.2 text-[9px] rounded-full bg-rose-500 text-white font-bold absolute top-0.5 right-1">
                  !
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Audit Drawer */}
      {showAudit && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full overflow-y-auto shadow-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Lịch sử Chuyển trạng thái Lâm sàng</h3>
                  <p className="text-[11px] text-slate-500">Immutable Audit Trail (V4 Specification)</p>
                </div>
                <button
                  onClick={() => setShowAudit(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 space-y-2.5">
                {state?.auditEvents && state.auditEvents.length > 0 ? (
                  state.auditEvents.map((evt, idx) => (
                    <div key={evt.id || idx} className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            evt.actorRole === "patient" ? "bg-emerald-100 text-emerald-800" :
                            evt.actorRole === "nurse" ? "bg-indigo-100 text-indigo-800" :
                            evt.actorRole === "doctor" ? "bg-sky-100 text-sky-800" :
                            "bg-slate-200 text-slate-800"
                          }`}>
                            {evt.actorRole}
                          </span>
                          <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">
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
                      <div className="mt-1 text-[10px] text-slate-400 font-mono flex items-center justify-between">
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
                className="w-full py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs"
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
