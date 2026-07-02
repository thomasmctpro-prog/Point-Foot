import { Router } from "express";
import { scrapeMercatoNews } from "../scrapers/mercatoScraper";
import { getCached, setCached, getStale } from "../services/cache";
import type { NewsArticle } from "../types";

const router = Router();
const CACHE_KEY = "news";
const TTL_MINUTES = Number(process.env.SCRAPE_CACHE_TTL_MINUTES ?? 5);

router.get("/", async (_req, res) => {
  const cached = getCached<NewsArticle[]>(CACHE_KEY);
  if (cached) {
    res.json({ articles: cached, source: "cache" });
    return;
  }

  try {
    const articles = await scrapeMercatoNews();
    setCached(CACHE_KEY, articles, TTL_MINUTES);
    res.json({ articles, source: "live" });
  } catch (err) {
    const stale = getStale<NewsArticle[]>(CACHE_KEY);
    if (stale) {
      res.json({ articles: stale, source: "stale-fallback" });
      return;
    }
    res.status(503).json({ error: "Actus indisponibles pour le moment.", detail: (err as Error).message });
  }
});

export default router;
