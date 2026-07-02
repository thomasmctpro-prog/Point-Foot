import { useEffect, useState } from "react";
import { getNews, type NewsArticle, ApiError } from "../lib/api";

export default function News() {
  const [articles, setArticles] = useState<NewsArticle[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getNews()
      .then((data) => {
        if (!cancelled) setArticles(data.articles);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Erreur inconnue.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="flex flex-col gap-6">
      <h1 className="font-headline text-2xl font-semibold tracking-tight">Actu & Mercato</h1>

      {error && (
        <div className="rounded-xl bg-error-container text-on-error-container p-4 font-body text-sm">
          {error}
        </div>
      )}

      {!error && articles === null && (
        <div className="font-body text-sm text-on-surface-variant">Chargement des actus…</div>
      )}

      <div className="flex flex-col gap-4">
        {articles?.map((article) => (
          <a
            key={article.id}
            href={article.url}
            target="_blank"
            rel="noreferrer"
            className="bg-surface-container-lowest rounded-2xl p-5 border border-surface-container-highest shadow-sm flex flex-col gap-2 hover:-translate-y-0.5 transition-transform"
          >
            <div className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              {article.source}
            </div>
            <h2 className="font-headline text-lg font-semibold">{article.title}</h2>
            <p className="font-body text-sm text-on-surface-variant">{article.summary}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
