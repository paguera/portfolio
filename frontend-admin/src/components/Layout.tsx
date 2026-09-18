import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const Layout = () => {
  return (
    <div className="min-h-screen text-text-main font-sans selection:bg-secondary selection:text-bg-main">
      <header className="bg-primary border-b border-border-subtle p-6 flex justify-between items-center">
        <div className="text-2xl font-black text-black uppercase tracking-tighter">
          Portfolio Admin
        </div>
        <Navbar />
      </header>
      <main className="max-w-7xl mx-auto p-6 md:p-12">
        <Outlet />
      </main>
      <footer className="border-t border-border-subtle p-8 bg-bg-panel text-center text-xs uppercase tracking-widest text-white">
        &copy; 2026 Admin_Terminal // All Rights Reserved
      </footer>
    </div>
  );
};

export default Layout;
