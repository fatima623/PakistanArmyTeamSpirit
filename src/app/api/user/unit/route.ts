import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { UnitUpdateSchema } from "@/lib/validations";
import {
  ApiError,
  handleApiError,
  requireAuth,
  requireJsonContentType,
  userSelect,
} from "@/lib/api-helpers";
import { canEditUnitInfo, workflowUserSelect } from "@/lib/participant-workflow";
import { PAKISTAN_COUNTRY } from "@/lib/countries";

/**
 * Unit information is the participant's second registration step. The admin
 * creates the account with nothing but a login, so the Unit row does not exist
 * until this route creates it — hence upsert rather than update.
 *
 * The legacy columns below are still `NOT NULL` in the schema but were retired
 * from every form; they are seeded blank on create and left untouched on
 * update so an admin edit that does populate them is not wiped by a later
 * participant save.
 */
const LEGACY_UNIT_DEFAULTS = {
  jointPatrol: false,
  bdeOrFmn: "",
  divOrFmn: "",
  service: "",
  unitAddress: "",
  postcode: "",
  telephoneMil: "",
  telephoneCiv: "",
  coRank: "",
  coSalutations: null,
  canAccommodateIntl: false,
  preferredIntlPatrol: null,
  longStandingRelation: false,
} as const;

export async function PUT(request: Request) {
  try {
    const session = await requireAuth();
    requireJsonContentType(request);
    const body = await request.json();
    const parsed = UnitUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const userId = session.user.id;

    const workflowUser = await prisma.user.findUnique({
      where: { id: userId },
      select: workflowUserSelect,
    });
    if (!workflowUser) {
      throw new ApiError("User not found", 404);
    }
    if (!canEditUnitInfo(workflowUser)) {
      throw new ApiError(
        "Unit information is not editable at this stage of your registration.",
        403
      );
    }

    const unitFields = {
      unitType: data.unitType,
      branch: data.branch,
      unitName: data.unitName,
      arm: data.arm,
      secondPocEmail: data.secondPocEmail || null,
      thirdPocEmail: data.thirdPocEmail || null,
      additionalInfo: data.additionalInfo ?? null,
      coName: data.coName,
      coEmail: data.coEmail,
      coPhone: data.coPhone,
    };

    const user = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          rank: data.rank,
          country: data.country,
          /* Nationality is not on this form. Keep the one case the register
             form also derives — a Pakistani team is Pakistani — and leave any
             other nationality exactly as recorded rather than guessing one
             from the country. */
          ...(data.country === PAKISTAN_COUNTRY
            ? { nationality: "Pakistani" }
            : {}),
          // Completing the step unlocks team registration. Re-saving keeps the
          // original timestamp so the progress panel does not jump around.
          unitInfoCompletedAt:
            workflowUser.unitInfoCompletedAt ?? new Date(),
        },
      });

      await tx.unit.upsert({
        where: { userId },
        create: { userId, ...LEGACY_UNIT_DEFAULTS, ...unitFields },
        update: unitFields,
      });

      return tx.user.findUnique({
        where: { id: userId },
        select: { ...userSelect, unit: true },
      });
    });

    /* The dashboard's progress panel and the journey step are server-rendered
       from `unitInfoCompletedAt`, so they must be re-rendered before the form
       navigates back — otherwise the step the participant just finished is
       still drawn as outstanding until a hard refresh. */
    revalidatePath("/event/dashboard");
    revalidatePath("/event/journey");

    return NextResponse.json({ user });
  } catch (error) {
    return handleApiError(error);
  }
}
