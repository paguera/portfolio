import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex items-center gap-4">
      {isAuthenticated ? (
        <div className="flex items-center gap-3">
          <a
            href="https://paguera.fr"
            target="_blank"
            rel="noreferrer"
            className="text-text-muted hover:text-cyber-yellow text-xs font-mono font-bold uppercase transition-colors hidden sm:inline-flex items-center gap-1"
          >
            <span>Site public</span> ↗
          </a>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 border border-red-500/40 bg-red-950/30 text-red-400 hover:bg-red-500 hover:text-white text-xs font-mono font-bold tracking-wider uppercase transition-all cursor-pointer rounded-sm"
          >
            [ SIGNOFF ]
          </button>
        </div>
      ) : (
        <Link
          to="/"
          className="text-cyber-yellow hover:underline transition-colors font-mono font-bold text-xs uppercase tracking-wider"
        >
          [ LOGIN ]
        </Link>
      )}
    </div>
  );
};

export default Navbar;
