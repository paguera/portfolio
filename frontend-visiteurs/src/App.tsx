import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import CategoryProjects from "./pages/CategoryProjects";
import Contact from "./pages/Contact";
import Liens from "./pages/Liens";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import Productions from "./pages/Productions";
import { WelcomeSplash } from "./components/WelcomeSplash";

function App() {
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window !== "undefined") {
      const pathname = window.location.pathname;
      return pathname === "/" || pathname === "";
    }
    return false;
  });

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    <>
      {showSplash && <WelcomeSplash onComplete={handleSplashComplete} />}
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="music" element={<Productions />} />
            <Route path="category/:slug" element={<CategoryProjects />} />
            <Route path="liens" element={<Liens />} />
            <Route path="contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
