import React, { useEffect, useState, useRef } from "react";
import { NavLink, Link } from "react-router-dom";
import { apiFetch } from "../utils/api";

interface Category {
  id: number;
  name: string;
}

const Navbar: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await apiFetch<Category[]>("/categories");
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    fetchCategories();
  }, []);

  // Ferme le dropdown au clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `hover:text-cyber-yellow transition-colors w-full md:w-auto text-center ${
      isActive ? "text-cyber-yellow underline decoration-2 underline-offset-8" : "text-white"
    }`;

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
        {/* Utilisation de UL / LI pour une meilleure sémantique HTML */}
        <ul className="flex flex-col md:flex-row gap-8 md:gap-8 items-center list-none w-full md:w-auto">

          {/* DÉVELOPPEMENT Dropdown (Uniquement au Clic) */}
          <li
            ref={dropdownRef}
            className="relative w-full md:w-auto flex flex-col items-center md:block"
          >
            <button
              className="hover:text-cyber-yellow flex items-center gap-1 transition-colors w-full md:w-auto justify-center md:justify-start font-black uppercase text-white cursor-pointer select-none"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-haspopup="true"
              aria-expanded={isDropdownOpen}
            >
              DEV {isDropdownOpen ? "↑" : "↓"}
            </button>

            {isDropdownOpen && (
              <ul className="md:absolute md:left-0 mt-4 md:mt-2 w-full md:w-56 bg-[#0d1527]/95 backdrop-blur-xl text-white border border-white/20 rounded-xl shadow-2xl py-2 z-50 flex flex-col list-none overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {categories.length > 0 ? (
                  categories.map((cat) => (

                    <li key={cat.id}>
                      <NavLink
                        to={`/category/${cat.name.toLowerCase()}`}
                        className={({ isActive }) =>
                          `block px-6 py-3.5 md:px-4 md:py-2.5 hover:bg-white/10 hover:text-cyber-yellow transition-colors text-center md:text-left border-b border-white/5 last:border-0 font-bold ${
                            isActive ? "bg-white/15 text-cyber-yellow font-black" : "text-gray-200"
                          }`
                        }
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setIsMenuOpen(false);
                        }}
                      >
                        {cat.name}
                      </NavLink>
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-3 text-xs italic opacity-60 text-center">
                    Aucune catégorie
                  </li>
                )}
              </ul>
            )}
          </li>
          <li>
            <NavLink
              to="/music"
              className={navLinkClass}
              onClick={() => setIsMenuOpen(false)}
            >
              Music
            </NavLink>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default Navbar;
