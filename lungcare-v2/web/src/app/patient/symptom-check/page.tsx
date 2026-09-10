"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useClinical } from "@/components/clinical-context";
import type { SymptomKind, DyspneaTrigger, Progression } from "@/domain/schemas";
import {
  HeartPulseIcon,
  CheckCircle2Icon,
  AlertTriangleIcon,
} from "@/components/icons";

export default function PatientSymptomCheckPage() {
  const { state, isMutating, submitReport } = useClinical();

  const [symptom, setSymptom] = useState<SymptomKind>("dyspnea");
  const [dyspneaTrigger, setDyspneaTrigger] = useState<DyspneaTrigger>("at_rest");
  const [progression, setProgression] = useState<Progression>("worse");
  const [spo2, setSpo2] = useState<number | "">(91);
  const [temperature, setTemperature] = useState<number | "">(38.1);
  const [diarrheaEpisodes, setDiarrheaEpisodes] = useState<number>(3);
  const [fever, setFever] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>("Cảm thấy hụt hơi ngay cả khi ngồi nghỉ, người gai sốt và mệt từ sáng nay.");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const activeReport = state?.activeReport;

  // Symptom isolation handler: Switching symptom cleans incompatible values
  const handleSelectSymptom = (newSymptom: SymptomKind) => {
    setSymptom(newSymptom);
    setSubmitError(null);
    if (newSymptom === "dyspnea") {
      setDyspneaTrigger("at_rest");
      setProgression("worse");
      setSpo2(91);
      setTemperature(38.1);
      setDiarrheaEpisodes(0);
      setFever(false);
      setNotes("Cảm thấy hụt hơi ngay cả khi ngồi nghỉ, người gai sốt và mệt từ sáng nay.");
    } else if (newSymptom === "diarrhea") {
      setDyspneaTrigger(null);
      setProgression(null);
      setSpo2("");
      setTemperature("");
      setDiarrheaEpisodes(4);
      setFever(false);
      setNotes("Đi ngoài phân lỏng 4-5 lần từ sáng, đang uống bù Oresol.");
    } else {
      setDyspneaTrigger(null);
      setProgression(null);
      setSpo2("");
      setTemperature(newSymptom === "fever" ? 38.5 : "");
      setDiarrheaEpisodes(0);
      setFever(newSymptom === "fever");
      setNotes("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    try {
      await submitReport({
        symptom,
        dyspneaTrigger: symptom === "dyspnea" ? dyspneaTrigger : null,
        progression: symptom === "dyspnea" ? progression : null,
        spo2: symptom === "dyspnea" && typeof spo2 === "number" ? spo2 : null,
        temperature: typeof temperature === "number" ? temperature : null,
        diarrheaEpisodes: symptom === "diarrhea" ? diarrheaEpisodes : 0,
        fever: fever || (typeof temperature === "number" && temperature >= 38.0),
        notes,
      });
      setIsSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Gửi báo cáo thất bại. Vui lòng thử lại.");
    }
  };

  const symptomChoices: { id: SymptomKind; label: string; desc: string }[] = [
    { id: "dyspnea", label: "Khó thở", desc: "Hụt hơi, thở dốc khi nghỉ hoặc đi lại" },
    { id: "diarrhea", label: "Tiêu chảy", desc: "Đi ngoài phân lỏng nhiều lần" },
    { id: "fever", label: "Sốt / Gai rét", desc: "Thân nhiệt tăng, người ớn lạnh" },
    { id: "pain", label: "Đau tức ngực / Đau", desc: "Đau vùng ngực, lưng hoặc khớp" },
    { id: "rash", label: "Phát ban da", desc: "Mẩn đỏ, ngứa da do thuốc" },
    { id: "nausea", label: "Buồn nôn / Mệt", desc: "Chán ăn, mệt lả không muốn dậy" },
    { id: "other", label: "Triệu chứng khác", desc: "Các bất thường khác" },
  ];

  const isUrgent = symptom === "dyspnea" && (dyspneaTrigger === "at_rest" || (typeof spo2 === "number" && spo2 <= 92));

  return (
    <div className="space-y-4 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <Link href="/patient/today" className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1">
          ← Quay lại Hôm nay
        </Link>
        <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
          Kiểm tra triệu chứng
        </span>
      </div>

      {submitError && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-900 text-xs text-rose-900 dark:text-rose-200 flex items-start justify-between gap-2 animate-fadeIn">
          <div className="flex items-start gap-2">
            <AlertTriangleIcon size={16} className="text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Không thể gửi báo cáo</div>
              <p className="text-[11px] text-rose-800 dark:text-rose-300">{submitError}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSubmitError(null)}
            className="text-[10px] font-bold px-2 py-1 rounded bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100"
          >
            Đóng
          </button>
        </div>
      )}

      {isSubmitted || (activeReport && ["submitted", "nurse_reviewing", "nurse_assessed", "escalated", "doctor_reviewing", "decision_drafted"].includes(activeReport.status)) ? (
        /* Live Status Timeline After Submission */
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <CheckCircle2Icon size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Báo cáo đã được gửi an toàn
              </h2>
              <p className="text-xs text-slate-500">
                Đội ngũ chăm sóc đang trực tiếp theo dõi ca bệnh
              </p>
            </div>
          </div>

          {/* Workflow Live Progress Timeline */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Tiến độ xử lý lâm sàng
            </div>

            <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
              {/* Step 1 */}
              <div className="flex items-start gap-3 relative">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 shadow-xs">
                  ✓
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white">Đã gửi báo cáo triệu chứng</div>
                  <div className="text-[11px] text-slate-500">
                    {activeReport?.symptom === "dyspnea" ? "Khó thở khi nghỉ · SpO2 91% · Sốt 38.1°C" : activeReport?.symptom || "Triệu chứng mới"}
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3 relative">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  activeReport?.status === "submitted" || activeReport?.status === "nurse_reviewing" || activeReport?.status === "nurse_assessed" || activeReport?.status === "escalated" || activeReport?.status === "doctor_reviewing"
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-200 text-slate-400"
                }`}>
                  {activeReport?.status !== "submitted" ? "✓" : "●"}
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white">ĐD. Mai đã tiếp nhận & đánh giá</div>
                  <div className="text-[11px] text-slate-500">Đang hoàn tất bảng kiểm tra hô hấp</div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3 relative">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  activeReport?.status === "escalated" || activeReport?.status === "doctor_reviewing" || activeReport?.status === "decision_drafted"
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-200 text-slate-400"
                }`}>
                  {activeReport?.status === "escalated" || activeReport?.status === "doctor_reviewing" ? "✓" : "3"}
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white">Chuyển BS. Trần Hoàng Long hội chẩn</div>
                  <div className="text-[11px] text-slate-500">Bác sĩ xem xét phác đồ Osimertinib</div>
                </div>
              </div>
            </div>
          </div>

          <Link
            href="/patient/today"
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs text-center block shadow-xs"
          >
            Quay lại trang Hôm nay
          </Link>
        </section>
      ) : (
        /* Conversational Progressive Symptom Intake Form */
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Step 1: Main Symptom Selection */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Bác đang khó chịu điều gì hôm nay?
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {symptomChoices.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => handleSelectSymptom(c.id)}
                  className={`p-3 rounded-2xl text-left border transition-all ${
                    symptom === c.id
                      ? "border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/20"
                      : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                  }`}
                >
                  <div className="font-bold text-xs">{c.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{c.desc}</div>
                </button>
              ))}
            </div>
          </section>

          {/* Step 2A: Progressive Dyspnea Pathway */}
          {symptom === "dyspnea" && (
            <section className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 animate-fadeIn">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  1. Bác thấy khó thở khi nào?
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { id: "exertion_heavy", label: "Khi vận động mạnh" },
                    { id: "walking", label: "Khi đi lại thường" },
                    { id: "at_rest", label: "Ngay cả khi nghỉ" },
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setDyspneaTrigger(item.id as DyspneaTrigger)}
                      className={`p-2.5 rounded-xl text-center border font-semibold text-xs transition-all ${
                        dyspneaTrigger === item.id
                          ? "border-rose-500 bg-rose-50 dark:bg-rose-950 text-rose-900 dark:text-rose-200 ring-2 ring-rose-500/20"
                          : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  2. Mức độ so với hôm qua?
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { id: "better", label: "Đỡ hơn" },
                    { id: "same", label: "Như cũ" },
                    { id: "worse", label: "Nặng hơn" },
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setProgression(item.id as Progression)}
                      className={`p-2.5 rounded-xl text-center border font-semibold text-xs transition-all ${
                        progression === item.id
                          ? "border-rose-500 bg-rose-50 dark:bg-rose-950 text-rose-900 dark:text-rose-200 ring-2 ring-rose-500/20"
                          : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  3. Chỉ số đo tại nhà hôm nay (Nếu có máy đo)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-1">
                    <span className="text-[11px] text-slate-500 block">Độ bão hòa oxy SpO2 (%)</span>
                    <input
                      type="number"
                      value={spo2}
                      onChange={(e) => setSpo2(e.target.value === "" ? "" : Number(e.target.value))}
                      min={60}
                      max={100}
                      className="w-full text-lg font-bold text-slate-900 dark:text-white bg-transparent focus:outline-none"
                    />
                    <span className="text-[10px] text-rose-600 font-semibold block">Mức 91% là giảm oxy</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-1">
                    <span className="text-[11px] text-slate-500 block">Thân nhiệt (°C)</span>
                    <input
                      type="number"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value === "" ? "" : Number(e.target.value))}
                      min={35}
                      max={42}
                      className="w-full text-lg font-bold text-slate-900 dark:text-white bg-transparent focus:outline-none"
                    />
                    <span className="text-[10px] text-amber-600 font-semibold block">38.1°C là sốt nhẹ</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 block">
                  Mô tả thêm cảm giác của bác:
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </section>
          )}

          {/* Step 2B: Progressive Diarrhea Pathway */}
          {symptom === "diarrhea" && (
            <section className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 animate-fadeIn">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Số lần đi ngoài phân lỏng trong 24 giờ qua:
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={diarrheaEpisodes}
                    onChange={(e) => setDiarrheaEpisodes(Number(e.target.value))}
                    min={1}
                    max={30}
                    className="w-24 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-base font-bold text-center text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-300">lần / ngày (≥ 4 lần là Độc tính độ 2)</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Bác có bị sốt hoặc đau quặn bụng không?
                </label>
                <div className="flex gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setFever(!fever)}
                    className={`p-2.5 rounded-xl border font-semibold ${
                      fever ? "border-amber-500 bg-amber-50 dark:bg-amber-950 text-amber-900 dark:text-amber-200" : "border-slate-200 dark:border-slate-700 text-slate-600"
                    }`}
                  >
                    {fever ? "✓ Có sốt / gai rét" : "Không sốt"}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 block">
                  Ghi chú thêm:
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Bác đang uống bù nước Oresol ra sao..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </section>
          )}

          {/* Step 2C: Generic other symptoms */}
          {symptom !== "dyspnea" && symptom !== "diarrhea" && (
            <section className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 animate-fadeIn">
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 block">
                  Mô tả chi tiết triệu chứng của bác:
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Vui lòng mô tả thời điểm xuất hiện và mức độ khó chịu..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </section>
          )}

          {isUrgent && (
            <section className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs space-y-2 animate-fadeIn">
              <div className="flex items-center gap-2 font-bold text-rose-900 dark:text-rose-200">
                <AlertTriangleIcon size={16} className="text-rose-600" />
                <span>Bác cần được đội ngũ y tế đánh giá sớm</span>
              </div>
              <p className="text-[11px] text-rose-800 dark:text-rose-300 leading-relaxed">
                Triệu chứng khó thở khi nghỉ kèm chỉ số SpO2 91% cần được Bác sĩ Long và Điều dưỡng Mai xem xét ngay để đảm bảo an toàn cho phác đồ điều trị.
              </p>
            </section>
          )}

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-500 leading-relaxed">
            * Nếu bác cảm thấy khó thở dữ dội, tím tái môi đầu chi hoặc đau thắt ngực dữ dội, vui lòng gọi cấp cứu 115 hoặc đến ngay Bệnh viện K.
          </div>

          <button
            type="submit"
            disabled={isMutating}
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <HeartPulseIcon size={16} />
            <span>{isMutating ? "Đang gửi..." : "Gửi cho đội chăm sóc"}</span>
          </button>
        </form>
      )}
    </div>
  );
}
