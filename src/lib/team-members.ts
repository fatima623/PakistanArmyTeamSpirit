/** Plain, client-safe shape of a team member returned by the API. */
export type TeamMemberRecord = {
  id: string;
  fullName: string;
  serviceNumber: string;
  serviceArm: string;
  gender: string;
};

/** Prisma select that yields exactly a {@link TeamMemberRecord}. */
export const teamMemberSelect = {
  id: true,
  fullName: true,
  serviceNumber: true,
  serviceArm: true,
  gender: true,
} as const;
