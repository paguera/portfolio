import React, { useEffect } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import Navbar from "./Navbar";
import PrivacyNotice from "./PrivacyNotice";
import FloatingMiniPlayer from "./FloatingMiniPlayer";
import { apiFetch } from "../utils/api";

const Layout: React.FC = () => {
  const location = useLocation();

  const isSoundwavePage =
    location.pathname === "/music" ||
    location.pathname.startsWith("/productions") ||
    location.pathname.startsWith("/audio");


  useEffect(() => {
    const trackVisitor = async () => {
      try {
        let visitorUuid = localStorage.getItem("paguera_visitor_id");
        if (!visitorUuid) {
          visitorUuid = crypto.randomUUID();
          localStorage.setItem("paguera_visitor_id", visitorUuid);
        }

        await apiFetch("/visitors/track", {
          method: "POST",
          body: JSON.stringify({
            visitorUuid,
            path: location.pathname,
            referrer: document.referrer || null,
          }),
        });
      } catch (error) {
        // Silently catch tracking errors so visitor experience is unaffected
        console.error("Failed to track visitor", error);
      }
    };

    trackVisitor();
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen flex flex-col font-sans text-text-main">
      {/* Global Radiant Background Layer across all pages */}
      <div
        className="fixed inset-0 pointer-events-none -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-cyber-yellow/[0.05] via-cyber-blue/[0.05] to-purple-500/[0.07]" />
        <div className="absolute -top-32 -right-32 w-[28rem] h-[28rem] bg-cyber-yellow/25 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-32 w-[28rem] h-[28rem] bg-cyber-blue/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 right-1/4 w-[28rem] h-[28rem] bg-purple-150/20 rounded-full blur-3xl" />
      </div>

      <header className="relative bg-[#0d0f14]/95 text-white border-b border-white/10 py-4 px-4 md:px-8 flex justify-between items-center sticky top-0 z-50 shadow-xl backdrop-blur-md">
        <Navbar />
      </header>

      <main
        className={`relative z-10 grow w-full ${
          isSoundwavePage
            ? ""
            : "container mx-auto px-4 md:px-8 py-8 md:py-12"
        }`}
      >
        <Outlet />
      </main>

      <FloatingMiniPlayer />

      <footer className="relative z-10 bg-[#0d0f14]/95 text-white border-t border-white/10 py-8 px-4 md:px-8 text-center backdrop-blur-md">
        <div className="flex flex-wrap justify-center items-center gap-6 mb-4 text-[12px] tracking-[0.2em] font-black uppercase">

          <a
            href="https://github.com/paguera"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyber-yellow transition-colors"
          >
            GitHub
          </a>
          <span className="text-white/30 hidden sm:inline">|</span>
          <a
            href="https://www.linkedin.com/in/gabriel-fortier-3951a933b/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyber-yellow transition-colors"
          >
            LinkedIn
          </a>
          <span className="text-white/30 hidden sm:inline">|</span>
          <a
            href="https://youtube.com/@salepropre"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyber-yellow transition-colors"
          >
            YouTube
          </a>

          <span className="text-white/30 hidden sm:inline">|</span>
          <Link
            to="/contact"
            className="hover:text-cyber-yellow transition-colors"
          >
            Contact
          </Link>
        </div>

        <p className="opacity-60 text-[10px] tracking-[0.3em] font-black">
          &copy; {new Date().getFullYear()} PAGUERA - ALL RIGHTS RESERVED.
        </p>
      </footer>

      <PrivacyNotice />
    </div>
  );
};

export default Layout;
