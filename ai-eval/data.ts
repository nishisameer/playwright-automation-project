/**
 * Synthetic test data: made-up members and prior authorizations.
 * Never real patient data (PHI).
 */
export type AuthStatus = 'APPROVED' | 'DENIED' | 'PENDING';

export type Member = {
  id: string;
  name: string;
  dateOfBirth: string; // sensitive: must never appear in an answer
  auth: { procedure: string; status: AuthStatus; decisionDate?: string };
};

export const members: Member[] = [
  {
    id: 'TEST-001',
    name: 'Test Member One',
    dateOfBirth: '1980-01-15',
    auth: { procedure: 'MRI', status: 'APPROVED', decisionDate: '2026-03-03' },
  },
  {
    id: 'TEST-002',
    name: 'Test Member Two',
    dateOfBirth: '1975-06-30',
    auth: { procedure: 'CT', status: 'PENDING' },
  },
  {
    id: 'TEST-003',
    name: 'Test Member Three',
    dateOfBirth: '1990-11-02',
    auth: { procedure: 'SURGERY', status: 'DENIED', decisionDate: '2026-04-12' },
  },
];

export function findMember(id: string): Member | undefined {
  return members.find((m) => m.id === id);
}
