import { useEffect, useState } from "react";
import { getMatches, type Match, ApiError } from "../lib/api";

function statusLabel(match: Match) {
  if (match.status === "live") return match.minute ?? "En direct";
  if (match.status === "finished") return "Terminé";
  return "À venir";
}

function MatchCard({ match }: { match: Match }) {
  const isLive = match.status === "live";
  return (
    <article
      className={[
        "bg-surface-container-lowest rounded-2xl p-5 border shadow-sm flex flex-col gap-4 transition-all duration-300",
        isLive ? "border-primary/30 shadow-[0_4px_24px_rgba(9,76,178,0.08)]" : "border-surface-container-highest",
      ].join(" ")}
    >
      <div className="flex justify-between items-center font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
        <span>{match.competition}</span>
        {isLive ? (
          <span className="flex items-center gap-1.5 text-live-green">
            <span className="w-1.5 h-1.5 rounded-full bg-live-green pulse-live" />
            {statusLabel(match)}
          </span>
        ) : (
          <span>{statusLabel(match)}</span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="font-body text-base font-semibold text-on-surface">{match.homeTeam}</span>
          <span className="font-body text-lg font-bold text-on-surface w-8 text-right">
            {match.homeScore ?? "-"}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-body text-base font-semibold text-on-surface">{match.awayTeam}</span>
          <span className="font-body text-lg font-bold text-on-surface w-8 text-right">
            {match.awayScore ?? "-"}
          </span>
        </div>
      </div>
    </article>
  );
}

export default function Results() {
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getMatches()
      .then((data) => {
        if (!cancelled) setMatches(data.matches);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Erreur inconnue.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const live = matches?.filter((m) => m.status === "live") ?? [];
  const others = matches?.filter((m) => m.status !== "live") ?? [];

  return (
    <div className="flex flex-col gap-12">
      {error && (
        <div className="rounded-xl bg-error-container text-on-error-container p-4 font-body text-sm">
          {error}
        </div>
      )}

      {!error && matches === null && (
        <div className="font-body text-sm text-on-surface-variant">Chargement des scores…</div>
      )}

      {matches !== null && matches.length === 0 && !error && (
        <div className="font-body text-sm text-on-surface-variant">Aucun match pour le moment.</div>
      )}

      {live.length > 0 && (
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[24px]">sensors</span>
            <h2 className="font-headline text-2xl font-semibold tracking-tight">En Direct</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {live.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[24px]">calendar_month</span>
            <h2 className="font-headline text-2xl font-semibold tracking-tight">Résultats & Calendrier</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
