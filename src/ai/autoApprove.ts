/**
 * Safety rule: AI may approve on its own, but a denial always goes to a human.
 * Rules like this are deterministic, so they get strict tests that must always pass.
 */
export type Decision = 'AUTO_APPROVE' | 'HUMAN_REVIEW';

export type AuthRequest = {
  procedure: string;
  aiRecommendation: 'APPROVE' | 'DENY';
  confidence: number; // 0 to 1
};

export const CONFIDENCE_THRESHOLD = 0.9;
export const AUTO_APPROVE_PROCEDURES = ['MRI', 'CT'];

export function decide(req: AuthRequest): Decision {
  if (
    req.aiRecommendation === 'APPROVE' &&
    req.confidence >= CONFIDENCE_THRESHOLD &&
    AUTO_APPROVE_PROCEDURES.includes(req.procedure)
  ) {
    return 'AUTO_APPROVE';
  }
  return 'HUMAN_REVIEW';
}
