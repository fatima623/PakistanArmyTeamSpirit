// English — source of truth for the public registration page + form.
// Other locales mirror this shape exactly (enforced via `typeof`).
//
// NOTE: `options` keys are the exact values submitted to the backend and
// validated by RegisterSchema — never translate the KEYS, only their labels.

export const register = {
  hero: {
    eyebrow: "Registration",
    title: "Register interest",
    subtitle:
      "Submit patrol and liaison details for HQ review. Registration is not complete until patrol fees are confirmed.",
  },

  closed: {
    title: "Registration closed",
    body: "The registration deadline has passed. Please contact PATS administration if you believe this is in error.",
  },

  notice: {
    intro: (site: string) => `Before registering for ${site} please`,
    emphasis: "make sure you have all the details below available.",
    rest: "Applications containing incorrect information will be rejected. All fields are required unless marked otherwise.",
    phaseNote:
      "Note: phase selection is available in the next stage. Registration is not complete until patrols are paid for.",
    intlClosedPrefix:
      "Applications are now closed for International Patrols only. Please contact",
    intlClosedSuffix: "if you require any assistance.",
  },

  sections: {
    account: "Account details",
    unit: "Unit details",
    attache: "DETAIL OF DEFENCE ATTACHE",
  },

  fields: {
    email: "Email",
    password: "Password",
    passwordHint: "Min 8 chars: upper, lower, number, special",
    confirmPassword: "Confirm password",
    firstName: "First name",
    lastName: "Last name",
    rank: "Rank",
    gender: "Gender",
    unitType: "Unit type",
    branch: "Branch",
    unitName: "Unit name",
    selectUnit: "Select unit",
    country: "Country of Application",
    specifyCountry: "Specify country",
    specifyCountryHint: "Enter your country if it is not listed above",
    specifyCountryPlaceholder: "Enter your country",
    nationality: "Nationality",
    nationalityHint: "Required for international participants",
    nationalityPlaceholder: "e.g. British, Turkish, Jordanian",
    arm: "Arm",
    select: "Select",
    secondPoc: "2nd POC email",
    thirdPoc: "3rd POC email (optional)",
    additionalInfo: "Additional info (optional)",
    coName: "CO name",
    coEmail: "CO email",
    coPhone: "CO phone",
  },

  // Labels only — the keys are the submitted values and must stay unchanged.
  options: {
    gender: { Male: "Male", Female: "Female", Other: "Other" },
    unitType: { Regular: "Regular", Reserve: "Reserve" },
    branch: { Army: "Army", Navy: "Navy", "Air Force": "Air Force" },
    arm: {
      Combat: "Combat",
      "Combat Support": "Combat Support",
      "Combat Service Support": "Combat Service Support",
    },
  },

  consent: {
    prefix: "I have read and agree to the",
    link: "privacy policy",
  },

  submit: "Next stage",
  submitting: "Submitting...",
  afterSubmit:
    "After registering you will receive an email confirmation. Please check your Spam/Junk folder in case it ends up there.",

  errors: {
    csrf: "Security check failed. Refresh and try again.",
  },
};
