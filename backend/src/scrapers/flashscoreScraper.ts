import type { Match } from "../types";

/**
 * flashscore.fr renders matches client-side via JS, so a static HTML fetch (cheerio)
 * returns an empty shell. This needs a headless browser (Playwright) to render the
 * page before extracting data — implemented in Phase 2, kept isolated here so a change
 * in flashscore's markup only requires touching this one file.
 */
export async function scrapeFlashscoreMatches(): Promise<Match[]> {
  throw new Error("scrapeFlashscoreMatches not implemented yet — Phase 2");
}
