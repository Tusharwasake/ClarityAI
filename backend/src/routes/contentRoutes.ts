import { Router } from "express";
import { extract } from "../controllers/ContentController";

const router = Router();

// POST /api/extract
router.post("/extract", extract);

export default router;
