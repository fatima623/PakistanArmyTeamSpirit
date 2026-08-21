// Localized strings for the guided registration workflow stages.
// `deriveWorkflowStages` consumes a WorkflowStrings object so the stage
// labels/subs come out already translated. English is the default.

export interface WorkflowStrings {
  label: {
    confirmation: string;
    unitInfo: string;
    roster: string;
    flights: string;
    verification: string;
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
    // unit information
    unitRecorded: string;
    provideUnitDetails: string;
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
    flightsSubmitted: string;
    deadlinePassedLocked: string;
    submitBy: (date: string) => string;
    provideTravelDocs: string;
    // verification (SD, last stage)
    approvedBySd: string;
    rejected: string;
    underReviewBySd: string;
    pendingSdVerification: string;
    completeStepsFirst: string;
    // host info
    available: string;
    awaitingPublication: string;
  };
  formatDate: (d: Date) => string;
}

export const enWorkflow: WorkflowStrings = {
  label: {
    confirmation: "Confirm Participation",
    unitInfo: "Unit Information",
    roster: "Team Members",
    flights: "Flight Details",
    verification: "Registration Approval",
    hostInfo: "Host Information",
  },
  sub: {
    confirmed: "Confirmed",
    deadlineExpired: "Deadline expired",
    actionRequired: "Action required",
    confirmBy: (date) => `Confirm by ${date}`,
    locked: "Locked",
    returnedForCorrection: "Returned for correction",
    unitRecorded: "Unit details recorded",
    provideUnitDetails: "Provide your unit details",
    teamRegistered: "Team registered",
    opensOn: (date) => `Opens ${date}`,
    notYetOpen: "Not yet open",
    windowClosed: "Window closed",
    openUntil: (date) => `Open until ${date}`,
    windowOpen: "Window open",
    membersConfirmed: (count) => `${count} member${count === 1 ? "" : "s"} confirmed`,
    membersAdded: (count, limit) => `${count} of ${limit} added`,
    finalized: "Finalized by administration",
    flightsSubmitted: "Submitted for approval",
    deadlinePassedLocked: "Deadline passed — locked",
    submitBy: (date) => `Submit by ${date}`,
    provideTravelDocs: "Provide travel documents",
    approvedBySd: "Approved by SD",
    rejected: "Rejected",
    underReviewBySd: "Under review by SD",
    pendingSdVerification: "Pending SD approval",
    completeStepsFirst: "Complete the steps above first",
    available: "Available",
    awaitingPublication: "Awaiting publication",
  },
  formatDate: (d) =>
    d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
};
