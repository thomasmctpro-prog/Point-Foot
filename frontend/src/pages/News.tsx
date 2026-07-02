import { useEffect, useState } from "react";
import { getNews, type NewsArticle, ApiError } from "../lib/api";

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.round(diffMs / 3_600_000);
  if (hours < 1) return "À l'instant";
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.round(hours / 24);
  return days === 1 ? "Hier" : `Il y a ${days}j`;
}

function FeaturedArticle({ article }: { article: NewsArticle }) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noreferrer"
      className="relative w-full h-72 sm:h-[420px] rounded-2xl overflow-hidden group cursor-pointer shadow-lg border border-surface-container-highest block"
    >
      {article.imageUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url('${article.imageUrl}')` }}
        />
      ) : (
        <div className="absolute inset-0 bg-primary-container" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/90 via-inverse-surface/40 to-transparent" />
      <div className="absolute bottom-0 left-0 p-6 sm:p-8 w-full flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span className="bg-primary text-on-primary font-bold px-3 py-1 rounded text-xs font-label uppercase tracking-wider">
            {article.source}
          </span>
          <span className="text-white/80 text-sm font-body">{timeAgo(article.publishedAt)}</span>
        </div>
        <h2 className="font-headline text-2xl sm:text-3xl font-bold text-white leading-tight">
          {article.title}
        </h2>
        <p className="font-body text-sm sm:text-base text-white/90 line-clamp-2 max-w-3xl">
          {article.summary}
        </p>
      </div>
    </a>
  );
}

function ArticleCard({ article }: { article: NewsArticle }) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noreferrer"
      className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-surface-container-highest hover:shadow-lg hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 flex flex-col group"
    >
      {article.imageUrl && (
        <div className="h-44 w-full overflow-hidden">
          <img
            src={article.imageUrl}
            alt=""
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      )}
      <div className="p-5 flex flex-col gap-2 flex-1">
        <h3 className="font-headline text-lg font-bold text-on-surface group-hover:text-primary transition-colors leading-snug">
          {article.title}
        </h3>
        <p className="font-body text-sm text-on-surface-variant line-clamp-2">{article.summary}</p>
        <div className="mt-auto flex items-center justify-between text-on-surface-variant text-xs font-label uppercase tracking-wider pt-3 border-t border-surface-container-highest">
          <span>{article.source}</span>
          <span>{timeAgo(article.publishedAt)}</span>
        </div>
      </div>
    </a>
  );
}

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

  const [featured, ...rest] = articles ?? [];

  return (
    <div className="flex flex-col gap-10">
      <h1 className="font-headline text-3xl sm:text-4xl font-bold text-on-surface tracking-tight">
        Actu <span className="text-primary font-normal">&</span> Mercato
      </h1>

      {error && (
        <div className="rounded-xl bg-error-container text-on-error-container p-4 font-body text-sm">
          {error}
        </div>
      )}

      {!error && articles === null && (
        <div className="font-body text-sm text-on-surface-variant">Chargement des actus…</div>
      )}

      {articles !== null && articles.length === 0 && !error && (
        <div className="font-body text-sm text-on-surface-variant">Aucune actu pour le moment.</div>
      )}

      {featured && <FeaturedArticle article={featured} />}

      {rest.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {rest.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
