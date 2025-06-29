import { Router } from "express";
import { health, root } from "../controllers/HealthController";

const router = Router();

// GET /health
router.get("/health", health);

// GET /
router.get("/", root);

export default router;
