import { NextResponse } from "next/server";

import {
  ApiError,
  handleApiError,
  requireAuth,
} from "@/lib/api-helpers";
import { loadPaymentProofForPayment } from "@/lib/payment-proof-serve";

type RouteContext = { params: Promise<{ id: string }> };

/** Participant access — own payment proofs only. */
export async function GET(_request: Request, context: RouteContext) {
  try {
    const session = await requireAuth();
    const { id } = await context.params;

    const proof = await loadPaymentProofForPayment(id, {
      userId: session.user.id,
      role: session.user.role ?? "user",
    });

    return new NextResponse(new Uint8Array(proof.buffer), {
      headers: {
        "Content-Type": proof.mimeType,
        "Content-Disposition": `inline; filename="${encodeURIComponent(proof.fileName)}"`,
        "Cache-Control": "private, no-store, no-cache",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "NOT_FOUND") {
        return handleApiError(new ApiError("Payment not found", 404));
      }
      if (error.message === "NO_PROOF") {
        return handleApiError(new ApiError("Payment proof not found", 404));
      }
      if (error.message === "FORBIDDEN") {
        return handleApiError(new ApiError("Forbidden", 403));
      }
    }
    return handleApiError(error);
  }
}
