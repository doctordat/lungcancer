import { z } from "zod";
import { symptomKindSchema, triagePrioritySchema } from "./schemas";

export const DEMO_TRIAGE_RULE_VERSION = "demo-2026-09-10.1";

export const triageInputSchema = z.object({
  symptom: symptomKindSchema,
  diarrheaEpisodes: z.number().int().min(0).max(99),
  fever: z.boolean(),
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
  ].filter((trigger): trigger is string => trigger !== null);

  if (urgentTriggers.length > 0) {
    return {
      priority: "urgent",
      ruleVersion: DEMO_TRIAGE_RULE_VERSION,
      triggers: urgentTriggers,
      explanation: "Demo rule: dyspnea or chest pain requires urgent clinical escalation.",
      clinicallyValidated: false,
    };
  }

  const reviewTriggers = [
    value.diarrheaEpisodes >= 4 ? "diarrhea_episodes:gte_4" : null,
    value.fever ? "fever:true" : null,
  ].filter((trigger): trigger is string => trigger !== null);

  if (reviewTriggers.length > 0) {
    return {
      priority: "review_today",
      ruleVersion: DEMO_TRIAGE_RULE_VERSION,
      triggers: reviewTriggers,
      explanation: "Demo rule: fever or at least four diarrhea episodes needs review today.",
      clinicallyValidated: false,
    };
  }

  return {
    priority: "stable",
    ruleVersion: DEMO_TRIAGE_RULE_VERSION,
    triggers: [],
    explanation: "Demo rule: no urgent or same-day trigger was detected.",
    clinicallyValidated: false,
  };
}
