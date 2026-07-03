import * as cheerio from "cheerio";
import type { NewsArticle } from "../types";

/**
 * footmercato.net's homepage is server-rendered (unlike flashscore.fr), so a
 * plain fetch + cheerio parse is enough — no headless browser needed. Article
 * cards come in two homepage layouts (.articleFeatured for the hero,
 * .articleInline for the feed list); a third layout (.articleCompact) only
 * appears in a "most read" sidebar that duplicates the same articles, so it's
 * skipped to avoid duplicate entries.
 */

const MERCATO_URL = process.env.MERCATO_SOURCE_URL ?? "https://www.footmercato.net/";
const SOURCE_NAME = "Foot Mercato";

function absoluteUrl(src: string | undefined): string | null {
  if (!src) return null;
  try {
    return new URL(src, MERCATO_URL).toString();
  } catch {
    return null;
  }
}

function extractImage($card: cheerio.Cheerio<any>): string | null {
  const img = $card.find("img").first();
  const dataSrc = img.attr("data-src");
  if (dataSrc) return absoluteUrl(dataSrc);

  const srcset = $card.find("source[srcset]").first().attr("srcset");
  if (srcset) return absoluteUrl(srcset.split(" ")[0]);

  const src = img.attr("src");
  if (src && !src.startsWith("data:")) return absoluteUrl(src);

  return null;
}

function extractUrl($: cheerio.CheerioAPI, $card: cheerio.Cheerio<any>): string | null {
  let found: string | null = null;
  $card.find("a").each((_, a) => {
    if (found) return;
    const href = $(a).attr("href");
    if (href && /\/a\d+-/.test(href)) found = href;
  });
  return absoluteUrl(found ?? undefined);
}

function parseMeta(raw: string | null): { competition: string | null; publishedAt: string } {
  const now = new Date();
  if (!raw) return { competition: null, publishedAt: now.toISOString() };

  const [left, right] = raw.split(" - ").map((s) => s.trim());
  const competition = right && right.length > 0 ? right : null;

  const timeMatch = /^(\d{1,2}):(\d{2})$/.exec(left);
  if (timeMatch) {
    const [, h, m] = timeMatch;
    const published = new Date(now.getFullYear(), now.getMonth(), now.getDate(), Number(h), Number(m));
    return { competition, publishedAt: published.toISOString() };
  }

  const dateMatch = /^(\d{2})\/(\d{2})$/.exec(left);
  if (dateMatch) {
    const [, dd, mm] = dateMatch;
    const published = new Date(now.getFullYear(), Number(mm) - 1, Number(dd));
    return { competition, publishedAt: published.toISOString() };
  }

  return { competition, publishedAt: now.toISOString() };
}

function toArticle($: cheerio.CheerioAPI, card: any): NewsArticle | null {
  const $card = $(card);
  const url = extractUrl($, $card);
  const title = $card.find(".articleTitleMetas__title").first().text().trim();
  if (!url || !title) return null;

  const idMatch = /\/a(\d+)-/.exec(url);
  if (!idMatch) return null;

  const tag = $card.find(".articleTitleMetas__specificity .tags").first().text().trim();
  const metaRaw = $card.find(".articleTitleMetas__competitionDate").first().text().trim() || null;
  const { competition, publishedAt } = parseMeta(metaRaw);
  const summary = [tag, competition].filter(Boolean).join(" · ") || "Actualité transferts";

  return {
    id: idMatch[1],
    title,
    summary,
    url,
    source: SOURCE_NAME,
    publishedAt,
    imageUrl: extractImage($card),
  };
}

export async function scrapeMercatoNews(): Promise<NewsArticle[]> {
  const res = await fetch(MERCATO_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
    },
  });
  if (!res.ok) {
    throw new Error(`Foot Mercato responded with HTTP ${res.status}`);
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  const seen = new Set<string>();
  const articles: NewsArticle[] = [];

  $(".articleFeatured, .articleInline").each((_, card) => {
    const article = toArticle($, card);
    if (!article || seen.has(article.url)) return;
    seen.add(article.url);
    articles.push(article);
  });

  return articles;
}
