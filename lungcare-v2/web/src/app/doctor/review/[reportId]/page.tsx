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
  AlertTriangleIcon,
} from "@/components/icons";

export default function DoctorReviewPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  use(params);
  const { state, isLoading, isMutating, signOffDecision } = useClinical();

  // 3 distinct paths - NONE preselected
  const [outcome, setOutcome] = useState<"care_plan_update" | "no_plan_change" | "needs_information" | null>(null);

  // Physician authored decisions - start 100% EMPTY
  const [rationale, setRationale] = useState<string>("");
  const [clinicalActions, setClinicalActions] = useState<string>("");
  const [patientInstructionsPlain, setPatientInstructionsPlain] = useState<string>("");
  const [monitoring, setMonitoring] = useState<string>("");
  const [followUpTime, setFollowUpTime] = useState<string>("Hôm nay · 18:00");
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [signError, setSignError] = useState<string | null>(null);
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

  const isEscalated =
    activeReport &&
    ["escalated", "doctor_reviewing", "decision_drafted", "signed", "patient_notified", "acknowledged"].includes(
      activeReport.status,
    );

  const isAlreadySigned =
    isSigned || (activeReport && ["signed", "patient_notified", "acknowledged"].includes(activeReport.status));

  // Quick insertion helpers (non-prescriptive)
  const handleInsertSuggestion = (field: "rationale" | "actions" | "instructions" | "monitoring", text: string) => {
    if (field === "rationale") {
      setRationale((prev) => (prev ? `${prev} ${text}` : text));
    } else if (field === "actions") {
      setClinicalActions((prev) => (prev ? `${prev} ${text}` : text));
    } else if (field === "instructions") {
      setPatientInstructionsPlain((prev) => (prev ? `${prev} ${text}` : text));
    } else if (field === "monitoring") {
      setMonitoring((prev) => (prev ? `${prev} ${text}` : text));
    }
  };

  const handleSignOff = async () => {
    if (!activeReport) return;
    if (!outcome) {
      setSignError("Vui lòng chọn 1 trong 3 hướng xử trí lâm sàng.");
      return;
    }
    if (!rationale.trim()) {
      setSignError("Căn cứ lâm sàng (rationale) không được để trống.");
      return;
    }
    if (!isConfirmed) {
      setSignError("Bác sĩ vui lòng xác nhận chịu trách nhiệm chuyên môn trước khi ký.");
      return;
    }

    setSignError(null);
    try {
      await signOffDecision({
        reportId: activeReport.id,
        expectedVersion: activeReport.workflowVersion,
        outcome,
        rationale: rationale.trim(),
        differentials: [
          "Viêm phổi kẽ / Độc tính phổi do Osimertinib (Drug-induced ILD/Pneumonitis)",
          "Nhiễm trùng hô hấp / Viêm phổi cộng đồng",
          "Thuyên tắc mạch phổi (PE)",
        ],
        investigationsOrdered: [
          "Chụp HRCT lồng ngực khẩn",
          "Công thức máu (CBC), CRP",
          "Khí máu động mạch (ABG)",
          "Khám chuyên khoa hô hấp",
        ],
        clinicalActions: clinicalActions.trim(),
        patientInstructionsPlain: patientInstructionsPlain.trim(),
        monitoring: monitoring.trim(),
        followUpAssignedTo: patient.primaryNurseName,
        followUpTime,
        doctorName: patient.primaryDoctorName,
      });
      setIsSigned(true);
    } catch (err) {
      setSignError(err instanceof Error ? err.message : "Ký duyệt thất bại. Vui lòng thử lại.");
    }
  };

  const canSign =
    outcome !== null &&
    rationale.trim().length > 0 &&
    isConfirmed &&
    (outcome !== "care_plan_update" || (clinicalActions.trim().length > 0 && patientInstructionsPlain.trim().length > 0));

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

      {/* CLINICAL SAFETY GUARD: Block if not escalated */}
      {!isEscalated ? (
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-amber-400 shadow-md space-y-4 text-center animate-fadeIn">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <AlertTriangleIcon size={28} />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Khóa an toàn lâm sàng (Clinical Safety Lock)
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm mx-auto">
              Ca bệnh này <strong>chưa được Điều dưỡng hoàn tất đánh giá và chuyển tuyến</strong>.
              Theo quy trình an toàn chuyên môn, Bác sĩ chỉ xem xét và ban hành quyết định sau khi có dữ liệu đánh giá từ điều dưỡng.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/nurse/queue"
              className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs"
            >
              Mở Hàng đợi Điều dưỡng →
            </Link>
            <Link
              href="/doctor/command"
              className="py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs"
            >
              Quay lại Command Center
            </Link>
          </div>
        </section>
      ) : (
        <>
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

              {/* Clinical Assistant Summary (Facts & Reference Only) */}
              <div className="p-3 rounded-2xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/80 space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-sky-950 dark:text-sky-200">
                  <SparklesIcon size={14} className="text-sky-600" />
                  <span>Dữ liệu tham chiếu & Cân nhắc lâm sàng (Decision Support)</span>
                </div>
                <p className="text-[11px] text-sky-800 dark:text-sky-300 leading-relaxed">
                  Phân tầng NCCN/CTCAE: Đợt khó thở mới ở bệnh nhân dùng Osimertinib có SpO2 91% cần loại trừ độc tính phổi (ILD/Pneumonitis) hoặc viêm phổi. Cần HRCT ngực, CTM, CRP, khí máu trước khi quyết định can thiệp.
                </p>
              </div>
            </div>
          </section>

          {/* 3. PHYSICIAN DECISION ENGINE (Starts Empty, Requires Authored Decision) */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 border-sky-500 shadow-md space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-sky-600 text-white flex items-center justify-center">
                <StethoscopeIcon size={16} />
              </div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Quyết định Điều trị của Bác sĩ (Physician Decision)
              </h2>
            </div>

            {signError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-900 text-xs text-rose-900 dark:text-rose-200 flex items-start justify-between gap-2 animate-fadeIn">
                <div className="flex items-start gap-2">
                  <AlertTriangleIcon size={16} className="text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Không thể ký duyệt</div>
                    <p className="text-[11px] text-rose-800 dark:text-rose-300">{signError}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSignError(null)}
                  className="text-[10px] font-bold px-2 py-1 rounded bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100"
                >
                  Đóng
                </button>
              </div>
            )}

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
                {/* 3 Physician Controlled Paths */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    1. Chọn hướng xử trí lâm sàng:
                  </label>
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setOutcome("needs_information")}
                      className={`p-3 rounded-2xl text-left border transition-all ${
                        outcome === "needs_information"
                          ? "border-amber-500 bg-amber-50 dark:bg-amber-950/60 font-bold text-amber-950 dark:text-amber-200 ring-2 ring-amber-500/20"
                          : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <div className="font-bold">Yêu cầu bổ sung dữ liệu lâm sàng (Request more data)</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 font-normal">
                        Yêu cầu làm thêm cận lâm sàng hoặc đo lại chỉ số trước khi thay đổi phác đồ
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOutcome("no_plan_change")}
                      className={`p-3 rounded-2xl text-left border transition-all ${
                        outcome === "no_plan_change"
                          ? "border-slate-500 bg-slate-100 dark:bg-slate-800 font-bold text-slate-900 dark:text-white ring-2 ring-slate-400/20"
                          : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <div className="font-bold">Giữ nguyên kế hoạch chăm sóc hiện tại (No change to plan)</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 font-normal">
                        Tiếp tục phác đồ Osimertinib 80mg và theo dõi sát triệu chứng
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOutcome("care_plan_update")}
                      className={`p-3 rounded-2xl text-left border transition-all ${
                        outcome === "care_plan_update"
                          ? "border-sky-600 bg-sky-50 dark:bg-sky-950/60 font-bold text-sky-950 dark:text-sky-200 ring-2 ring-sky-500/20"
                          : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <div className="font-bold">Cập nhật Kế hoạch Chăm sóc (Update Care Plan)</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 font-normal">
                        Tạm hoãn thuốc đích, chỉ định HRCT ngực khẩn và gán lịch tái đánh giá cho điều dưỡng
                      </div>
                    </button>
                  </div>
                </div>

                {/* Clinical Rationale (Physician authored) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      2. Căn cứ lâm sàng & Biện luận của Bác sĩ (Rationale):
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        handleInsertSuggestion(
                          "rationale",
                          "Khó thở mới xuất hiện khi nghỉ kèm SpO2 giảm 91% và sốt nhẹ trên bệnh nhân đang điều trị Osimertinib. Nghi ngờ biến cố độc tính phổi/viêm phổi kẽ cần tạm hoãn thuốc và chụp HRCT ngực khẩn.",
                        )
                      }
                      className="text-[10px] text-sky-600 dark:text-sky-400 hover:underline"
                    >
                      + Chèn gợi ý mẫu
                    </button>
                  </div>
                  <textarea
                    value={rationale}
                    onChange={(e) => setRationale(e.target.value)}
                    rows={3}
                    placeholder="Nhập đánh giá chuyên môn, phân tích chẩn đoán phân biệt..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                {/* Specific Fields for Care Plan Update */}
                {outcome === "care_plan_update" && (
                  <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 animate-fadeIn">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Chỉ định y lệnh lâm sàng (Clinical Actions):
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            handleInsertSuggestion(
                              "actions",
                              "Tạm dừng Osimertinib 80mg từ hôm nay. Chỉ định chụp HRCT lồng ngực khẩn, xét nghiệm CTM, CRP, cấy đờm, khí máu động mạch và khám chuyên khoa hô hấp.",
                            )
                          }
                          className="text-[10px] text-sky-600 dark:text-sky-400 hover:underline"
                        >
                          + Chèn y lệnh chuẩn
                        </button>
                      </div>
                      <textarea
                        value={clinicalActions}
                        onChange={(e) => setClinicalActions(e.target.value)}
                        rows={2}
                        placeholder="Nhập y lệnh thay đổi thuốc, chỉ định cận lâm sàng..."
                        className="w-full p-2.5 rounded-xl border border-sky-200 dark:border-sky-800 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Hướng dẫn cho Người bệnh (Plain Language Vietnamese):
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            handleInsertSuggestion(
                              "instructions",
                              "Bác An tạm dừng uống viên Osimertinib hôm nay. Hãy nghỉ ngơi tại giường, đo lại SpO2 sau mỗi 2 giờ. Điều dưỡng Mai sẽ gọi điện hướng dẫn và hẹn giờ kiểm tra lúc 18:00 hôm nay.",
                            )
                          }
                          className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          + Chèn lời dặn mẫu
                        </button>
                      </div>
                      <textarea
                        value={patientInstructionsPlain}
                        onChange={(e) => setPatientInstructionsPlain(e.target.value)}
                        rows={2}
                        placeholder="Lời dặn dễ hiểu bằng tiếng Việt cho bác An..."
                        className="w-full p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] text-slate-500 block">Theo dõi trọng tâm</span>
                        <input
                          type="text"
                          value={monitoring}
                          onChange={(e) => setMonitoring(e.target.value)}
                          placeholder="SpO2 mỗi 2h, thân nhiệt..."
                          className="w-full text-xs font-semibold text-slate-800 dark:text-slate-200 bg-transparent focus:outline-none mt-0.5"
                        />
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] text-slate-500 block">Giao việc Điều dưỡng</span>
                        <input
                          type="text"
                          value={followUpTime}
                          onChange={(e) => setFollowUpTime(e.target.value)}
                          className="w-full text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-transparent focus:outline-none mt-0.5"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Confirmation Step (CONFIRM_SIGN) */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isConfirmed}
                      onChange={(e) => setIsConfirmed(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    />
                    <span className="text-slate-800 dark:text-slate-200 font-medium text-[11px] leading-relaxed">
                      Tôi xác nhận đã trực tiếp đánh giá chứng cứ lâm sàng của người bệnh <strong>{patient.name}</strong> và chịu trách nhiệm chuyên môn về quyết định này.
                    </span>
                  </label>
                  <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-700 flex justify-between">
                    <span>Bác sĩ: <strong>{patient.primaryDoctorName}</strong></span>
                    <span>Quyền hạn: Bác sĩ điều trị chính</span>
                  </div>
                </div>

                {/* Sign Button */}
                <button
                  type="button"
                  onClick={handleSignOff}
                  disabled={!canSign || isMutating}
                  className="w-full py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <SparklesIcon size={16} />
                  <span>{isMutating ? "Đang xử lý ký duyệt..." : "Ký duyệt & Ban hành Kế hoạch Chăm sóc"}</span>
                </button>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
