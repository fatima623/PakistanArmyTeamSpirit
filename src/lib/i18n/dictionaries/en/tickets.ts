export const tickets = {
  panel: {
    title: "Support",
    subtitle: "Raise a ticket and our team will get back to you.",
    newTicket: "New ticket",
    empty: "You have no support tickets yet. Raise one above if you need help.",
    listMeta: (category: string, count: number, updated: string) =>
      `${category} · ${count} message${count === 1 ? "" : "s"} · Updated ${updated}`,
  },
  statuses: {
    OPEN: "Open",
    IN_PROGRESS: "In Progress",
    RESOLVED: "Resolved",
    CLOSED: "Closed",
  },
  priorities: {
    LOW: "Low",
    NORMAL: "Normal",
    HIGH: "High",
  },
  priorityTag: (label: string) => `${label} priority`,
  categories: {
    GENERAL: "General enquiry",
    REGISTRATION: "Registration",
    PAYMENT: "Payment",
    TECHNICAL: "Technical issue",
  },
  staffTag: "PATS team",
  detail: {
    backToSupport: "Back to support",
    subtitle: (category: string, date: string) => `${category} · Opened ${date}`,
  },
  form: {
    title: "Raise a support ticket",
    subject: "Subject",
    subjectPlaceholder: "Brief summary of your issue",
    category: "Category",
    priority: "Priority",
    help: "How can we help?",
    helpPlaceholder: "Describe your issue in detail",
    cancel: "Cancel",
    submit: "Submit ticket",
    toastRaised: "Ticket raised",
  },
  reply: {
    closedNotice:
      "This ticket is closed. Raise a new ticket if you need further help.",
    placeholder: "Write a reply…",
    closeTicket: "Close ticket",
    sendReply: "Send reply",
    toastClosed: "Ticket closed",
  },
  actions: {
    resolve: "Resolve",
    close: "Close",
    toastResolved: "Ticket marked resolved",
  },
};
