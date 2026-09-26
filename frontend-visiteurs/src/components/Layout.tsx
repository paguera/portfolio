import React, { useEffect } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import Navbar from "./Navbar";
import PrivacyNotice from "./PrivacyNotice";
import { apiFetch } from "../utils/api";

const Layout: React.FC = () => {
  const location = useLocation();

  const isSoundwavePage =
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
    <div className="min-h-screen flex flex-col font-sans text-text-main">
      <header className="bg-cyber-cyan text-white border-b-4 border-bg-main py-4 px-4 md:px-8 flex justify-between items-center sticky top-0 z-50 shadow-xl">
        <Navbar />
      </header>

      <main
        className={`grow w-full ${
          isSoundwavePage
            ? ""
            : "container mx-auto px-4 md:px-8 py-8 md:py-12"
        }`}
      >
        <Outlet />
      </main>

      <footer className="relative bg-cyber-cyan text-white border-t-4 border-bg-main py-8 px-4 md:px-8 text-center">
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
