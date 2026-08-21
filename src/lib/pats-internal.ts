/**
 * Internal workflow reference (planning documents).
 * Used for backend/admin alignment — not imported on public pages.
 */

export const ADMIN_WORKFLOW_STEPS = [
  { step: "01", title: "Team Registration", detail: "International team submits participation request and supporting documentation." },
  { step: "02", title: "JLA Review", detail: "Junior Leaders Academy validates competition eligibility and initial packet completeness." },
  { step: "03", title: "MT & SD Directorate Review", detail: "Movement and staff duties directorate assesses protocol and administrative inputs." },
  { step: "04", title: "Protocol & Administrative Processing", detail: "Visa, flight, accommodation, and equipment requirements are coordinated." },
  { step: "05", title: "SD Approval", detail: "The completed registration is reviewed and approved by the Sports Directorate." },
  { step: "06", title: "Final Approval", detail: "Authorized HQ staff issue operational clearance for participation." },
  { step: "07", title: "Participation Confirmation", detail: "Team receives confirmation and dashboard access for competition cycle updates." },
] as const;
