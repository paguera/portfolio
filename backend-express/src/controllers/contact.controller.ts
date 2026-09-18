import sendEmail from "../services/contact.service.js";
import type { Request, Response } from "express";
import sanitizeHtml from "sanitize-html";
import AppError from "../errors/AppError.js";

export const contact = async (req: Request, res: Response) => {
  const { name, sender, object, message, html } = req.body;

  if (!name || !sender || !message) {
    throw new AppError("Veuillez remplir tous les champs obligatoires (nom, email, message)", 400);
  }

  // Basic email regex validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sender)) {
    throw new AppError("Adresse email invalide", 400);
  }

  // Sanitize all inputs
  const cleanName = sanitizeHtml(String(name).trim(), { allowedTags: [], allowedAttributes: {} });
  const cleanSender = sanitizeHtml(String(sender).trim(), { allowedTags: [], allowedAttributes: {} });
  const cleanObject = sanitizeHtml(String(object || "Nouveau message depuis le portfolio").trim(), { allowedTags: [], allowedAttributes: {} });
  const cleanMessage = sanitizeHtml(String(message).trim(), { allowedTags: [], allowedAttributes: {} });
  const cleanHtml = html
    ? sanitizeHtml(String(html), {
        allowedTags: ["b", "i", "em", "strong", "a", "p", "ul", "ol", "li", "br", "u", "span"],
        allowedAttributes: {
          a: ["href", "target", "rel"],
          span: ["style"],
        },
      })
    : cleanMessage.replace(/\n/g, "<br>");

  await sendEmail({
    name: cleanName,
    email: process.env.MAIL_TO,
    sender: cleanSender,
    object: cleanObject,
    message: cleanMessage,
    html: cleanHtml,
  });

  res.status(200).json({ message: "Email envoyé" });
};

export default contact;
