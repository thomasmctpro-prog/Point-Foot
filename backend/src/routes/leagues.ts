import { randomBytes } from "crypto";
import { Router, type Response } from "express";
import { FieldValue } from "firebase-admin/firestore";
import { getDb } from "../lib/firebaseAdmin";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { getMatchesCachedOrLive } from "../services/matchesService";
import { gradeLeaguePredictions } from "../services/grading";
import { getDisplayNames } from "../services/userService";
import type { League, Match, Prediction } from "../types";

const router = Router();
router.use(requireAuth);

async function generateUniqueInviteCode(): Promise<string> {
  const db = getDb();
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomBytes(4).toString("hex").slice(0, 6).toUpperCase();
    const existing = await db.collection("leagues").where("inviteCode", "==", code).limit(1).get();
    if (existing.empty) return code;
  }
  throw new Error("Impossible de générer un code d'invitation unique, réessaie.");
}

async function loadLeagueOrFail(leagueId: string, uid: string, res: Response) {
  const db = getDb();
  const ref = db.collection("leagues").doc(leagueId);
  const doc = await ref.get();
  if (!doc.exists) {
    res.status(404).json({ error: "Ligue introuvable." });
    return null;
  }
  const league = { id: doc.id, ...(doc.data() as Omit<League, "id">) };
  if (!league.memberIds.includes(uid)) {
    res.status(403).json({ error: "Tu ne fais pas partie de cette ligue." });
    return null;
  }
  return { ref, league };
}

router.post("/", async (req: AuthedRequest, res) => {
  const name = String(req.body?.name ?? "").trim();
  if (!name || name.length > 60) {
    res.status(400).json({ error: "Nom de ligue invalide (1 à 60 caractères)." });
    return;
  }

  const uid = req.uid!;
  const inviteCode = await generateUniqueInviteCode();
  const db = getDb();

  const ref = await db.collection("leagues").add({
    name,
    ownerId: uid,
    inviteCode,
    memberIds: [uid],
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({ id: ref.id, name, ownerId: uid, inviteCode, memberIds: [uid] });
});

router.post("/join", async (req: AuthedRequest, res) => {
  const code = String(req.body?.code ?? "").trim().toUpperCase();
  if (!code) {
    res.status(400).json({ error: "Code d'invitation requis." });
    return;
  }

  const uid = req.uid!;
  const db = getDb();
  const snapshot = await db.collection("leagues").where("inviteCode", "==", code).limit(1).get();
  if (snapshot.empty) {
    res.status(404).json({ error: "Aucune ligue ne correspond à ce code." });
    return;
  }

  const doc = snapshot.docs[0];
  const league = doc.data() as Omit<League, "id">;
  if (!league.memberIds.includes(uid)) {
    await doc.ref.update({ memberIds: FieldValue.arrayUnion(uid) });
  }

  res.json({ id: doc.id, name: league.name, ownerId: league.ownerId });
});

router.get("/mine", async (req: AuthedRequest, res) => {
  const uid = req.uid!;
  const db = getDb();
  const snapshot = await db.collection("leagues").where("memberIds", "array-contains", uid).get();
  const leagues = snapshot.docs.map((doc) => {
    const data = doc.data() as Omit<League, "id">;
    return { id: doc.id, name: data.name, ownerId: data.ownerId, memberCount: data.memberIds.length };
  });
  res.json({ leagues });
});

router.get("/:id", async (req: AuthedRequest, res) => {
  const uid = req.uid!;
  const leagueId = String(req.params.id);
  const loaded = await loadLeagueOrFail(leagueId, uid, res);
  if (!loaded) return;
  const { league } = loaded;

  try {
    const { matches } = await getMatchesCachedOrLive();
    await gradeLeaguePredictions(league.id, matches);
  } catch {
    // best-effort: leaderboard still returns with whatever's already graded
  }

  const db = getDb();
  const predictionsSnap = await db.collection("leagues").doc(league.id).collection("predictions").get();
  const totals = new Map<string, number>(league.memberIds.map((memberId) => [memberId, 0]));
  predictionsSnap.docs.forEach((d) => {
    const pred = d.data() as Prediction;
    if (typeof pred.points === "number") {
      totals.set(pred.userId, (totals.get(pred.userId) ?? 0) + pred.points);
    }
  });

  const names = await getDisplayNames(league.memberIds);
  const members = league.memberIds
    .map((memberId) => ({
      uid: memberId,
      displayName: names[memberId] ?? "Joueur",
      totalPoints: totals.get(memberId) ?? 0,
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints);

  res.json({ id: league.id, name: league.name, ownerId: league.ownerId, inviteCode: league.inviteCode, members });
});

router.get("/:id/predictions", async (req: AuthedRequest, res) => {
  const uid = req.uid!;
  const leagueId = String(req.params.id);
  const loaded = await loadLeagueOrFail(leagueId, uid, res);
  if (!loaded) return;

  const { matches } = await getMatchesCachedOrLive().catch(() => ({ matches: [] as Match[] }));
  const statusByMatch = new Map(matches.map((m) => [m.id, m.status]));

  const db = getDb();
  const snapshot = await db.collection("leagues").doc(leagueId).collection("predictions").get();
  const predictions = snapshot.docs
    .map((d) => d.data() as Prediction)
    .filter((p) => p.userId === uid || statusByMatch.get(p.matchId) !== "scheduled");

  res.json({ predictions });
});

router.post("/:id/predictions", async (req: AuthedRequest, res) => {
  const uid = req.uid!;
  const leagueId = String(req.params.id);
  const loaded = await loadLeagueOrFail(leagueId, uid, res);
  if (!loaded) return;

  const matchId = String(req.body?.matchId ?? "");
  const homeScore = Number(req.body?.homeScore);
  const awayScore = Number(req.body?.awayScore);

  const validScore = (n: number) => Number.isInteger(n) && n >= 0 && n <= 20;
  if (!matchId || !validScore(homeScore) || !validScore(awayScore)) {
    res.status(400).json({ error: "Pronostic invalide." });
    return;
  }

  const { matches } = await getMatchesCachedOrLive();
  const match = matches.find((m) => m.id === matchId);
  if (!match) {
    res.status(404).json({ error: "Match introuvable." });
    return;
  }
  if (match.status !== "scheduled") {
    res.status(409).json({ error: "Le match a déjà commencé, pronostic fermé." });
    return;
  }

  const db = getDb();
  const predictionId = `${uid}_${matchId}`;
  const prediction: Prediction = {
    id: predictionId,
    leagueId,
    userId: uid,
    matchId,
    competition: match.competition,
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    homeScore,
    awayScore,
    points: null,
    createdAt: new Date().toISOString(),
  };

  await db.collection("leagues").doc(leagueId).collection("predictions").doc(predictionId).set(prediction);
  res.json(prediction);
});

export default router;
