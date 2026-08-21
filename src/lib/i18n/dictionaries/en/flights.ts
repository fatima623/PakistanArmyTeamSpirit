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
    flightTicket: "Flight Ticket (Outbound)",
    returnTicket: "Return Ticket",
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
    title: "Traveller flight details",
    progress: (done: number, total: number) =>
      `${done} of ${total} travellers complete`,
    emptyRoster:
      "Your roster is empty. Add your team members first — flight details are filed one traveller at a time.",
  },
  status: {
    notStarted: "Not started",
    detailsSaved: "Details saved, documents missing",
    passportMissing: "Passport missing",
    ticketMissing: "Ticket missing",
    complete: "Complete",
  },
  member: {
    noRecord: "No flight details submitted for this traveller yet.",
    addDetails: "Add flight details",
    editDetails: "Edit details",
    delete: "Delete",
    confirmDelete: "Delete these flight details?",
    confirmDeleteYes: "Yes, delete",
    keep: "Keep",
    deleted: "Flight details deleted",
  },
  form: {
    passengerName: "Passenger name (as on passport)",
    passengerNamePlaceholder: "e.g. CAPT SARA KHAN",
    passportNumber: "Passport number",
    passportNumberPlaceholder: "e.g. AB1234567",
    passportDoc: "Passport picture (PDF)",
    passportDocHint: "Upload the first page of your passport.",
    ticketDoc: "Outbound flight ticket (PDF)",
    ticketDocHint: "Your inbound journey to Pakistan.",
    returnTicketDoc: "Return flight ticket (PDF)",
    returnTicketDocHint: "Your journey home. Optional — add it as soon as it is booked.",
    returnTicketLocked: "Upload the outbound ticket first — the return ticket field unlocks straight after.",
    currentFile: (name: string) => `Current: ${name}. Leave empty to keep it.`,
    saveChanges: "Save changes",
    submitFlight: "Save flight details",
    cancel: "Cancel",
  },
  view: {
    passenger: "Passenger",
    passportNumber: "Passport Number",
    lastUpdated: "Last updated",
  },
  unlinked: {
    title: "Unlinked flight records",
    desc: "These records were submitted before flight details were filed per traveller. Assign each one to a roster member to keep it — an unassigned record does not count towards your team's progress.",
    assign: "Assign",
    selectMember: "Select a traveller…",
    noneAvailable:
      "Every roster member already has a flight record. Delete one of them to free a traveller, or delete this unlinked record.",
    assigned: "Flight record assigned to the traveller",
    selectRequired: "Select the traveller this record belongs to",
  },
  submit: {
    title: "Send your registration for approval",
    desc:
      "Flight details are the last step. Once every traveller has a passport and a ticket on file, submit the registration so the Sports Directorate (SD) can approve it.",
    action: "Submit for approval",
    reopen: "Reopen for editing",
    incomplete:
      "Every team member needs both a passport and a ticket on file before you can submit.",
    submittedTitle: "Registration submitted for approval.",
    submittedSub:
      "The Sports Directorate (SD) will review it. You can reopen it while it is still pending.",
    submittedToast: "Registration sent for approval",
    reopenedToast: "Registration reopened for editing",
  },
  errors: {
    nameRequired: "Passenger name is required",
    passportRequired: "Passport number is required",
    mustBePdf: (label: string) => `${label} must be a PDF file`,
    mustBeUnder10: (label: string) => `${label} must be under 10MB`,
    passportLabel: "Passport",
    ticketLabel: "Flight ticket",
    returnTicketLabel: "Return flight ticket",
    updated: "Flight details updated",
    submitted: "Flight details submitted",
  },
  none: "—",
};
