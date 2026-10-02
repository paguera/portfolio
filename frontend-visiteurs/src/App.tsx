import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import CategoryProjects from "./pages/CategoryProjects";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Contact from "./pages/Contact";
import Liens from "./pages/Liens";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import CV from "./pages/CV";
import Productions from "./pages/Productions";
import Artwork from "./pages/Artwork";
import { WelcomeSplash } from "./components/WelcomeSplash";
import { AudioProvider } from "./context/AudioContext";

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
    <AudioProvider>
      {showSplash && <WelcomeSplash onComplete={handleSplashComplete} />}
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="cv" element={<CV />} />
            <Route path="artwork" element={<Artwork />} />
            <Route path="music" element={<Productions />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:id" element={<ProjectDetail />} />
            <Route path="category/:slug" element={<CategoryProjects />} />
            <Route path="liens" element={<Liens />} />
            <Route path="contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </AudioProvider>
  );
}

export default App;
