"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { ClinicalStateBundle } from "@/server/store";
import type { SymptomKind, DyspneaTrigger, Progression } from "@/domain/schemas";

interface ClinicalContextType {
  state: ClinicalStateBundle | null;
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
  refreshState: () => Promise<void>;
  submitReport: (input: {
    symptom: SymptomKind;
    dyspneaTrigger?: DyspneaTrigger;
    progression?: Progression;
    spo2?: number | null;
    temperature?: number | null;
    diarrheaEpisodes?: number;
    fever?: boolean;
    notes?: string;
  }) => Promise<string>;
  validateReport: (input: {
    reportId: string;
    expectedVersion: number;
    repeatSpo2?: number | null;
    respiratoryRate?: number | null;
    temperature?: number | null;
    dyspneaSeverity?: "none" | "mild" | "moderate" | "at_rest";
    cough?: boolean;
    chestPain?: boolean;
    syncope?: boolean;
    cyanosis?: boolean;
    onsetProgression?: string;
    escalationRequired: boolean;
    context: string;
  }) => Promise<void>;
  signOffDecision: (input: {
    reportId: string;
    expectedVersion: number;
    outcome: "care_plan_update" | "no_plan_change" | "needs_information";
    rationale: string;
    differentials?: string[];
    investigationsOrdered?: string[];
    clinicalActions?: string;
    patientInstructionsPlain?: string;
    monitoring?: string;
    followUpAssignedTo?: string;
    followUpTime?: string;
    doctorName?: string;
  }) => Promise<void>;
  acknowledgeCarePlan: (input: { carePlanVersionId: string; expectedVersion: number }) => Promise<void>;
  resetState: () => Promise<void>;
}

const ClinicalContext = createContext<ClinicalContextType | null>(null);

export function ClinicalProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ClinicalStateBundle | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMutating, setIsMutating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch("/api/state", { cache: "no-store" });
      const json = await res.json();
      if (json.success && json.data) {
        setState(json.data);
      } else {
        setError(json.error || "Không thể tải dữ liệu lâm sàng");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi kết nối máy chủ");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch("/api/state", { cache: "no-store" });
        const json = await res.json();
        if (mounted && json.success && json.data) {
          setState(json.data);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Lỗi kết nối máy chủ");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };
    load();
    const interval = setInterval(() => {
      fetchState();
    }, 2000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [fetchState]);

  const submitReport = async (input: {
    symptom: SymptomKind;
    dyspneaTrigger?: DyspneaTrigger;
    progression?: Progression;
    spo2?: number | null;
    temperature?: number | null;
    diarrheaEpisodes?: number;
    fever?: boolean;
    notes?: string;
  }): Promise<string> => {
    setIsMutating(true);
    setError(null);
    try {
      const res = await fetch("/api/patient/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "Gửi báo cáo thất bại");
      }
      setState(json.data);
      return json.reportId;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Lỗi gửi báo cáo";
      setError(msg);
      throw err;
    } finally {
      setIsMutating(false);
    }
  };

  const validateReport = async (input: {
    reportId: string;
    expectedVersion: number;
    repeatSpo2?: number | null;
    respiratoryRate?: number | null;
    temperature?: number | null;
    dyspneaSeverity?: "none" | "mild" | "moderate" | "at_rest";
    cough?: boolean;
    chestPain?: boolean;
    syncope?: boolean;
    cyanosis?: boolean;
    onsetProgression?: string;
    escalationRequired: boolean;
    context: string;
  }): Promise<void> => {
    setIsMutating(true);
    setError(null);
    try {
      const res = await fetch("/api/nurse/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "Xác minh điều dưỡng thất bại");
      }
      setState(json.data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Lỗi xác minh";
      setError(msg);
      throw err;
    } finally {
      setIsMutating(false);
    }
  };

  const signOffDecision = async (input: {
    reportId: string;
    expectedVersion: number;
    outcome: "care_plan_update" | "no_plan_change" | "needs_information";
    rationale: string;
    differentials?: string[];
    investigationsOrdered?: string[];
    clinicalActions?: string;
    patientInstructionsPlain?: string;
    monitoring?: string;
    followUpAssignedTo?: string;
    followUpTime?: string;
    doctorName?: string;
  }): Promise<void> => {
    setIsMutating(true);
    setError(null);
    try {
      const res = await fetch("/api/doctor/signoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "Ký duyệt bác sĩ thất bại");
      }
      setState(json.data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Lỗi ký duyệt";
      setError(msg);
      throw err;
    } finally {
      setIsMutating(false);
    }
  };

  const acknowledgeCarePlan = async (input: {
    carePlanVersionId: string;
    expectedVersion: number;
  }): Promise<void> => {
    setIsMutating(true);
    setError(null);
    try {
      const res = await fetch("/api/patient/acknowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "Xác nhận thất bại");
      }
      setState(json.data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Lỗi xác nhận";
      setError(msg);
      throw err;
    } finally {
      setIsMutating(false);
    }
  };

  const resetState = async (): Promise<void> => {
    setIsMutating(true);
    setError(null);
    try {
      const res = await fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setState(json.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khôi phục trạng thái");
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <ClinicalContext.Provider
      value={{
        state,
        isLoading,
        isMutating,
        error,
        refreshState: fetchState,
        submitReport,
        validateReport,
        signOffDecision,
        acknowledgeCarePlan,
        resetState,
      }}
    >
      {children}
    </ClinicalContext.Provider>
  );
}

export function useClinical() {
  const context = useContext(ClinicalContext);
  if (!context) {
    throw new Error("useClinical must be used within a ClinicalProvider");
  }
  return context;
}
