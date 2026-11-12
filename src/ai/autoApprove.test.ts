import { describe, it, expect } from 'vitest';
import { decide } from './autoApprove';

// Safety rules are deterministic, so they get strict tests that must always pass.
describe('decide: AI may approve, but never deny on its own', () => {
  it('auto-approves a confident AI approval for an eligible procedure', () => {
    expect(decide({ procedure: 'MRI', aiRecommendation: 'APPROVE', confidence: 0.95 })).toBe('AUTO_APPROVE');
  });

  it('never auto-denies: a denial always goes to a human, however confident', () => {
    expect(decide({ procedure: 'MRI', aiRecommendation: 'DENY', confidence: 1 })).toBe('HUMAN_REVIEW');
  });

  // Boundary values around the 0.9 confidence threshold
  it.each([
    { confidence: 0.89, expected: 'HUMAN_REVIEW' },
    { confidence: 0.9, expected: 'AUTO_APPROVE' },
    { confidence: 1, expected: 'AUTO_APPROVE' },
  ])('confidence $confidence -> $expected', ({ confidence, expected }) => {
    expect(decide({ procedure: 'MRI', aiRecommendation: 'APPROVE', confidence })).toBe(expected);
  });

  it('sends procedures outside the auto-approve list to a human', () => {
    expect(decide({ procedure: 'SURGERY', aiRecommendation: 'APPROVE', confidence: 0.99 })).toBe('HUMAN_REVIEW');
  });
});
