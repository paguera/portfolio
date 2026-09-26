import dotenv from "dotenv";
import connect from "./config/database.js";
import express, { type Application } from "express";
import cookieParser from "cookie-parser";
import cors, { type CorsOptions } from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import errorHandler from "./middlewares/errorHandler.js";
import { colorize } from "./utils/Colorize.js";
import authRoutes from "./routes/auth.routes.js";
import projectsRoutes from "./routes/projects.routes.js";
import categoriesRoutes from "./routes/categories.routes.js";
import technologiesRoutes from "./routes/technologies.routes.js";
import ContactRoutes from "./routes/contact.routes.js";
import visitorsRoutes from "./routes/visitors.routes.js";
import { initVisitorsTable } from "./models/visitors.model.js";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for reverse proxy / Cloudflare
app.set("trust proxy", 1);

// Security headers with Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

const whitelist = [
  process.env.FRONT_URL,
  process.env.ADMIN_URL,
  "https://portfolio.paguera.fr",
  "https://paguera.fr",
  "http://nas:8080",
  "http://localhost:5002",
  "http://localhost:5003",
];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (
      !origin ||
      whitelist.includes(origin) ||
      (origin && origin.endsWith(".duckdns.org")) ||
      /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
      /^http:\/\/100\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(origin)
    ) {
      return callback(null, true);
    }
    const error: any = new Error(`Not allowed by CORS for origin: ${origin}`);
    error.status = 403;
    callback(error);
  },
  credentials: true,
};
app.use(cors(corsOptions));

// Rate Limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Trop de tentatives de connexion, veuillez réessayer dans 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: "Trop de messages envoyés, veuillez patienter avant de réessayer." },
  standardHeaders: true,
  legacyHeaders: false,
});

const visitorsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth/login", authLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/technologies", technologiesRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/visitors", visitorsLimiter, visitorsRoutes);
app.use("/api/contact", contactLimiter);
app.use("/api/", ContactRoutes);

app.use(errorHandler);

async function startServer() {
  console.log(
    colorize(
      "\n==================================================================\n                      PORTFOLIO STARTING\n==================================================================\n",
    ).magenta,
  );
  console.log(colorize("Connexion à la base de données...").yellow);
  await connect.connect();
  await initVisitorsTable().catch((err) =>
    console.error("Erreur lors de l'initialisation de la table visitors:", err)
  );
  console.log(colorize("Démarrage du serveur...").yellow);
  app.listen(PORT, () => {
    console.log(colorize("Serveur démarré").green);
  });
}
startServer();
