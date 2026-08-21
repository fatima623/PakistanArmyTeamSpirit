// English — source of truth for the participant portal's core surfaces.
// Other locales mirror this shape exactly (enforced via `typeof`).

export const core = {
  common: {
    back: "Back",
    next: "Next",
    backToDashboard: "Back to dashboard",
    language: "Language",
    selectLanguage: "Select language",
    loadingTitle: "Participant dashboard",
    loadingDesc: "Loading participant actions and status panels.",
    toasts: {
      genericError: "Something went wrong. Please try again.",
      saveSuccess: "Changes saved successfully",
      validationError: "Please check the form for errors.",
    },
  },

  // Browser-tab / SEO titles, one per route (localized page metadata).
  meta: {
    tour: "Site Tour",
    home: "Home",
    announcements: "Announcements",
    awards: "Awards & Recognition",
    login: "Log in",
    register: "Register",
    exerciseContour: "Exercise Contour",
    gallery: "Gallery",
    international: "International Participation",
    keyDates: "Key Dates",
    privacy: "Privacy Policy",
    dashboard: "Dashboard",
    unitInfo: "Update unit information",
    hostInfo: "Host Information",
    journey: "Registration Journey",
    support: "Support",
    supportTicket: "Support ticket",
    confirmParticipation: "Confirm Participation",
  },

  nav: {
    ariaLabel: "Participant portal",
    portalName: "PATS Portal",
    participant: "Participant",
    menu: "Menu",
    done: "Done",
    logout: "Log out",
    dashboard: "Dashboard",
    tour: "Tour",
    support: "Support",
    journeyComplete: "Journey complete",
  },

  dashboard: {
    welcomeBack: "Welcome back",
    unitNotRegistered: "Unit not registered",
    allStagesComplete: "All stages complete",
    membersCount: (n: number) => `${n} team member${n === 1 ? "" : "s"}`,
    scheduleEyebrow: "Schedule",
    dataEntryPeriods: "Data entry periods",
    dataEntryDesc: "Scheduled windows for submitting your registration data.",
    noPeriods: "No periods scheduled yet.",
    deadlinesEyebrow: "Deadlines",
    timeline: "Timeline",
    updatesEyebrow: "Updates",
    latestNews: "Latest updates",
    noNews: "No updates yet.",
    timelinePanel: {
      closed: "Closed",
      dueToday: "Due today",
      daysLeft: (n: number) => `${n} day${n === 1 ? "" : "s"} left`,
      deadlines: "Deadlines",
      noDeadlines: "No deadlines have been set yet.",
      keyDates: "Key dates",
      noKeyDates: "No key dates published yet.",
      deadlineLabels: {
        registration: "Registration deadline",
      },
    },
  },

  workflowPanel: {
    registrationProgress: "Registration progress",
    ariaLabel: "Registration workflow",
    progressAria: "Workflow progress",
    countComplete: (done: number, total: number) => `${done} of ${total} complete`,
  },

  statusBar: {
    inProgressTitle: "Registration in progress",
    inProgressText:
      "Work through each step below. The Sports Directorate (SD) approves your registration once every step is complete.",
    underReviewTitle: "Registration completed",
    underReviewText:
      "Your registration has been completed — every step is submitted. The Sports Directorate (SD) will now verify it, and you will receive a confirmation email once it is approved.",
    confirmedTitle: "Approved — you're cleared for PATS 2026",
    confirmedTextWithDates: (dates: string) =>
      `Your registration is approved by the SD and your place is confirmed. Scheduled: ${dates}.`,
    confirmedText:
      "Your registration is approved by the SD and your place is confirmed.",
    returnedTitle: "Returned for correction",
    approvedOn: (date: string) => `Approved ${date}`,
    continueRegistration: "Continue registration",
  },

  registration: {
    /** Keyed by the `ApplicationStatus` enum value. */
    statuses: {
      PENDING: "Pending",
      UNDER_REVIEW: "Under Review",
      APPROVED: "Approved",
      REJECTED: "Rejected",
      RETURNED: "Returned for Correction",
    },
    profileEyebrow: "Profile",
    title: "Registration details",
    name: "Name",
    unit: "Unit",
    email: "Email",
    rank: "Rank",
    dateRegistered: "Date registered",
    countryOfApplication: "Country of Application",
    nationality: "Nationality",
    branchFormation: "Branch / formation",
  },

  journey: {
    suspended:
      "Your account has been suspended. Contact PATS administration for assistance.",
    headers: {
      confirmation: {
        eyebrow: "",
        title: "Confirm Participation",
        subtitle: "Confirm your team's availability to take part in PATS 2026.",
      },
      unitInfo: {
        eyebrow: "Registration",
        title: "Unit Information",
        subtitle:
          "Provide your unit and Commanding Officer details. Saving unlocks team registration.",
      },
      verification: {
        eyebrow: "",
        title: "Registration Approval",
        subtitle:
          "The Sports Directorate (SD) approves your registration once every step is complete.",
      },
      roster: {
        eyebrow: "Team registration",
        title: "Team Members",
        subtitle:
          "Add your team members below. After saving, mark the roster complete to unlock flight details.",
      },
      flights: {
        eyebrow: "",
        title: "Flight Details",
        subtitle:
          "Submit your team's travel information and passport / ticket documents in a single submission.",
      },
      hostInfo: {
        eyebrow: "",
        title: "Host Information",
        subtitle: "Hosting details published by the organizers for your team.",
      },
    },
    banners: {
      participationConfirmed: "Participation confirmed.",
      confirmedOnSub: (date: string, unitName: string | null) =>
        `Confirmed on ${date}${unitName ? ` for ${unitName}` : ""}. This step is read-only.`,
      verifiedBySd: "Registration verified by the Sports Directorate (SD).",
      verifiedBySdSub:
        "Your registration details are read-only below. Continue to the next step.",
      registrationVerification: "Registration verification",
      messageFromSd: "Message from the SD:",
      unitInfoSaved: "Unit information saved.",
      unitInfoSavedSub: (date: string) =>
        `Recorded on ${date}. You can update it until your registration is approved.`,
      flightsSubmitted: "Flight details submitted.",
      flightsSubmittedSub:
        "Your registration is now with the Sports Directorate (SD) for approval.",
      awaitingApproval: "Awaiting SD approval",
      awaitingApprovalSub:
        "Every step is complete. The Sports Directorate will review and approve your registration.",
      approvalLocked:
        "Complete confirmation, unit information, team members and flight details to send your registration for approval.",
      teamRegistered: "Team registered.",
      teamRegisteredSub: (date: string) =>
        `Registered on ${date}. Fill in your member roster below.`,
      rosterCompleted: "Roster completed.",
      rosterCompletedSub: (count: number, date: string) =>
        `${count} member${count === 1 ? "" : "s"} confirmed on ${date}. The roster is read-only unless reopened by the administration.`,
      hostInfoTitle: "Host Information",
      hostInfoAvailable:
        "Hosting details for your team have been published by the organizers.",
      hostInfoLocked:
        "Hosting details become available here once your flight details are finalized and the organizers publish them.",
      openHostInfo: "Open Host Information",
    },
    wizard: {
      stepsAria: "Registration steps",
      lockedTitle: "Locked — complete the previous steps first",
      stepXofY: (current: number, total: number, activeLabel: string) =>
        `Step ${current} of ${total}${activeLabel ? ` — ${activeLabel}` : ""}`,
      nextLockedTitle: "Complete this step to unlock the next one",
      finalStep: "Final step",
      finalStepTitle: "This is the final step",
    },
  },

  confirm: {
    dateLocale: "en-GB",
    actionRequired: "Action required",
    title: "Confirm your participation",
    description:
      "Before entering the Participant Dashboard, please confirm whether your team will be available to participate in the exercise. Confirming grants access to the next registration stages. Rejecting signs you out, you may log back in and confirm any time before the deadline below.",
    previouslyDeclined:
      "You previously rejected the registration. You can still confirm before the deadline expires.",
    confirmationDeadline: "Confirmation deadline",
    deadlineExpired:
      "The confirmation deadline has passed. Confirmation is no longer possible. Please contact the organizers for assistance.",
    days: "Days",
    hours: "Hours",
    min: "Min",
    sec: "Sec",
    remaining: "remaining",
    timeRemainingAria: "Time remaining to confirm",
    toBeAnnounced: "To be announced by the organizers.",
    rejectPrompt:
      "Reject registration and sign out? You can log back in and confirm later, as long as the deadline has not expired.",
    yesReject: "Yes, reject and sign out",
    goBack: "Go back",
    confirm: "Available",
    reject: "Not Available",
    signOut: "Sign out",
    confirmTitleAttr: "Confirm your registration",
    deadlinePassedAttr: "The confirmation deadline has passed",
    footer:
      "Your decision is recorded with a timestamp for the organizing staff. Need help? Contact support from the login page.",
    toastConfirmed: "Registration confirmed — welcome aboard!",
    toastRejected: "Registration rejected. Signing you out…",
  },

  hostInfo: {
    title: "Host Information",
    subtitleLocked: "Finalized hosting and arrival information from the organizers.",
    subtitle: "Finalized hosting, team, and arrival information — read-only.",
    notAvailableTitle: "Not available yet",
    notAvailableText:
      "The Host Information section becomes visible after your flight details have been reviewed and finalized by the administration and the organizers publish the hosting information.",
    participatingCountries: "Participating countries",
    registeredTeams: "Registered teams",
    yourFinalizedTravelers: "Your finalized travelers",
    hostingArrivalInfo: "Hosting & arrival information",
    countryWiseTeamNumbers: "Country-wise team numbers",
    sNo: "S.No",
    country: "Country",
    teams: "Teams",
    noRegisteredTeams: "No registered teams yet.",
    unspecified: "Unspecified",
    yourTeamWithUnit: (unit: string) => `Your team — ${unit}`,
    yourTeam: "Your team",
    serialNumber: "Serial Number",
    rank: "Rank",
    fullName: "Full Name",
    gender: "Gender",
    finalizedFlightInfo: "Finalized flight information",
    traveler: "Traveler",
    passengerName: "Passenger Name",
    passportNo: "Passport No.",
    documents: "Documents",
    noFlightRecords: "No flight records.",
    passport: "Passport",
    ticket: "Ticket (out)",
    returnTicket: "Return ticket",
    readOnlyNote:
      "This information is read-only. Contact the organizers for any corrections.",
  },
};
