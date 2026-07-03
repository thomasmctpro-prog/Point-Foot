import { scrapeFlashscoreMatches } from "../scrapers/flashscoreScraper";
import { getCached, setCached, getStale } from "./cache";
import type { Match } from "../types";

const CACHE_KEY = "matches";
const TTL_MINUTES = Number(process.env.SCRAPE_CACHE_TTL_MINUTES ?? 5);

export async function getMatchesCachedOrLive(): Promise<{
  matches: Match[];
  source: "cache" | "live" | "stale-fallback";
}> {
  const cached = getCached<Match[]>(CACHE_KEY);
  if (cached) return { matches: cached, source: "cache" };

  try {
    const matches = await scrapeFlashscoreMatches();
    setCached(CACHE_KEY, matches, TTL_MINUTES);
    return { matches, source: "live" };
  } catch (err) {
    const stale = getStale<Match[]>(CACHE_KEY);
    if (stale) return { matches: stale, source: "stale-fallback" };
    throw err;
  }
}
