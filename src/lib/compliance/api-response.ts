import { NextResponse } from "next/server";

import type { ApiErrorCode } from "@/lib/compliance/constants";

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  code?: ApiErrorCode;
};

export function apiSuccess<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(
  message: string,
  code: ApiErrorCode,
  status: number
): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    { success: false, error: message, code },
    { status }
  );
}
