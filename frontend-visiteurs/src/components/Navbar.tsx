import React, { useEffect, useState, useRef } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";

const Navbar: React.FC = () => {
  const [isCreativeDropdownOpen, setIsCreativeDropdownOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const creativeDropdownRef = useRef<HTMLLIElement>(null);
  const location = useLocation();

  // Ferme le dropdown au clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        creativeDropdownRef.current &&
        !creativeDropdownRef.current.contains(target)
      ) {
        setIsCreativeDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fermer les dropdowns quand l'URL change
  useEffect(() => {
    setIsCreativeDropdownOpen(false);
    setIsMenuOpen(false);
  }, [location.pathname]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `hover:text-cyber-yellow transition-colors w-full md:w-auto text-center ${
      isActive ? "text-cyber-yellow underline decoration-2 underline-offset-8" : "text-white"
    }`;

  const isDevActive =
    location.pathname === "/projects" ||
    (location.pathname.startsWith("/category/") && !location.pathname.includes("devops"));

  const isCreativeActive =
    location.pathname === "/artwork" || location.pathname === "/music";

  return (
    <>
      <div className="flex items-center gap-4">
        <Link
          to="/"
          className="flex items-center gap-3 group"
          onClick={() => setIsMenuOpen(false)}
          aria-label="Accueil - Portfolio Paguera"
        >
          <img
            alt="Logo Paguera"
            src="/LOGO.avif"
            width="48"
            height="48"
            className="rounded-full w-10 md:w-12 border-2 border-white/30 group-hover:scale-110 transition-transform shadow-md"
          />
          <span className="text-lg md:text-2xl font-black tracking-tighter uppercase leading-none text-white">
            Paguera
          </span>
        </Link>
      </div>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden text-white hover:text-cyber-yellow p-2 font-black z-50 transition-colors cursor-pointer"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle menu"
      >
        {isMenuOpen ? "CLOSE" : "MENU"}
      </button>

      <nav
        className={`
        fixed md:relative top-0 left-0 w-full md:w-auto h-screen md:h-auto
        bg-bg-main md:bg-transparent flex flex-col md:flex-row items-center justify-center md:justify-end
        uppercase text-xl md:text-sm font-black tracking-widest p-12 md:p-0
        transition-transform duration-300 z-40 text-white shadow-2xl md:shadow-none
        ${isMenuOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}
        `}
      >
        <ul className="flex flex-col md:flex-row gap-8 md:gap-8 items-center list-none w-full md:w-auto">
          {/* ACCUEIL */}
          <li>
            <NavLink to="/" className={navLinkClass}>
              Accueil
            </NavLink>
          </li>

          {/* DÉVELOPPEMENT (Lien direct vers /projects) */}
          <li>
            <NavLink
              to="/projects"
              className={({ isActive }) =>
                `hover:text-cyber-yellow transition-colors w-full md:w-auto text-center ${
                  isActive || isDevActive
                    ? "text-cyber-yellow underline decoration-2 underline-offset-8"
                    : "text-white"
                }`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              DEV
            </NavLink>
          </li>

          {/* DEVOPS */}
          <li>
            <NavLink
              to="/category/devops"
              className={navLinkClass}
              onClick={() => setIsMenuOpen(false)}
            >
              DEVOPS
            </NavLink>
          </li>

          {/* LAB CRÉATIF Dropdown */}
          <li
            ref={creativeDropdownRef}
            className="relative w-full md:w-auto flex flex-col items-center md:block"
          >
            <button
              className={`hover:text-cyber-yellow flex items-center gap-1 transition-colors w-full md:w-auto justify-center md:justify-start font-black uppercase cursor-pointer select-none ${
                isCreativeActive ? "text-cyber-yellow" : "text-white"
              }`}
              onClick={() => {
                setIsCreativeDropdownOpen(!isCreativeDropdownOpen);
              }}
              aria-haspopup="true"
              aria-expanded={isCreativeDropdownOpen}
            >
              LAB CRÉATIF {isCreativeDropdownOpen ? "↑" : "↓"}
            </button>

            {isCreativeDropdownOpen && (
              <ul className="md:absolute md:right-0 mt-4 md:mt-2 w-full md:w-60 bg-[#1f2128]/95 backdrop-blur-xl text-white border border-white/20 rounded-xl shadow-2xl py-2 z-50 flex flex-col list-none overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <li>
                  <NavLink
                    to="/artwork"
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-6 py-3.5 md:px-4 md:py-2.5 hover:bg-white/10 hover:text-cyber-yellow transition-colors text-center md:text-left border-b border-white/5 font-bold ${
                        isActive ? "bg-white/15 text-cyber-yellow font-black" : "text-gray-200"
                      }`
                    }
                    onClick={() => {
                      setIsCreativeDropdownOpen(false);
                      setIsMenuOpen(false);
                    }}
                  >
                    <span>Galerie d'Art</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/music"
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-6 py-3.5 md:px-4 md:py-2.5 hover:bg-white/10 hover:text-cyber-yellow transition-colors text-center md:text-left font-bold ${
                        isActive ? "bg-white/15 text-cyber-yellow font-black" : "text-gray-200"
                      }`
                    }
                    onClick={() => {
                      setIsCreativeDropdownOpen(false);
                      setIsMenuOpen(false);
                    }}
                  >
                    <span>Musique</span>
                  </NavLink>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </nav>
    </>
  );
};

export default Navbar;
