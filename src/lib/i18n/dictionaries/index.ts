import type { Locale } from "../config";
import { en } from "./en";
import { ru } from "./ru";
import { tr } from "./tr";
import { ar } from "./ar";
import { zh } from "./zh";

export type Dictionary = typeof en;

export const dictionaries: Record<Locale, Dictionary> = { en, ru, tr, ar, zh };
