import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Navbar = () => {
  const { isAuthenticated, isAdmin, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-4 items-center border-bg-main/20 md:border-t-0 md:border-bg-main pt-8 md:pt-0 md:pl-8 w-full md:w-auto">
      {isAuthenticated ? (
        <>
          {isAdmin && (
            <Link to="/admin" className="text-black hover:opacity-70">
              Admin
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="text-black font-black tracking-tighter"
          >
            [ SIGNOFF ]
          </button>
        </>
      ) : (
        <Link
          to="/"
          className="text-black transition-colors font-black tracking-tighter"
        >
          [ LOGIN ]
        </Link>
      )}
    </div>
  );
};
export default Navbar;
