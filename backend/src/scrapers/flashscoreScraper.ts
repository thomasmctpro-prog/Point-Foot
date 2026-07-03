import { chromium, type Browser } from "playwright";
import type { Match, MatchStatus } from "../types";

/**
 * flashscore.fr renders matches client-side via JS, so a static HTML fetch (cheerio)
 * returns an empty shell — this needs a headless browser to render the page before
 * extracting data. Selectors below (.event__match, data-testid="wcl-*") were verified
 * against the live site; kept isolated in this file so a markup change on flashscore's
 * side only requires touching this one file.
 */

const FLASHSCORE_URL = process.env.FLASHSCORE_BASE_URL ?? "https://www.flashscore.fr";

let browserPromise: Promise<Browser> | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = chromium.launch({ headless: true }).catch((err) => {
      browserPromise = null;
      throw err;
    });
  }
  const browser = await browserPromise;
  if (!browser.isConnected()) {
    browserPromise = null;
    return getBrowser();
  }
  return browser;
}

interface RawMatch {
  id: string;
  league: string | null;
  home: string | null;
  away: string | null;
  homeScore: string | null;
  awayScore: string | null;
  time: string | null;
  isLive: boolean;
  isScheduled: boolean;
}

function todayIsoAt(hhmm: string | null): string {
  const now = new Date();
  if (!hhmm || !/^\d{1,2}:\d{2}$/.test(hhmm)) {
    return now.toISOString();
  }
  const [h, m] = hhmm.split(":").map(Number);
  const kickoff = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
  return kickoff.toISOString();
}

function toMatch(raw: RawMatch): Match | null {
  if (!raw.home || !raw.away) return null;

  let status: MatchStatus = "finished";
  if (raw.isLive) status = "live";
  else if (raw.isScheduled) status = "scheduled";

  const homeScore = raw.homeScore !== null && raw.homeScore !== "" ? Number(raw.homeScore) : null;
  const awayScore = raw.awayScore !== null && raw.awayScore !== "" ? Number(raw.awayScore) : null;

  return {
    id: raw.id,
    competition: raw.league ?? "Football",
    homeTeam: raw.home,
    awayTeam: raw.away,
    homeScore: Number.isFinite(homeScore) ? homeScore : null,
    awayScore: Number.isFinite(awayScore) ? awayScore : null,
    status,
    minute: status === "live" ? raw.time : null,
    kickoffAt: status === "scheduled" ? todayIsoAt(raw.time) : todayIsoAt(null),
  };
}

export async function scrapeFlashscoreMatches(): Promise<Match[]> {
  const browser = await getBrowser();
  const page = await browser.newPage({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
  });

  try {
    await page.goto(FLASHSCORE_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForSelector(".event__match", { timeout: 20000, state: "attached" });

    const raw: RawMatch[] = await page.evaluate(() => {
      const container = document.getElementById("live-table");
      if (!container) return [];

      const nodes = Array.from(
        container.querySelectorAll(".headerLeague__title-text, .event__match")
      );

      let currentLeague: string | null = null;
      const out: {
        id: string;
        league: string | null;
        home: string | null;
        away: string | null;
        homeScore: string | null;
        awayScore: string | null;
        time: string | null;
        isLive: boolean;
        isScheduled: boolean;
      }[] = [];

      for (const el of nodes) {
        if (el.classList.contains("headerLeague__title-text")) {
          currentLeague = el.textContent?.trim() ?? null;
          continue;
        }
        const home = el.querySelector(
          ".event__homeParticipant [data-testid='wcl-scores-simple-text-01']"
        )?.textContent?.trim() ?? null;
        const away = el.querySelector(
          ".event__awayParticipant [data-testid='wcl-scores-simple-text-01']"
        )?.textContent?.trim() ?? null;
        const homeScore =
          el.querySelector(".event__score--home")?.textContent?.trim() ?? null;
        const awayScore =
          el.querySelector(".event__score--away")?.textContent?.trim() ?? null;
        const time = el.querySelector(".event__time")?.textContent?.trim() ?? null;
        const stage = el.querySelector(".event__stage--block")?.textContent?.trim() ?? null;

        out.push({
          id: el.id,
          league: currentLeague,
          home,
          away,
          homeScore,
          awayScore,
          time: time ?? stage,
          isLive: el.classList.contains("event__match--live"),
          isScheduled: el.classList.contains("event__match--scheduled"),
        });
      }
      return out;
    });

    return raw.map(toMatch).filter((m): m is Match => m !== null);
  } finally {
    await page.close();
  }
}
