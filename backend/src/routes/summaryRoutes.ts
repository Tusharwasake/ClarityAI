import { Router } from "express";
import { summarize } from "../controllers/SummaryController";

const router = Router();

// POST /api/summarize
router.post("/summarize", summarize);

export default router;
