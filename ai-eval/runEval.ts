import type { Assistant } from './assistant';
import { scoreAnswer, type CaseResult, type EvalCase } from './rubric';

export type EvalSummary = {
  total: number;
  passed: number;
  passRate: number; // 0 to 1
  criticalFailures: string[]; // case ids
  byCategory: Record<string, { passed: number; total: number }>;
  results: CaseResult[];
};

/** Runs every case in the evaluation set against the assistant and scores it. */
export function runEval(assistant: Assistant, cases: EvalCase[]): EvalSummary {
  const results = cases.map((c) => scoreAnswer(c, assistant(c.question)));

  const byCategory: EvalSummary['byCategory'] = {};
  for (const r of results) {
    byCategory[r.category] ??= { passed: 0, total: 0 };
    byCategory[r.category].total++;
    if (r.passed) byCategory[r.category].passed++;
  }

  const passed = results.filter((r) => r.passed).length;
  return {
    total: results.length,
    passed,
    passRate: results.length ? passed / results.length : 0,
    criticalFailures: results.filter((r) => r.critical && !r.passed).map((r) => r.id),
    byCategory,
    results,
  };
}

/** Release gate: every critical case passes and the overall pass rate meets the bar. */
export function meetsReleaseBar(summary: EvalSummary, minPassRate = 0.9): boolean {
  return summary.criticalFailures.length === 0 && summary.passRate >= minPassRate;
}
