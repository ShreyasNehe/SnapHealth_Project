/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type UrgencyLevel = 'self-care' | 'see-doctor' | 'urgent-care' | 'er-now';

export interface PatientProfile {
  age: number;
  sex: 'Male' | 'Female' | 'Other';
  isPregnant: boolean;
  medications: string;
  allergies: string;
  chronicConditions: string[];
}

export interface AuditEntry {
  timestamp: string;
  action: string;
  reasoning: string;
  confidence: number;
}

export interface PainHeat {
  intensity: number; // 0-1
  radius: number; // for radial gradient
  type: 'nerve' | 'muscle' | 'organ';
}

export interface SymptomPin {
  id: string;
  zone: string;
  description: string;
  severity: number;
  daysAgo: number;
  trend: 'better' | 'same' | 'worse';
  x: number;
  y: number;
  imageUrl?: string; // base64 for Vision analysis
  visionAnalysis?: string; // result of Vision AI
  heatmap?: PainHeat; // semantic pain heatmap data
}

export interface Vitals {
  heartRate?: number;
  temperature?: number;
  tempUnit: 'C' | 'F';
  systolicBP?: number;
  diastolicBP?: number;
  o2Sat?: number;
}

export interface Differential {
  condition: string;
  probability: number;
  reasoning: string;
}

export interface TriageAnalysis {
  urgency: UrgencyLevel;
  urgency_reason: string;
  red_flags: string[];
  differentials: Differential[];
  recommended_next_steps: string[];
  medication_interactions: string[];
  specialist_referral: string | null;
  follow_up_window: string;
  pattern_note: string | null;
  // New features
  clinician_handover?: string;
  patient_guidance?: string;
  ai_doctor_care_plan?: string;
  medication_suggestions?: string[];
  audit_trail: AuditEntry[];
  grounded_reasoning?: string;
  vitals_anomaly_prediction?: string;
}

export interface Session {
  id: string;
  timestamp: string;
  profile: PatientProfile;
  symptoms: SymptomPin[];
  vitals: Vitals;
  analysis: TriageAnalysis;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
