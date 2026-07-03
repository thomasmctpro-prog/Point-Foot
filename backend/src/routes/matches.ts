import { Router } from "express";
import { getMatchesCachedOrLive } from "../services/matchesService";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const { matches, source } = await getMatchesCachedOrLive();
    res.json({ matches, source });
  } catch (err) {
    res.status(503).json({ error: "Scores indisponibles pour le moment.", detail: (err as Error).message });
  }
});

export default router;
