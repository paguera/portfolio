import type { Request, Response } from "express";
import * as visitorsModel from "../models/visitors.model.js";

export const trackVisitor = async (req: Request, res: Response) => {
  try {
    const { visitorUuid, path, referrer } = req.body || {};
    if (!visitorUuid || typeof visitorUuid !== "string") {
      const count = await visitorsModel.getVisitorCount();
      return res.status(200).json({ success: true, count });
    }

    const userAgent = req.headers["user-agent"] || "";
    const count = await visitorsModel.recordVisitor(visitorUuid, {
      path,
      referrer,
      userAgent,
    });
    return res.status(200).json({ success: true, count });
  } catch (error) {
    console.error("Error tracking visitor:", error);
    return res.status(500).json({ message: "Erreur serveur lors du comptage" });
  }
};

export const getVisitorCount = async (_req: Request, res: Response) => {
  try {
    const count = await visitorsModel.getVisitorCount();
    return res.status(200).json({ count });
  } catch (error) {
    console.error("Error getting visitor count:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getVisitorStats = async (_req: Request, res: Response) => {
  try {
    const stats = await visitorsModel.getVisitorStats();
    return res.status(200).json(stats);
  } catch (error) {
    console.error("Error getting visitor statistics:", error);
    return res.status(500).json({ message: "Erreur serveur lors de la récupération des statistiques" });
  }
};
