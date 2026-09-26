import { Router } from "express";
import * as visitorsController from "../controllers/visitors.controller.js";
import authenticate from "../middlewares/authenticate.js";
import authorize from "../middlewares/authorize.js";

const router = Router();

// Public route for logging visits
router.post("/track", visitorsController.trackVisitor);

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
