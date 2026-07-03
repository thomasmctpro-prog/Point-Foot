import { useEffect, useMemo, useState, type FormEvent } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import {
  ApiError,
  createLeague,
  getLeague,
  getLeaguePredictions,
  getMatches,
  getMyLeagues,
  joinLeague,
  submitPrediction,
  type LeagueDetail,
  type LeagueSummary,
  type Match,
  type Prediction,
} from "../lib/api";

function kickoffTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function CreateJoinPanel({ onChanged }: { onChanged: () => void }) {
  const { getIdToken } = useAuth();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const token = await getIdToken();
      await createLeague(token, name.trim());
      setName("");
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur inconnue.");
    } finally {
      setBusy(false);
    }
  }

  async function handleJoin(e: FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const token = await getIdToken();
      await joinLeague(token, code.trim());
      setCode("");
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur inconnue.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="bg-surface-container-lowest rounded-2xl p-6 border border-surface-container-highest grid gap-6 sm:grid-cols-2">
      <form onSubmit={handleCreate} className="flex flex-col gap-3">
        <h3 className="font-body text-sm font-semibold text-on-surface">Créer une ligue</h3>
        <input
          type="text"
          placeholder="Nom de la ligue"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          className="rounded-xl border border-surface-container-highest bg-surface px-4 py-2.5 font-body text-sm outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={busy || !name.trim()}
          className="rounded-full bg-primary text-on-primary font-label text-sm font-semibold py-2.5 disabled:opacity-50"
        >
          Créer
        </button>
      </form>

      <form onSubmit={handleJoin} className="flex flex-col gap-3">
        <h3 className="font-body text-sm font-semibold text-on-surface">Rejoindre avec un code</h3>
        <input
          type="text"
          placeholder="Code d'invitation"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          maxLength={8}
          className="rounded-xl border border-surface-container-highest bg-surface px-4 py-2.5 font-body text-sm outline-none focus:border-primary uppercase tracking-wider"
        />
        <button
          type="submit"
          disabled={busy || !code.trim()}
          className="rounded-full border border-primary text-primary font-label text-sm font-semibold py-2.5 disabled:opacity-50"
        >
          Rejoindre
        </button>
      </form>

      {error && (
        <div className="sm:col-span-2 rounded-xl bg-error-container text-on-error-container p-3 font-body text-sm">
          {error}
        </div>
      )}
    </section>
  );
}

function PredictionForm({
  match,
  existing,
  onSubmit,
}: {
  match: Match;
  existing: Prediction | undefined;
  onSubmit: (matchId: string, homeScore: number, awayScore: number) => Promise<void>;
}) {
  const [homeScore, setHomeScore] = useState(existing ? String(existing.homeScore) : "");
  const [awayScore, setAwayScore] = useState(existing ? String(existing.awayScore) : "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const h = Number(homeScore);
    const a = Number(awayScore);
    if (!Number.isInteger(h) || !Number.isInteger(a) || h < 0 || a < 0) {
      setError("Score invalide.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onSubmit(match.id, h, a);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur inconnue.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 py-3 border-b border-surface-container-highest last:border-0">
      <div className="flex flex-col min-w-0">
        <span className="font-label text-[11px] text-on-surface-variant truncate">{match.competition}</span>
        <span className="font-body text-sm text-on-surface truncate">
          {match.homeTeam} — {match.awayTeam}
        </span>
        <span className="font-label text-[11px] text-on-surface-variant">{kickoffTime(match.kickoffAt)}</span>
      </div>
      <form onSubmit={handleSubmit} className="flex items-center gap-2 shrink-0">
        <input
          type="number"
          min={0}
          max={20}
          value={homeScore}
          onChange={(e) => setHomeScore(e.target.value)}
          className="w-12 rounded-lg border border-surface-container-highest bg-surface text-center py-1.5 font-body text-sm outline-none focus:border-primary"
        />
        <span className="text-on-surface-variant">-</span>
        <input
          type="number"
          min={0}
          max={20}
          value={awayScore}
          onChange={(e) => setAwayScore(e.target.value)}
          className="w-12 rounded-lg border border-surface-container-highest bg-surface text-center py-1.5 font-body text-sm outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-primary-container text-on-primary-container font-label text-xs font-semibold px-3 py-1.5 disabled:opacity-50"
        >
          {existing ? "Modifier" : "Valider"}
        </button>
      </form>
      {error && <span className="font-label text-[11px] text-error">{error}</span>}
    </div>
  );
}

function LeagueDetailPanel({ leagueId }: { leagueId: string }) {
  const { user, getIdToken } = useAuth();
  const [league, setLeague] = useState<LeagueDetail | null>(null);
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [predictions, setPredictions] = useState<Prediction[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);

  async function loadAll() {
    setError(null);
    try {
      const token = await getIdToken();
      const [leagueData, matchesData, predictionsData] = await Promise.all([
        getLeague(token, leagueId),
        getMatches(),
        getLeaguePredictions(token, leagueId),
      ]);
      setLeague(leagueData);
      setMatches(matchesData.matches);
      setPredictions(predictionsData.predictions);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur inconnue.");
    }
  }

  useEffect(() => {
    setLeague(null);
    setMatches(null);
    setPredictions(null);
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leagueId]);

  const predictionsByMatch = useMemo(() => {
    const map = new Map<string, Prediction[]>();
    (predictions ?? []).forEach((p) => {
      const list = map.get(p.matchId) ?? [];
      list.push(p);
      map.set(p.matchId, list);
    });
    return map;
  }, [predictions]);

  const myPrediction = (matchId: string) => predictions?.find((p) => p.matchId === matchId && p.userId === user?.uid);

  const scheduledMatches = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (matches ?? [])
      .filter((m) => m.status === "scheduled")
      .filter(
        (m) =>
          !term ||
          m.homeTeam.toLowerCase().includes(term) ||
          m.awayTeam.toLowerCase().includes(term) ||
          m.competition.toLowerCase().includes(term)
      )
      .slice(0, 60);
  }, [matches, search]);

  const decidedMatches = useMemo(() => {
    return (matches ?? []).filter((m) => m.status !== "scheduled" && predictionsByMatch.has(m.id));
  }, [matches, predictionsByMatch]);

  async function handlePredict(matchId: string, homeScore: number, awayScore: number) {
    const token = await getIdToken();
    await submitPrediction(token, leagueId, matchId, homeScore, awayScore);
    const refreshed = await getLeaguePredictions(token, leagueId);
    setPredictions(refreshed.predictions);
  }

  async function copyCode() {
    if (!league) return;
    await navigator.clipboard.writeText(league.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (error) {
    return <div className="rounded-xl bg-error-container text-on-error-container p-4 font-body text-sm">{error}</div>;
  }

  if (!league || !matches || !predictions) {
    return <div className="font-body text-sm text-on-surface-variant">Chargement de la ligue…</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-container-lowest rounded-2xl p-5 border border-surface-container-highest">
        <div>
          <h2 className="font-headline text-lg font-bold text-on-surface">{league.name}</h2>
          <p className="font-label text-xs text-on-surface-variant">{league.members.length} membre(s)</p>
        </div>
        <button
          type="button"
          onClick={copyCode}
          className="flex items-center gap-2 rounded-full border border-surface-container-highest px-4 py-2 font-label text-xs font-semibold text-on-surface-variant hover:text-on-surface"
        >
          <span className="material-symbols-outlined text-[16px]">content_copy</span>
          {copied ? "Copié !" : `Code : ${league.inviteCode}`}
        </button>
      </div>

      <section className="bg-surface-container-lowest rounded-2xl p-6 border border-surface-container-highest">
        <h3 className="font-body text-sm font-semibold text-on-surface mb-4">Classement</h3>
        <ol className="flex flex-col gap-2">
          {league.members.map((m, i) => (
            <li key={m.uid} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-3 font-body text-sm text-on-surface truncate">
                <span className="font-label text-xs text-on-surface-variant w-5 shrink-0">{i + 1}.</span>
                <span className="truncate">{m.displayName}</span>
              </span>
              <span className="font-label text-sm font-bold text-primary shrink-0">{m.totalPoints} pts</span>
            </li>
          ))}
        </ol>
      </section>

      {decidedMatches.length > 0 && (
        <section className="bg-surface-container-lowest rounded-2xl p-6 border border-surface-container-highest">
          <h3 className="font-body text-sm font-semibold text-on-surface mb-2">Pronostics de la ligue</h3>
          <div className="flex flex-col gap-4">
            {decidedMatches.map((m) => (
              <div key={m.id} className="flex flex-col gap-1.5 pb-3 border-b border-surface-container-highest last:border-0">
                <span className="font-body text-sm text-on-surface">
                  {m.homeTeam} {m.homeScore ?? "-"} - {m.awayScore ?? "-"} {m.awayTeam}
                </span>
                <div className="flex flex-wrap gap-2">
                  {(predictionsByMatch.get(m.id) ?? []).map((p) => {
                    const member = league.members.find((mm) => mm.uid === p.userId);
                    return (
                      <span
                        key={p.id}
                        className="font-label text-[11px] rounded-full bg-surface-container px-2.5 py-1 text-on-surface-variant"
                      >
                        {member?.displayName ?? "Joueur"} : {p.homeScore}-{p.awayScore}
                        {typeof p.points === "number" && ` (${p.points} pt${p.points > 1 ? "s" : ""})`}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="bg-surface-container-lowest rounded-2xl p-6 border border-surface-container-highest">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="font-body text-sm font-semibold text-on-surface">Pronostiquer</h3>
          <input
            type="text"
            placeholder="Rechercher une équipe…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-full border border-surface-container-highest bg-surface px-4 py-1.5 font-body text-xs outline-none focus:border-primary"
          />
        </div>
        <div className="max-h-[480px] overflow-y-auto pr-1">
          {scheduledMatches.length === 0 ? (
            <p className="font-body text-sm text-on-surface-variant">Aucun match à venir pour le moment.</p>
          ) : (
            scheduledMatches.map((m) => (
              <PredictionForm key={m.id} match={m} existing={myPrediction(m.id)} onSubmit={handlePredict} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default function LeagueFriends() {
  const { user, loading, getIdToken } = useAuth();
  const [leagues, setLeagues] = useState<LeagueSummary[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadLeagues() {
    try {
      const token = await getIdToken();
      const data = await getMyLeagues(token);
      setLeagues(data.leagues);
      setSelectedId((prev) => prev ?? data.leagues[0]?.id ?? null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur inconnue.");
    }
  }

  useEffect(() => {
    if (user) loadLeagues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (loading) {
    return <div className="font-body text-sm text-on-surface-variant">Chargement…</div>;
  }

  if (!user) {
    return (
      <div className="flex flex-col gap-8">
        <h1 className="font-headline text-3xl font-bold text-on-surface tracking-tight">Ligue entre Amis</h1>

        <section className="bg-surface-container-lowest rounded-3xl p-8 sm:p-12 border border-surface-container-highest shadow-sm flex flex-col items-center text-center gap-4">
          <span className="material-symbols-outlined text-primary text-[40px]">emoji_events</span>
          <h2 className="font-headline text-xl font-semibold text-on-surface">Connecte-toi pour jouer</h2>
          <p className="font-body text-sm text-on-surface-variant max-w-md">
            Crée ou rejoins une ligue privée entre amis pour pronostiquer les matchs et grimper au classement.
            Aucune donnée factice n'est affichée en attendant — et rappel : ce jeu ne fait jamais intervenir
            d'argent réel.
          </p>
          <NavLink
            to="/connexion"
            className="rounded-full bg-primary text-on-primary font-label text-sm font-semibold px-6 py-2.5"
          >
            Se connecter
          </NavLink>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-surface-container-highest flex flex-col gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">group_add</span>
            <h3 className="font-body text-sm font-semibold text-on-surface">Créer ou rejoindre</h3>
            <p className="font-label text-xs text-on-surface-variant">
              Formez une ligue privée avec vos amis via un code d'invitation.
            </p>
          </div>
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-surface-container-highest flex flex-col gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">sports_soccer</span>
            <h3 className="font-body text-sm font-semibold text-on-surface">Pronostiquer</h3>
            <p className="font-label text-xs text-on-surface-variant">
              Prédisez le résultat des matchs avant le coup d'envoi pour gagner des points.
            </p>
          </div>
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-surface-container-highest flex flex-col gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">leaderboard</span>
            <h3 className="font-body text-sm font-semibold text-on-surface">Classement</h3>
            <p className="font-label text-xs text-on-surface-variant">
              Suivez le classement de votre ligue au fil de la saison.
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-headline text-3xl font-bold text-on-surface tracking-tight">Ligue entre Amis</h1>

      {error && (
        <div className="rounded-xl bg-error-container text-on-error-container p-4 font-body text-sm">{error}</div>
      )}

      <CreateJoinPanel onChanged={loadLeagues} />

      {leagues === null ? (
        <div className="font-body text-sm text-on-surface-variant">Chargement de tes ligues…</div>
      ) : leagues.length === 0 ? (
        <p className="font-body text-sm text-on-surface-variant">
          Tu ne fais partie d'aucune ligue pour le moment. Crée-en une ou rejoins celle de tes amis avec leur code.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {leagues.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setSelectedId(l.id)}
                className={[
                  "rounded-full px-4 py-2 font-label text-sm font-semibold transition-colors",
                  selectedId === l.id
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-lowest text-on-surface-variant border border-surface-container-highest hover:text-on-surface",
                ].join(" ")}
              >
                {l.name} ({l.memberCount})
              </button>
            ))}
          </div>

          {selectedId && <LeagueDetailPanel key={selectedId} leagueId={selectedId} />}
        </>
      )}
    </div>
  );
}
