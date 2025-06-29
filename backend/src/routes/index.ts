import { Router } from "express";
import summaryRoutes from "./summaryRoutes";
import contentRoutes from "./contentRoutes";
import healthRoutes from "./healthRoutes";

const router = Router();

// API routes
router.use("/api", summaryRoutes);
router.use("/api", contentRoutes);

// Health and root routes
router.use("/", healthRoutes);

export default router;
