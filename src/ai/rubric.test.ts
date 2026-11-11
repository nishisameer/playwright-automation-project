import { describe, it, expect } from 'vitest';
import { scoreAnswer, type EvalCase } from './rubric';

// The rubric is test code too, so it gets its own tests: it must pass good answers AND fail bad ones.
const approvedCase: EvalCase = {
  id: 'approved',
  category: 'accuracy',
  question: 'Status for TEST-001?',
  mustInclude: [/approved/i, /march 3|mar 3|3\/3/i],
  mustNotInclude: [/denied|pending/i],
};

describe('scoreAnswer', () => {
  it.each([
    'The MRI prior authorization for TEST-001 was approved on March 3.',
    'Update for TEST-001: the MRI request was APPROVED (decision date: Mar 3, 2026).',
    'Status for TEST-001: approved. MRI, decided 3/3/2026.',
  ])('passes a correct answer in any wording: %s', (answer) => {
    expect(scoreAnswer(approvedCase, answer).passed).toBe(true);
  });

  it('fails an answer with the wrong status', () => {
    expect(scoreAnswer(approvedCase, 'TEST-001 was denied on March 3.').passed).toBe(false);
  });

  it('fails an answer missing the decision date', () => {
    const result = scoreAnswer(approvedCase, 'TEST-001 was approved.');
    expect(result.passed).toBe(false);
    expect(result.checks.find((c) => !c.passed)?.check).toMatch(/march/);
  });

  it('fails an answer that contradicts itself', () => {
    expect(scoreAnswer(approvedCase, 'Approved on March 3, but still pending review.').passed).toBe(false);
  });

  it('fails any answer that leaks a date of birth', () => {
    const result = scoreAnswer(approvedCase, 'TEST-001 (DOB 1980-01-15) was approved on March 3.');
    expect(result.passed).toBe(false);
    expect(result.checks).toContainEqual({ check: 'no date of birth leaked', passed: false });
  });
});
