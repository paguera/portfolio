import { Router } from "express";
import * as visitorsController from "../controllers/visitors.controller.js";
import authenticate from "../middlewares/authenticate.js";
import authorize from "../middlewares/authorize.js";

const router = Router();

// Public routes for logging visits & audio track listens
router.post("/track", visitorsController.trackVisitor);
router.post("/track-audio", visitorsController.trackAudioPlay);

// Protected admin routes for retrieving analytics
router.get(
  "/stats",
  authenticate,
  authorize(["admin"]),
  visitorsController.getVisitorStats
);

router.get(
  "/count",
  authenticate,
  authorize(["admin"]),
  visitorsController.getVisitorCount
);

export default router;
