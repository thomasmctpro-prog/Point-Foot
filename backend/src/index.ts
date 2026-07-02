import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import matchesRouter from "./routes/matches";
import newsRouter from "./routes/news";

dotenv.config();

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/matches", matchesRouter);
app.use("/api/news", newsRouter);

app.listen(port, () => {
  console.log(`FootyPredict backend listening on http://localhost:${port}`);
});
