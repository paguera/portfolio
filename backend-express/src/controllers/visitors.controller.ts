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

    // Extract client IP address from proxy headers or socket
    const rawIp =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      (req.headers["x-real-ip"] as string)?.trim() ||
      req.ip ||
      req.socket.remoteAddress ||
      "127.0.0.1";

    const ip = rawIp.replace(/^::ffff:/, "");

    const count = await visitorsModel.recordVisitor(visitorUuid, {
      path,
      referrer,
      userAgent,
      ip,
    });
    return res.status(200).json({ success: true, count });
  } catch (error) {
    console.error("Error tracking visitor:", error);
    return res.status(500).json({ message: "Erreur serveur lors du comptage" });
  }
};

export const trackAudioPlay = async (req: Request, res: Response) => {
  try {
    const { visitorUuid, trackId, trackTitle, trackArtist, playlist } = req.body || {};
    if (!trackTitle || typeof trackTitle !== "string") {
      return res.status(400).json({ message: "trackTitle requis" });
    }

    const rawIp =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      (req.headers["x-real-ip"] as string)?.trim() ||
      req.ip ||
      req.socket.remoteAddress ||
      "127.0.0.1";

    const ip = rawIp.replace(/^::ffff:/, "");

    await visitorsModel.recordAudioPlay(visitorUuid || "anonymous", {
      trackId: trackId || "unknown",
      trackTitle,
      trackArtist: trackArtist || "Paguera",
      playlist: playlist || "Général",
      ip,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error tracking audio play:", error);
    return res.status(500).json({ message: "Erreur serveur" });
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
