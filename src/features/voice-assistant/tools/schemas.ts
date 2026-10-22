import { z } from "zod";
import type { PoiType } from "@/features/map-explorer";
import { REGION_IDS } from "./regions";

/**
 * Parameter schemas for every client tool - the single source of truth, mirrored by the tool
 * definitions entered in the ElevenLabs dashboard (docs/voice-agent.md)
 *
 * The agent is an LLM, so the schemas accept what it realistically sends rather than only the ideal:
 * "" or null for "not set", numbers as strings, lists as one comma-separated string
 */

export const POI_TYPE_IDS = [
  "city",
  "mountain",
  "lake",
  "river",
  "national_park",
  "nature",
  "island",
  "campsite",
  "landmark",
] as const satisfies readonly PoiType[];

// "" / null / undefined all mean "not provided"
const blankToUndefined = (value: unknown) =>
  value === "" || value === null ? undefined : value;

const optionalText = z.preprocess(blankToUndefined, z.string().trim().min(1).optional());
const requiredText = z.string().trim().min(1);

const idList = z.preprocess(
  (value) =>
    typeof value === "string"
      ? value.split(",").map((part) => part.trim()).filter(Boolean)
      : value,
  z.array(z.string().trim().min(1)).max(20),
);

const flag = z.preprocess(
  (value) => (value === "true" ? true : value === "false" ? false : value),
  z.boolean(),
);

export const searchPlacesSchema = z.object({
  query: optionalText, // name or keyword, e.g. "Plitvice", "slapovi"
  county: optionalText, // county id or name, Croatian or English
  region: z.preprocess(blankToUndefined, z.enum(REGION_IDS).optional()),
  category: z.preprocess(blankToUndefined, z.enum(POI_TYPE_IDS).optional()),
  near: optionalText, // a place id (or name) to search around
  radiusKm: z.preprocess(blankToUndefined, z.coerce.number().min(1).max(200).default(50)),
  limit: z.preprocess(blankToUndefined, z.coerce.number().int().min(1).max(20).default(8)),
});

export const placeIdSchema = z.object({ placeId: requiredText });
export const countyIdSchema = z.object({ countyId: requiredText });
export const placeIdsSchema = z.object({ placeIds: idList });

export const addToWishlistSchema = z.object({
  placeId: requiredText,
  // Must be true: the agent sets it only after the user said yes (see the system prompt)
  confirmed: flag,
});

export const emptySchema = z.object({}); // unknown keys are stripped, not rejected
