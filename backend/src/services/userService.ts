import type { DecodedIdToken } from "firebase-admin/auth";
import { getDb } from "../lib/firebaseAdmin";

export async function ensureUserProfile(decoded: DecodedIdToken): Promise<void> {
  const db = getDb();
  await db
    .collection("users")
    .doc(decoded.uid)
    .set(
      {
        displayName: decoded.name ?? decoded.email ?? "Joueur",
        email: decoded.email ?? null,
      },
      { merge: true }
    );
}

export async function getDisplayNames(uids: string[]): Promise<Record<string, string>> {
  if (uids.length === 0) return {};
  const db = getDb();
  const refs = uids.map((uid) => db.collection("users").doc(uid));
  const snapshots = await db.getAll(...refs);

  const result: Record<string, string> = {};
  snapshots.forEach((snap, i) => {
    result[uids[i]] = (snap.data()?.displayName as string | undefined) ?? "Joueur";
  });
  return result;
}
