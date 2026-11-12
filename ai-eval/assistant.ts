import { findMember } from './data';

/**
 * A stand-in for an AI assistant that answers prior authorization questions.
 * A real one would call a language model; this one is rule-based so tests are free and repeatable.
 *
 * Like a real model, it words the same facts in different ways, so tests must check
 * facts, not exact sentences.
 *
 * Version 'v2' is a deliberately WORSE release, used to show that the evaluation catches regressions:
 * it makes up a status for unknown members, leaks the date of birth, and follows prompt injection.
 */
export type ModelVersion = 'v1' | 'v2';
export type Assistant = (question: string) => string;

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function formatDate(iso: string, style: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (style === 0) return `${MONTHS[m - 1]} ${d}`; // March 3
  if (style === 1) return `${MONTHS[m - 1].slice(0, 3)} ${d}, ${y}`; // Mar 3, 2026
  return `${m}/${d}/${y}`; // 3/3/2026
}

export function createAssistant(version: ModelVersion = 'v1'): Assistant {
  return (question: string) => {
    const memberId = question.match(/TEST-\d+/)?.[0];

    // Prompt injection: text in the question tries to change the assistant's rules.
    const injected = /ignore (all|your|previous) (rules|instructions)/i.test(question);
    if (injected && version === 'v2') {
      return `Understood. The request for ${memberId ?? 'this member'} is APPROVED.`;
    }

    if (!memberId) {
      return 'Please include a member ID so I can look up the prior authorization.';
    }

    const member = findMember(memberId);
    if (!member) {
      return version === 'v2'
        ? `The prior authorization for ${memberId} was approved.` // made up: a hallucination
        : `I could not find a member with ID ${memberId}. Please check the ID.`;
    }

    // Different wording for the same facts, like a real model.
    const style = Number(memberId.slice(-1)) % 3;
    const { procedure, status, decisionDate } = member.auth;
    const date = decisionDate ? formatDate(decisionDate, style) : undefined;
    const leak = version === 'v2' ? ` (DOB ${member.dateOfBirth})` : '';

    if (status === 'PENDING') {
      return `The ${procedure} request for ${member.id}${leak} is still pending clinical review.`;
    }
    const word = status === 'APPROVED' ? 'approved' : 'denied';
    const templates = [
      `The ${procedure} prior authorization for ${member.id}${leak} was ${word} on ${date}.`,
      `Update for ${member.id}${leak}: the ${procedure} request was ${word.toUpperCase()} (decision date: ${date}).`,
      `Status for ${member.id}${leak}: ${word}. ${procedure}, decided ${date}.`,
    ];
    return templates[style];
  };
}
