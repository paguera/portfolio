import { Router } from "express";
import * as visitorsController from "../controllers/visitors.controller.js";

const router = Router();

router.get("/count", visitorsController.getVisitorCount);
router.post("/track", visitorsController.trackVisitor);

export default router;
