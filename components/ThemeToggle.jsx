import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiSun, FiMoon } from 'react-icons/fi';

const ThemeToggle = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  };

  return (
    <button 
      onClick={toggleTheme} 
      className="fixed top-8 right-8 z-50 p-3 rounded-full bg-pastel-card dark:bg-dark-card shadow-lg hover:shadow-xl transition-all"
    >
      <motion.div
        initial={false}
        animate={{ rotate: darkMode ? 180 : 0 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        {darkMode ? <FiMoon className="text-dark-accent text-xl" /> : <FiSun className="text-amber-400 text-xl" />}
      </motion.div>
    </button>
  );
};

export default ThemeToggle;