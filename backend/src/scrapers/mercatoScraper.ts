import type { NewsArticle } from "../types";

/**
 * Scrapes transfer news from RMC Sport / Foot Mercato. Implemented in Phase 4,
 * kept isolated here so a change in the source site's markup only requires
 * touching this one file.
 */
export async function scrapeMercatoNews(): Promise<NewsArticle[]> {
  throw new Error("scrapeMercatoNews not implemented yet — Phase 4");
}
