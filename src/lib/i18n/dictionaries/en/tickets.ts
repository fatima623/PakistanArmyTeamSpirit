export const tickets = {
  panel: {
    title: "Queries / FAQs",
    subtitle:
      "Check the answers below first. If your question is not there, raise a query and the administration will reply.",
    newTicket: "New query",
    empty:
      "You have not raised any queries yet. Raise one above if you need help.",
    listMeta: (count: number, updated: string) =>
      `${count} message${count === 1 ? "" : "s"} · Updated ${updated}`,
  },
  statuses: {
    OPEN: "Open",
    IN_PROGRESS: "In Progress",
    RESOLVED: "Resolved",
    CLOSED: "Closed",
  },
  staffTag: "PATS team",

  /**
   * Answers to the questions that otherwise arrive as queries. Shown as an
   * accordion above the query list. Keep them short — anything that needs a
   * long answer belongs in the Tour instead.
   */
  faq: {
    title: "Frequently asked questions",
    subtitle: "Quick answers to the most common questions about PATS.",
    items: [
      {
        q: "How do I get an account for the PATS portal?",
        a: "Accounts are created by the PATS administration — there is no public sign-up. Once your team is nominated, the administration creates your login and sends the credentials to your registered email address.",
      },
      {
        q: "I have forgotten my password. What do I do?",
        a: "Use the “Forgot your password?” link on the sign-in screen. A secure reset link is sent to your registered email address and is valid for a limited time. If the email does not arrive, raise a query here.",
      },
      {
        q: "What are the registration steps and in what order?",
        a: "Five steps, each unlocking the next: 1) Confirm Participation, 2) Unit Information, 3) Team Members, 4) Flight Details, 5) Verification by the SD (Sports Directorate). Your dashboard shows which step is open and what is still outstanding.",
      },
      {
        q: "How many members can my team have?",
        a: "The team size limit is published on your dashboard and applies to every team. If your contingent needs to exceed it, submit a team size request with a justification — the administration decides each request individually.",
      },
      {
        q: "What do I need to submit under Flight Details?",
        a: "One record per travelling team member: arrival and departure flights with dates, times and flight numbers, plus the passport and ticket documents for that traveller. The step is complete only when every roster member has a record.",
      },
      {
        q: "When is my registration considered submitted?",
        a: "Once the flight details for the whole roster are submitted, your registration enters the SD verification queue automatically. You do not need to send anything separately — the dashboard status tells you where it stands.",
      },
      {
        q: "Can I change my unit or CO details after saving them?",
        a: "Yes, while the step is still open — reopen Unit Information from the dashboard and save your changes. Once the registration has been verified, raise a query here and the administration will make the correction.",
      },
      {
        q: "Where do I read about the exercise itself?",
        a: "Open the Tour from the sidebar. It carries the events detail, international participation, familiarization, awards, gallery, announcements and key dates — everything published about PATS.",
      },
      {
        q: "Who sees my query, and who replies to it?",
        a: "A query is a shared conversation: the whole PATS administration and the host formation can see it, and any of them can answer. Each reply shows the name and desk of whoever wrote it.",
      },
      {
        q: "Can I reopen a query after it is closed?",
        a: "A closed query stays readable but no longer accepts replies. If the same issue comes back, raise a new query and refer to the earlier one in the subject.",
      },
      {
        q: "In which languages is the portal available?",
        a: "English, Arabic, Russian, Turkish and Chinese. Use the language selector to switch at any time; your choice is remembered on this device.",
      },
    ],
  },
  detail: {
    backToSupport: "Back to queries",
  },
  form: {
    title: "Raise a query",
    subject: "Subject",
    subjectPlaceholder: "Brief summary of your issue",
    help: "How can we help?",
    helpPlaceholder: "Describe your issue in detail",
    cancel: "Cancel",
    submit: "Submit query",
    toastRaised: "Query raised",
  },
  reply: {
    closedNotice:
      "This query is closed. Raise a new query if you need further help.",
    placeholder: "Write a reply…",
    closeTicket: "Close query",
    sendReply: "Send reply",
    toastClosed: "Query closed",
    /** Group-chat quote reply. */
    reply: "Reply",
    replyingTo: "Replying to",
    cancelReply: "Cancel reply",
  },
  actions: {
    resolve: "Resolve",
    close: "Close",
    toastResolved: "Query marked resolved",
  },
};
