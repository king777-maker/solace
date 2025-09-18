import React, { useEffect } from "react";

// Assuming you have renamed your files to remove spaces,
// these import paths will now work correctly.
// For example:
// "mental health.jpg" -> "mental-health.jpg"
// "study and focus.jpg" -> "study-and-focus.jpg"
// "legal .jpg" -> "legal.jpg"
import legalImage from '../assets/images/legal.jpg';
import mentalHealthImage from '../assets/images/mental health.jpg';
import musicImage from '../assets/images/music.jpg';
import peaceImage from '../assets/images/peace.jpg';
import studyAndFocusImage from '../assets/images/study and focus.jpg';
import wardrobeImage from '../assets/images/wardrobe.jpg';

const sections = [
  { id: "home", title: "Welcome to Solace 🌱", tagline: "Your wellbeing companion", image: peaceImage },
  { id: "journal", title: "Journal", tagline: "Your thoughts, your space.", image: "https://source.unsplash.com/random/1920x1080/?journal,writing" },
  { id: "daily-mood", title: "Daily Mood", tagline: "Track your emotional journey.", image: mentalHealthImage },
  { id: "community", title: "Community", tagline: "Connect with others who care.", image: "https://source.unsplash.com/random/1920x1080/?community,connection" },
  { id: "analytics", title: "Analytics", tagline: "Gain insights into your wellbeing.", image: "https://source.unsplash.com/random/1920x1080/?analytics,data" },
  { id: "audio-journal", title: "Audio Journal", tagline: "Speak your mind freely.", image: musicImage },
  { id: "eco-wellness", title: "Eco Wellness", tagline: "Connect with nature, connect with yourself.", image: "https://source.unsplash.com/random/1920x1080/?nature,forest" },
  { id: "emotional-wardrobe", title: "Emotional Wardrobe", tagline: "Dress for how you feel.", image: wardrobeImage },
  { id: "finance-overlay", title: "Finance Overlay", tagline: "Understand the link between finance and mood.", image: "https://source.unsplash.com/random/1920x1080/?finance,graphs" },
  { id: "growth-garden", title: "Growth Garden", tagline: "Watch your habits grow.", image: "https://source.unsplash.com/random/1920x1080/?gardening,plants" },
  { id: "growth-portfolio", title: "Growth Portfolio", tagline: "A holistic view of your progress.", image: "https://source.unsplash.com/random/1920x1080/?portfolio,progress" },
  { id: "handsfree-journal", title: "Hands-Free Journal", tagline: "Journal with your voice.", image: "https://source.unsplash.com/random/1920x1080/?person,speaking" },
  { id: "legacy-journal", title: "Legacy Journal", tagline: "A record of your journey.", image: legalImage },
  { id: "meal-reflection", title: "Meal Reflection", tagline: "Mindful eating for mindful living.", image: "https://source.unsplash.com/random/1920x1080/?food,eating" },
  { id: "mood-journal", title: "Mood Journal", tagline: "A simple way to track your mood.", image: "https://source.unsplash.com/random/1920x1080/?journal,emotions" },
  { id: "studyflow-sync", title: "StudyFlow Sync", tagline: "Optimize your study sessions.", image: studyAndFocusImage },
  { id: "vision-board", title: "Vision Board", tagline: "Visualize your goals.", image: "https://source.unsplash.com/random/1920x1080/?vision,board" },
];

const Home = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
          } else {
            entry.target.classList.remove("in-view");
          }
        });
      },
      {
        threshold: 0.5,
      }
    );

    const featureSections = document.querySelectorAll(".feature-section");
    featureSections.forEach((section) => observer.observe(section));

    return () => {
      featureSections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  return (
    <div className="home-container">
      <style>{`
        .home-container {
          font-family: 'Inter', sans-serif;
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          scroll-behavior: smooth;
        }
        .feature-section {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 1s ease-in-out, transform 1s ease-in-out;
        }
        .feature-section.in-view {
          opacity: 1;
          transform: translateY(0);
        }
        .content {
          text-align: center;
          color: #fff;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
          background-color: rgba(0, 0, 0, 0.4);
          padding: 2rem;
          border-radius: 12px;
        }
        .content h1 {
          font-size: 3rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }
        .content p {
          font-size: 1.2rem;
          font-weight: 300;
        }
        @media (max-width: 768px) {
          .content h1 {
            font-size: 2rem;
          }
          .content p {
            font-size: 1rem;
          }
        }
      `}</style>
      {sections.map((section) => (
        <div
          key={section.id}
          id={section.id}
          className="feature-section"
          style={{ backgroundImage: `url(${section.image})` }}
        >
          <div className="content">
            <h1>{section.title}</h1>
            <p>{section.tagline}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Home;
