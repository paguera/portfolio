import { Outlet, Link } from "react-router-dom";
import Navbar from "./Navbar";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans text-text-main selection:bg-cyber-yellow selection:text-black">
      <header className="bg-cyber-cyan text-white border-b-4 border-bg-main py-4 px-4 md:px-8 flex justify-between items-center sticky top-0 z-50 shadow-xl">
        <Link
          to="/admin"
          className="flex items-center gap-3 group"
          aria-label="Accueil - Portfolio Admin"
        >
          <img
            alt="Logo Paguera"
            src="/LOGO.avif"
            width="44"
            height="44"
            className="rounded-full w-9 md:w-11 border-2 border-white/30 group-hover:scale-105 transition-transform shadow-md"
          />
          <div className="flex items-center gap-2">
            <span className="text-lg md:text-2xl font-black tracking-tighter uppercase leading-none text-white">
              Paguera
            </span>
            <span className="text-[10px] font-mono font-black text-cyber-yellow uppercase tracking-widest px-2 py-0.5 border border-cyber-yellow/40 bg-cyber-yellow/10 rounded">
              ADMIN
            </span>
          </div>
        </Link>
        <Navbar />
      </header>

      <main className="grow max-w-7xl w-full mx-auto p-4 md:p-8">
        <Outlet />
      </main>

      <footer className="relative bg-cyber-cyan text-white border-t-4 border-bg-main py-6 px-4 md:px-8 text-center font-mono">
        <div className="flex flex-wrap justify-center items-center gap-6 mb-3 text-[11px] tracking-[0.2em] font-black uppercase">
          <a
            href="https://paguera.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyber-yellow transition-colors"
          >
            Site Vitrine ↗
          </a>
          <span className="text-white/20 hidden sm:inline">|</span>
          <a
            href="https://github.com/paguera"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyber-yellow transition-colors"
          >
            GitHub ↗
          </a>
        </div>
        <p className="opacity-50 text-[10px] tracking-[0.3em] font-black uppercase">
          &copy; {new Date().getFullYear()} PAGUERA ADMIN // ALL RIGHTS RESERVED
        </p>
      </footer>
    </div>
  );
};

export default Layout;
