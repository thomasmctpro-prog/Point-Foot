import { useEffect, useState } from "react";
import { getMatches, type Match, ApiError } from "../lib/api";

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

  return (
    <section className="flex flex-col gap-6">
      <h1 className="font-headline text-2xl font-semibold tracking-tight">En direct</h1>

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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {matches?.map((match) => (
          <article
            key={match.id}
            className="bg-surface-container-lowest rounded-2xl p-5 border border-surface-container-highest shadow-sm flex flex-col gap-3"
          >
            <div className="flex justify-between items-center font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              <span>{match.competition}</span>
              <span className={match.status === "live" ? "text-primary" : ""}>
                {match.status === "live" ? match.minute : match.status === "finished" ? "Terminé" : "À venir"}
              </span>
            </div>
            <div className="flex justify-between items-center font-body text-base">
              <span className="font-semibold">{match.homeTeam}</span>
              <span>{match.homeScore ?? "-"}</span>
            </div>
            <div className="flex justify-between items-center font-body text-base">
              <span className="font-semibold">{match.awayTeam}</span>
              <span>{match.awayScore ?? "-"}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
