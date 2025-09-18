import React from "react";
import { Routes, Route } from "react-router-dom";

// Components
import Header from "./components/Header";
import Footer from "./components/Footer";

// Pages
import Home from "./pages/Home";
import Journal from "./pages/Journal";
import DailyMood from "./pages/DailyMood";
import Community from "./pages/Community";
import Analytics from "./pages/Analytics";
import AudioJournal from "./pages/AudioJournal";
import EcoWellness from "./pages/EcoWellness";
import EmotionalWardrobe from "./pages/EmotionalWardrobe";
import FinanceOverlay from "./pages/FinanceOverlay";
import GrowthGarden from "./pages/GrowthGarden";
import GrowthPortfolio from "./pages/GrowthPortfolio";
import HandsFreeJournal from "./pages/HandsFreeJournal";
import LegacyJournal from "./pages/LegacyJournal";
import MealReflection from "./pages/MealReflection";
import MoodJournal from "./pages/MoodJournal";
import StudyFlowSync from "./pages/StudyFlowSync";
import VisionBoardPage from "./pages/VisionBoardPage";

function App() {
  return (
    <>
      <Header />
      <main style={{ padding: "1rem" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/daily-mood" element={<DailyMood />} />
          <Route path="/community" element={<Community />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/audio-journal" element={<AudioJournal />} />
          <Route path="/eco-wellness" element={<EcoWellness />} />
          <Route path="/emotional-wardrobe" element={<EmotionalWardrobe />} />
          <Route path="/finance-overlay" element={<FinanceOverlay />} />
          <Route path="/growth-garden" element={<GrowthGarden />} />
          <Route path="/growth-portfolio" element={<GrowthPortfolio />} />
          <Route path="/handsfree-journal" element={<HandsFreeJournal />} />
          <Route path="/legacy-journal" element={<LegacyJournal />} />
          <Route path="/meal-reflection" element={<MealReflection />} />
          <Route path="/mood-journal" element={<MoodJournal />} />
          <Route path="/studyflow-sync" element={<StudyFlowSync />} />
          <Route path="/vision-board" element={<VisionBoardPage />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;
