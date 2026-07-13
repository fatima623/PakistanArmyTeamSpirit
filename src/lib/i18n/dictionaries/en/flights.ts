export const flights = {
  doc: {
    uploaded: "Uploaded",
    notUploadedYet: "Not uploaded yet",
    required: "Required",
    pdfLabel: (size: string | null) => `PDF${size ? ` · ${size}` : ""}`,
    openPdfTitle: (label: string) => `Open ${label} PDF`,
    viewPdf: "View PDF",
    missing: "Missing",
  },
  labels: {
    passport: "Passport",
    flightTicket: "Flight Ticket",
  },
  banners: {
    finalizedTitle:
      "Your flight details have been reviewed and finalized by the administration.",
    finalizedSub:
      "Records are read-only. Host information becomes available once published by the organizers.",
    deadlinePassed:
      "The flight details submission deadline has passed. Contact the organizers if corrections are required.",
    deadlineInfo: (date: string) =>
      `You can submit or replace documents until ${date} (or until records are locked by the administration).`,
  },
  card: {
    title: "Team flight information",
    desc: "One submission covers your whole team — provide the lead traveller's details and upload the passport & ticket documents (PDF, max 10MB each).",
    submitted: "Submitted",
    notSubmitted: "Not submitted",
  },
  form: {
    leadName: "Lead traveller name (as on passport)",
    leadNamePlaceholder: "e.g. CAPT SARA KHAN",
    passportNumber: "Passport number",
    passportNumberPlaceholder: "e.g. AB1234567",
    passportDoc: "Passport document (PDF)",
    ticketDoc: "Flight ticket (PDF)",
    currentFile: (name: string) => `Current: ${name}. Leave empty to keep it.`,
    saveChanges: "Save changes",
    submitFlight: "Submit flight details",
    cancel: "Cancel",
  },
  view: {
    leadTraveller: "Lead Traveller",
    passportNumber: "Passport Number",
    lastUpdated: "Last updated",
    editDetails: "Edit details",
  },
  errors: {
    nameRequired: "Lead traveller name is required",
    passportRequired: "Passport number is required",
    mustBePdf: (label: string) => `${label} must be a PDF file`,
    mustBeUnder10: (label: string) => `${label} must be under 10MB`,
    passportLabel: "Passport",
    ticketLabel: "Flight ticket",
    updated: "Flight details updated",
    submitted: "Flight details submitted",
  },
  none: "—",
};
