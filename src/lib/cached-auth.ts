import { cache } from "react";

import { auth } from "@/lib/auth";

/** One session lookup per request (dedupes layout + page + helpers). */
export const getCachedSession = cache(async () => auth());
