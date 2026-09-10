import { z } from "zod";
import { symptomKindSchema, triagePrioritySchema } from "./schemas";

export const DEMO_TRIAGE_RULE_VERSION = "demo-2026-09-10.1";

export const triageInputSchema = z.object({
  symptom: symptomKindSchema,
  diarrheaEpisodes: z.number().int().min(0).max(99).default(0),
  fever: z.boolean().default(false),
  spo2: z.number().min(50).max(100).nullable().optional(),
  temperature: z.number().min(34).max(43).nullable().optional(),
  dyspneaTrigger: z.enum(["exertion_heavy", "walking", "at_rest"]).nullable().optional(),
  progression: z.enum(["better", "same", "worse"]).nullable().optional(),
});

export const triageResultSchema = z.object({
  priority: triagePrioritySchema,
  ruleVersion: z.literal(DEMO_TRIAGE_RULE_VERSION),
  triggers: z.array(z.string()),
  explanation: z.string(),
  clinicallyValidated: z.literal(false),
});

export type TriageInput = z.infer<typeof triageInputSchema>;
export type TriageResult = z.infer<typeof triageResultSchema>;

export function assessDemoTriage(input: TriageInput): TriageResult {
  const value = triageInputSchema.parse(input);
  const urgentTriggers = [
    value.symptom === "dyspnea" ? "symptom:dyspnea" : null,
    value.symptom === "chest_pain" ? "symptom:chest_pain" : null,
    value.dyspneaTrigger === "at_rest" ? "dyspnea:at_rest" : null,
    value.spo2 !== null && value.spo2 !== undefined && value.spo2 <= 92 ? `spo2_hypoxia:${value.spo2}%` : null,
  ].filter((trigger): trigger is string => trigger !== null);

  if (urgentTriggers.length > 0) {
    return {
      priority: "urgent",
      ruleVersion: DEMO_TRIAGE_RULE_VERSION,
      triggers: urgentTriggers,
      explanation: "Triệu chứng hô hấp / SpO2 giảm / Khó thở khi nghỉ ngơi cần bác sĩ đánh giá khẩn cấp.",
      clinicallyValidated: false,
    };
  }

  const reviewTriggers = [
    value.diarrheaEpisodes >= 4 ? "diarrhea_episodes:gte_4" : null,
    value.fever || (value.temperature !== null && value.temperature !== undefined && value.temperature >= 38.0) ? "fever:true" : null,
    value.symptom === "pain" ? "symptom:pain" : null,
    value.symptom === "rash" ? "symptom:rash" : null,
  ].filter((trigger): trigger is string => trigger !== null);

  if (reviewTriggers.length > 0) {
    return {
      priority: "review_today",
      ruleVersion: DEMO_TRIAGE_RULE_VERSION,
      triggers: reviewTriggers,
      explanation: "Triệu chứng cần điều dưỡng và bác sĩ theo dõi xử trí trong ngày.",
      clinicallyValidated: false,
    };
  }

  return {
    priority: "stable",
    ruleVersion: DEMO_TRIAGE_RULE_VERSION,
    triggers: [],
    explanation: "Không phát hiện dấu hiệu khẩn cấp, tiếp tục phác đồ theo dõi định kỳ.",
    clinicallyValidated: false,
  };
}
