// English — source of truth for shared public chrome: the marketing nav
// item labels and the login page. Other locales mirror this shape exactly.

export const publicSite = {
  loading: {
    title: "Public page",
    description: "Loading page content and public navigation.",
  },

  nav: {
    home: "Home",
    eventsDetail: "Events Detail",
    operations: "Operations",
    exerciseContour: "Exercise Contour",
    international: "International Participation",
    awards: "Awards",
    gallery: "Gallery",
    announcements: "Announcements",
    documents: "Documents",
    keyDates: "Key Dates",
    login: "Login",
  },

  gallery: {
    eyebrow: "Field archive",
    title: "Competition Gallery",
    subtitle:
      "Documentary archive of international PATS editions — delegations, ceremonies, and operational heritage.",
    allArchives: "All archives",
    photos: (count: number) => `${count} ${count === 1 ? "Photo" : "Photos"}`,
    // Hero meta-strip <dt> labels. Distinct from `eyebrow`/`allArchives`, which
    // are the hero kicker and the "show everything" filter chip respectively.
    metaPhotosLabel: "Photographs",
    metaYearsLabel: "Years covered",
    empty: "The gallery is being updated. Check back soon.",
    close: "Close",
    previous: "Previous",
    next: "Next",
  },

  announcements: {
    eyebrow: "Notices",
    title: "Announcements",
    subtitle:
      "Official notices, updates and coordination bulletins for the PATS competition.",
    latest: "Latest",
    countLabel: (count: number) =>
      `${count} ${count === 1 ? "notice" : "notices"} published`,
    readMore: "Read more",
    empty: "No announcements yet — please check back soon.",
    downloadPdf: "Download PDF",
    backToList: "Back to announcements",
  },

  /** Nav/site chrome affordances (aria labels, menu buttons). */
  chrome: {
    siteNav: "Site",
    mainNav: "Main navigation",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    brandHome: "PATS home",
    selectLanguage: "Select language",
  },

  /** Shared breadcrumb on inner page headers. */
  breadcrumb: {
    home: "Home",
    label: "Breadcrumb",
  },

  footer: {
    isprWebsite: "ISPR Website",
    registerNow: "Register now",
    contactUs: "Contact us",
    disclaimer:
      "Authorized use only. Official portal for PATS Competition participation.",
  },

  /** Per-page chrome (hero + section headings) for the marketing subpages. */
  pages: {
    awards: {
      heroEyebrow: "Honors registry",
      heroTitle: "Awards & recognition",
      heroSubtitle:
        "Teams are graded across all tactical events. Overall percentage determines medal tier and certificate of participation.",
      metaGold: "Gold",
      metaSilver: "Silver",
      metaBronze: "Bronze",
      showcaseLabel: "Honors registry",
      showcaseTitle: "Awards and honors",
      showcaseSubtitle:
        "Teams are graded across all tactical events. Overall percentage determines medal tier and certificate of participation.",
      tierGold: "Gold tier",
      tierSilver: "Silver tier",
      tierBronze: "Bronze tier",
      tierParticipation: "Participation",
      nameGold: "Gold Medal",
      nameSilver: "Silver Medal",
      nameBronze: "Bronze Medal",
      nameCertificate: "Certificate",
      rangeGold: "75% and above",
      rangeSilver: "65% to 74.99%",
      rangeBronze: "55% to 64.99%",
      rangeCertificate: "Below 55%",
      standingsTitle: "Current standings",
      standingsSubtitle:
        "Countries grouped by the medal category their overall percentage currently qualifies for.",
      standingsBadge: "Live telemetry",
      colMedal: "Medal category",
      colMinimum: "Minimum percentage required",
      colCountries: "Qualified countries",
      noTeams: "No teams in this band",
      standingsFootnote:
        "Illustrative standings for command review. Final results certified post-exercise.",
      teamEyebrow: "Team",
      teamTitle: "Team composition",
      teamDescription: "Official patrol structure for competition teams.",
      teamRoles: [
        { role: "Team Leader", qty: "1 × Captain / Subaltern" },
        { role: "Team 2nd In Command", qty: "1 × Sergeant / Equivalent" },
        { role: "Team NCO", qty: "1 × Corporal / Equivalent" },
        { role: "Light Machine Gun No.1", qty: "1 × Soldier / Equivalent" },
        { role: "Light Machine Gun No.2", qty: "1 × Soldier / Equivalent" },
        { role: "Signal Operator", qty: "1 × Soldier / Equivalent" },
        { role: "Rifleman", qty: "2 × Soldier / Equivalent" },
        {
          role: "Reserve",
          qty: "1 × Captain/Subaltern + 1 × Sergeant/Soldier",
        },
        { role: "Team Manager", qty: "1 × Major" },
      ],
    },
    international: {
      heroEyebrow: "Global partnerships",
      heroTitle: "International participation",
      heroSubtitle:
        "PATS brings together patrol teams from partner nations across multiple theatres.",
      metaSince: "Since",
      metaSinceValue: "2016",
      metaEditions: "Editions",
      metaEditionsValue: "8 international",
      metaReach: "Reach",
      metaReachValue: "Multi-theatre",
      mapEyebrow: "Theatre map",
      mapTitle: "Registered nations",
      mapDescription:
        "Countries with teams registered for the competition. Hover a highlighted nation to see its teams and the year they registered.",
      historyEyebrow: "History",
      historyTitle: "Edition timeline",
      historyDescription:
        "International participation across successive editions of the competition.",
      orientationEyebrow: "Orientation",
      orientationTitle: "Familiarization training",
      orientationDescription:
        "Pre-competition orientation for international teams before movement.",
      // CBRN and AFOS / ATGP are established military acronyms — kept verbatim
      // in every locale (a localized gloss may follow in parentheses).
      orientationModules: [
        "Firing / zeroing (competition weapons)",
        "Navigation / map reading",
        "Signal equipment",
        "CBRN",
        "AFOS / ATGP",
        "Area orientation",
      ],
      historyNarrative: [
        "Since 2005, PATS began as a navigation exercise emphasizing endurance and physical fitness.",
        "Lessons from counter-terrorism operations were incorporated as realistic events and battlefield scenarios — sub-tactical operations in conventional and sub-conventional environments.",
        "Growing interest from friendly countries led to International PATS (2016), sharing rich experiences and learning mutually.",
      ],
      mapAria: "World map of registered nations",
      mapCaption: (count: number) =>
        `${count} nation${count === 1 ? "" : "s"} represented — hover a highlighted country to see its teams.`,
      mapEmpty: "Registered nations will appear here as teams sign up.",
      mapCountryAria: (country: string, count: number) =>
        `${country}: ${count} registered team${count === 1 ? "" : "s"}`,
      tooltipMore: (count: number) => `+${count} more`,
    },
    keyDates: {
      heroEyebrow: "Schedule",
      heroTitle: "Key dates",
      heroSubtitle:
        "Important dates for the PATS Competition cycle. All times are Pakistan Standard Time (PKT) unless stated otherwise.",
      sectionEyebrow: "Timeline",
      sectionTitle: "Competition schedule",
      sectionDescription:
        "Official timeline for registration, exercise, and administrative milestones.",
      empty: "No key dates configured.",
    },
    privacy: {
      heroEyebrow: "Legal",
      heroTitle: "Privacy policy",
      body1: (siteName: string) =>
        `${siteName} is committed to protecting your personal information. This policy explains how we collect, use, and safeguard data submitted through this registration portal.`,
      body2: (siteName: string, org: string) =>
        `By registering on this website you consent to the processing of your data for the purposes of administering participation in ${siteName}, including communication with your unit and coordination with ${org}.`,
      body3Prefix: "For full policy details or to exercise your data rights, contact ",
      externalLink: "View external privacy policy",
    },
  },

  login: {
    hero: {
      eyebrow: "Participant portal",
      title: "Log in",
      subtitle: "Access your patrol dashboard and registration status.",
    },
    intro: {
      eyebrow: "Secure access",
      title: "Participant login",
      body: "Use your approved patrol credentials to access the participant dashboard, monitor fee status, and review key coordination steps before movement.",
      checklist: [
        "Approved patrol accounts only",
        "Payment and registration status tracking",
        "Direct access to participant actions and updates",
      ],
    },
    card: {
      eyebrow: "Participant access",
      title: "Sign in to continue",
      description: "Enter the email and password approved for your team account.",
      emailLabel: "Email address",
      passwordLabel: "Password",
      rememberHintOn: "This device will stay signed in for up to 30 days.",
      rememberHintOff: "Without Remember Me, your session expires after 24 hours.",
      rememberMe: "Remember Me",
      signingIn: "Signing in…",
      login: "Login",
      forgot: "Forgot Your Password?",
      footerPrefix: "If you have not registered please",
      footerLink: "click here to register your unit",
    },
    validation: {
      invalidEmail: "Enter a valid email address.",
      passwordRequired: "Password is required.",
      emailPasswordRequired: "Email and password are required.",
    },
    toasts: {
      registered:
        "Registration submitted. Check your inbox for the verification link before logging in.",
      passwordReset: "Password updated. Please sign in with your new password.",
      verified: "Email verified. You can sign in now.",
    },
  },

  forgotPassword: {
    hero: {
      eyebrow: "Account recovery",
      title: "Reset password",
      subtitle:
        "Enter your registered email and we will send a secure reset link.",
    },
    intro: {
      eyebrow: "Recovery access",
      title: "Password recovery",
      body: "Request a secure reset link for an approved participant account. Use the same registered email address tied to your team login.",
      checklist: [
        "Registered participant email required",
        "Secure reset link with limited validity",
        "Return to login after password update",
      ],
    },
    card: {
      eyebrow: "Reset request",
      title: "Send reset link",
      description:
        "Enter your participant email and we will send a secure reset link if the account exists.",
      emailLabel: "Email address",
      send: "Send reset link",
      sending: "Sending...",
      success:
        "Reset link sent to your email address. Please check your inbox.",
      back: "Back to login",
    },
    validation: {
      invalidEmail: "Enter a valid email address.",
      csrf: "Security check failed. Refresh and try again.",
      generic: "Something went wrong. Please try again.",
    },
  },

  resetPassword: {
    hero: {
      eyebrow: "Account recovery",
      title: "Set new password",
      subtitle: "Choose a strong password for your participant account.",
    },
    intro: {
      eyebrow: "Recovery access",
      title: "Set a new password",
      body: "Use a strong password that meets the portal security policy.",
      checklist: [
        "Reset links expire after 30 minutes",
        "Passwords are hashed with bcrypt before storage",
        "Reset links become invalid immediately after use",
      ],
    },
    card: {
      eyebrow: "Password reset",
      title: "Create a new password",
      policy:
        "At least 8 characters, including uppercase, lowercase, a number, and a special character.",
    },
    validating: "Validating reset link...",
    newPasswordLabel: "New password",
    confirmPasswordLabel: "Confirm password",
    strengthLabel: "Password strength",
    strength: {
      weak: "Weak",
      good: "Good",
      strong: "Strong",
    },
    checks: {
      length: "At least 8 characters",
      uppercase: "Uppercase letter",
      lowercase: "Lowercase letter",
      number: "Number",
      special: "Special character",
    },
    passwordsMustMatch: "Passwords must match",
    passwordsDoNotMatch: "Passwords do not match.",
    policyError: "Your password does not meet the security requirements.",
    tokenMissing: "Reset token is missing.",
    invalidFallback: "This password reset link is invalid or has expired.",
    validateFailed: "Unable to validate this reset link right now.",
    update: "Update password",
    updating: "Updating...",
    requestNewLink: "Request a new link",
    back: "Back to login",
    csrf: "Security check failed. Refresh and try again.",
    generic: "Something went wrong. Please try again.",
    unableReset: "Unable to reset password.",
    toastUpdated: "Password updated. Please log in.",
  },

  verifyEmail: {
    hero: {
      eyebrow: "Account security",
      title: "Verify email",
      subtitle: "Confirm your email to activate portal access.",
    },
    eyebrowComplete: "Verification complete",
    eyebrowRequired: "Verification required",
    invalidTitle: "Verification link invalid",
    invalidBody:
      "This email verification link is invalid or has expired. Request a fresh registration or contact support if the issue persists.",
    invalidAlert: "The verification token is not valid anymore.",
    registerAgain: "Register again",
    successTitle: "Email verified",
    successBody: (name: string) =>
      `Your account is now active${name ? `, ${name}` : ""}. You can continue to login and complete the rest of your workflow.`,
    successAlert: "Email verification succeeded.",
    goToLogin: "Go to login",
    back: "Back to login",
  },

  news: {
    eyebrow: "News",
    downloadPdf: "Download PDF",
  },
};
