import type { NextFunction, Request, Response } from "express";
import { getAdminAuth } from "../lib/firebaseAdmin";
import { ensureUserProfile } from "../services/userService";

export interface AuthedRequest extends Request {
  uid?: string;
}

export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: "Connexion requise." });
    return;
  }

  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    req.uid = decoded.uid;
    await ensureUserProfile(decoded);
    next();
  } catch (err) {
    res.status(401).json({ error: "Session invalide, reconnecte-toi.", detail: (err as Error).message });
  }
}
