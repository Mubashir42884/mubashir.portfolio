"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import ThemeToggle from '@/components/ThemeToggle';
import ScholarFeed from '@/components/ScholarFeed';
import Unpublished from '@/components/Unpublished';
import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react'; // Added for About icon consistency

export default function Home() {
  const [activeSection, setActiveSection] = useState('about');

  // Animation settings
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  // 1. SCROLL SPY: Detects which section is visible as you scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['about', 'publications', 'unpublished', 'interests'];
      
      // Calculate which section is currently in view
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          // If the section is near the top of the viewport (within 150px)
          if (rect.top >= -100 && rect.top <= 250) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 2. NAVIGATION: Handles smooth scrolling when Sidebar links are clicked
  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      // Offset position for fixed header/sidebar if needed
      const offset = 40; 
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-pastel-bg dark:bg-dark-bg transition-colors duration-500">
      
      {/* Floating Theme Toggle (Top Right) */}
      <ThemeToggle />

      {/* Sidebar: Now receives props to control navigation */}
      <Sidebar 
        activeSection={activeSection} 
        scrollToSection={scrollToSection} 
      />
      
      {/* Main Content Area */}
      <main className="pl-0 md:pl-80 transition-all duration-500">
        <div className="max-w-4xl mx-auto px-12 py-16 space-y-16">
          
          {/* --- ABOUT SECTION --- */}
          <motion.section 
            id="about" 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }}
            variants={sectionVariants}
          >
            {/* Added container for consistent "Card" look */}
            <div className="bg-white/80 dark:bg-white/5 p-8 rounded-2xl shadow-sm border border-pastel-accent/20 backdrop-blur-sm transition-colors duration-500">
                <h2 className="text-3xl font-bold mb-6 text-pastel-accent dark:text-dark-accent flex items-center gap-3">
                    <GraduationCap className="w-8 h-8" />
                    About Me
                </h2>
                <p className="text-xl leading-relaxed opacity-90 font-serif text-gray-700 dark:text-gray-200">
                I am a Master of Computer Science student at <b>Dalhousie University</b>, currently navigating the intersection of Artificial Intelligence, Machine Learning, and Healthcare. My research focuses on making AI interpretable and trustworthy, specifically in the context of data privacy and medical diagnostics.
                </p>
                <p className="text-xl leading-relaxed opacity-90 mt-4 font-serif text-gray-700 dark:text-gray-200">
                I am passionate about Python, Data Analysis, and developing robust statistical models to solve real-world problems.
                </p>
            </div>
          </motion.section>

          {/* --- PUBLICATIONS SECTION --- */}
          <motion.section 
            id="publications"
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }}
            variants={sectionVariants}
          >
            <h2 className="text-3xl font-bold mb-8 text-pastel-accent dark:text-dark-accent flex items-center gap-2">
              Publications
              <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full font-sans font-normal ml-2">
                Auto-Updated from Google Scholar
              </span>
            </h2>
            <ScholarFeed />
          </motion.section>

          {/* --- UNPUBLISHED WORKS --- */}
          <motion.section 
            id="unpublished"
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }}
            variants={sectionVariants}
          >
            <h2 className="text-3xl font-bold mb-6 text-pastel-accent dark:text-dark-accent">
                Unpublished Works & Pre-prints
            </h2>
            <div className="bg-white/80 dark:bg-white/5 p-6 rounded-2xl shadow-sm border border-pastel-accent/20 backdrop-blur-sm">
               <Unpublished />
            </div>
          </motion.section>

           {/* --- RESEARCH INTERESTS --- */}
           <motion.section 
            id="interests"
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }}
            variants={sectionVariants}
          >
            <h2 className="text-3xl font-bold mb-6 text-pastel-accent dark:text-dark-accent">
                Research Interests
            </h2>
            <div className="flex flex-wrap gap-3">
              {['Artificial Intelligence', 'Machine Learning', 'Healthcare AI', 'Cybersecurity','Data Privacy', 'Medical Imaging', 'Cancer Diagnosis', 'Statistical Analysis', 'Interpretability'].map(tag => (
                <span key={tag} className="px-5 py-2 bg-pastel-accent/10 dark:bg-dark-accent/10 border border-pastel-accent/20 dark:border-dark-accent/20 text-pastel-accent dark:text-dark-accent rounded-full text-base font-serif font-medium hover:scale-105 transition-transform cursor-default">
                  {tag}
                </span>
              ))}
            </div>
          </motion.section>

        </div>
      </main>
    </div>
  );
}