// Localized strings for the guided registration workflow stages.
// `deriveWorkflowStages` consumes a WorkflowStrings object so the stage
// labels/subs come out already translated. English is the default.

export interface WorkflowStrings {
  label: {
    confirmation: string;
    verification: string;
    payment: string;
    teamRegistration: string;
    roster: string;
    flights: string;
    hostInfo: string;
  };
  sub: {
    // confirmation
    confirmed: string;
    deadlineExpired: string;
    actionRequired: string;
    confirmBy: (date: string) => string;
    // shared
    locked: string;
    returnedForCorrection: string;
    // verification
    approvedBySd: string;
    rejected: string;
    underReviewBySd: string;
    pendingSdVerification: string;
    // payment
    verifiedByMt: string;
    underReviewByMt: string;
    proofRejected: string;
    paymentRequired: string;
    // team registration
    teamRegistered: string;
    opensOn: (date: string) => string;
    notYetOpen: string;
    windowClosed: string;
    openUntil: (date: string) => string;
    windowOpen: string;
    // roster
    membersConfirmed: (count: number) => string;
    membersAdded: (count: number, limit: number) => string;
    // flights
    finalized: string;
    deadlinePassedLocked: string;
    submitBy: (date: string) => string;
    provideTravelDocs: string;
    // host info
    available: string;
    awaitingPublication: string;
  };
  formatDate: (d: Date) => string;
}

export const enWorkflow: WorkflowStrings = {
  label: {
    confirmation: "Confirm Participation",
    verification: "Registration Verification",
    payment: "Payment",
    teamRegistration: "Team Registration",
    roster: "Team Members",
    flights: "Flight Details",
    hostInfo: "Host Information",
  },
  sub: {
    confirmed: "Confirmed",
    deadlineExpired: "Deadline expired",
    actionRequired: "Action required",
    confirmBy: (date) => `Confirm by ${date}`,
    locked: "Locked",
    returnedForCorrection: "Returned for correction",
    approvedBySd: "Approved by SD",
    rejected: "Rejected",
    underReviewBySd: "Under review by SD",
    pendingSdVerification: "Pending SD verification",
    verifiedByMt: "Verified by MT",
    underReviewByMt: "Under review by MT",
    proofRejected: "Proof rejected",
    paymentRequired: "Payment required",
    teamRegistered: "Team registered",
    opensOn: (date) => `Opens ${date}`,
    notYetOpen: "Not yet open",
    windowClosed: "Window closed",
    openUntil: (date) => `Open until ${date}`,
    windowOpen: "Window open",
    membersConfirmed: (count) => `${count} member${count === 1 ? "" : "s"} confirmed`,
    membersAdded: (count, limit) => `${count} of ${limit} added`,
    finalized: "Finalized by administration",
    deadlinePassedLocked: "Deadline passed — locked",
    submitBy: (date) => `Submit by ${date}`,
    provideTravelDocs: "Provide travel documents",
    available: "Available",
    awaitingPublication: "Awaiting publication",
  },
  formatDate: (d) =>
    d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
};
