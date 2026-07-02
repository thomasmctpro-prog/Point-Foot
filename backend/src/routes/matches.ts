import { Router } from "express";
import { scrapeFlashscoreMatches } from "../scrapers/flashscoreScraper";
import { getCached, setCached, getStale } from "../services/cache";
import type { Match } from "../types";

const router = Router();
const CACHE_KEY = "matches";
const TTL_MINUTES = Number(process.env.SCRAPE_CACHE_TTL_MINUTES ?? 5);

router.get("/", async (_req, res) => {
  const cached = getCached<Match[]>(CACHE_KEY);
  if (cached) {
    res.json({ matches: cached, source: "cache" });
    return;
  }

  try {
    const matches = await scrapeFlashscoreMatches();
    setCached(CACHE_KEY, matches, TTL_MINUTES);
    res.json({ matches, source: "live" });
  } catch (err) {
    const stale = getStale<Match[]>(CACHE_KEY);
    if (stale) {
      res.json({ matches: stale, source: "stale-fallback" });
      return;
    }
    res.status(503).json({ error: "Scores indisponibles pour le moment.", detail: (err as Error).message });
  }
});

export default router;
