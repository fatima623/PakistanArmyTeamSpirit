// English — source of truth for shared public chrome: the marketing nav
// item labels and the login page. Other locales mirror this shape exactly.

export const publicSite = {
  nav: {
    home: "Home",
    eventsDetail: "Events Detail",
    international: "International Participation",
    awards: "Awards",
    gallery: "Gallery",
    announcements: "Announcements",
    keyDates: "Key Dates",
    login: "Login",
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
};
