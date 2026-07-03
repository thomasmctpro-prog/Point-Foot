import { getDb } from "../lib/firebaseAdmin";
import type { Match, Prediction } from "../types";

/** Exact scoreline = 3 points, correct outcome (win/draw/loss) = 1, otherwise 0. */
export function computePoints(
  pred: { homeScore: number; awayScore: number },
  actual: { homeScore: number; awayScore: number }
): number {
  if (pred.homeScore === actual.homeScore && pred.awayScore === actual.awayScore) return 3;
  const predOutcome = Math.sign(pred.homeScore - pred.awayScore);
  const actualOutcome = Math.sign(actual.homeScore - actual.awayScore);
  return predOutcome === actualOutcome ? 1 : 0;
}

/**
 * Grades any ungraded predictions whose match has finished. Matches aren't
 * persisted anywhere (they're scraped on demand), so the freshly fetched
 * list passed in here is the only source of truth for final scores.
 */
export async function gradeLeaguePredictions(leagueId: string, matches: Match[]): Promise<void> {
  const finished = new Map(
    matches
      .filter((m) => m.status === "finished" && m.homeScore !== null && m.awayScore !== null)
      .map((m) => [m.id, m])
  );
  if (finished.size === 0) return;

  const db = getDb();
  const predictionsRef = db.collection("leagues").doc(leagueId).collection("predictions");
  const snapshot = await predictionsRef.where("points", "==", null).get();
  if (snapshot.empty) return;

  const batch = db.batch();
  let hasWrites = false;

  snapshot.docs.forEach((doc) => {
    const pred = doc.data() as Prediction;
    const match = finished.get(pred.matchId);
    if (!match || match.homeScore === null || match.awayScore === null) return;
    const points = computePoints(pred, { homeScore: match.homeScore, awayScore: match.awayScore });
    batch.update(doc.ref, { points });
    hasWrites = true;
  });

  if (hasWrites) await batch.commit();
}
