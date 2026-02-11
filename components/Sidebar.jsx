import Image from 'next/image';
import { FaGithub, FaLinkedin, FaGraduationCap, FaOrcid, FaRss, FaRssSquare } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Sidebar = ({ activeSection, scrollToSection }) => {
  const navItems = [
    { name: 'About', id: 'about' },
    { name: 'Publications', id: 'publications' },
    { name: 'Unpublished Works', id: 'unpublished' },
    { name: 'Research Interests', id: 'interests' },
  ];

  return (
    <motion.aside
      initial={{ x: -150, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="hidden md:flex fixed left-0 top-0 h-screen w-80 bg-pastel-card dark:bg-dark-card shadow-lg p-6 flex-col justify-between z-50 transition-colors duration-500 border-r border-gray-100 dark:border-gray-800"
    >
      <div className="flex flex-col items-center w-full">
        {/* Profile Image - Increased Size */}
        <div className="relative w-60 h-60 mb-6 rounded-full overflow-hidden border-4 border-pastel-accent dark:border-dark-accent shadow-lg ring-4 ring-pastel-accent/20 dark:ring-dark-accent/20">
          {/* Ensure profile.jpg is in your public folder */}
          <Image
            src="/profile.jpg"
            alt="Mubashir Mohsin"
            fill
            className="object-cover"
            priority
          />
        </div>

        <h1 className="text-3xl font-bold mb-2 text-center text-gray-800 dark:text-gray-100">
          MUBASHIR MOHSIN
        </h1>

        <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-6 italic leading-relaxed">
          Master of Computer Science @{" "}
          <a
            href="https://www.dal.ca"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800"
          >
            Dalhousie
          </a>
          <br />
          <span className="font-semibold text-pastel-accent dark:text-dark-accent">AI • Healthcare • Cybersecurity • Data Privacy</span>
        </p>


        {/* Social Links */}
        <div className="flex gap-4 mb-8 text-xl text-gray-600 dark:text-gray-400">
          <a href="https://github.com/Mubashir42884" target="_blank" className="hover:text-black dark:hover:text-white hover:scale-110 transition-all"><FaGithub /></a>
          <a href="https://linkedin.com/in/Mubashir-Mohsin" target="_blank" className="hover:text-blue-600 dark:hover:text-blue-400 hover:scale-110 transition-all"><FaLinkedin /></a>
          <a href="https://scholar.google.com/citations?user=L6Esq54AAAAJ&hl=en" target="_blank" className="hover:text-blue-500 dark:hover:text-blue-300 hover:scale-110 transition-all"><FaGraduationCap /></a>
          <a href="https://orcid.org/0009-0008-7205-0855" target="_blank" className="hover:text-green-600 dark:hover:text-green-400 hover:scale-110 transition-all"><FaOrcid /></a>
          <a href="https://mubashir42884.github.io/blogsite/index.html" target="_blank" rel="noopener noreferrer" className="hover:text-green-600 dark:hover:text-green-400 hover:scale-110 transition-all"><FaRssSquare /></a>

        </div>

        {/* Navigation - Now Interactive */}
        <nav className="w-full px-4">
          <ul className="space-y-3">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => scrollToSection(item.id)}
                  className={`w-full text-left py-2 px-4 rounded-lg transition-all duration-300 text-xl ${activeSection === item.id
                    ? 'bg-pastel-accent/15 dark:bg-dark-accent/15 text-pastel-accent dark:text-dark-accent font-bold translate-x-2'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:translate-x-1'
                    }`}
                >
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="text-xs text-center text-gray-400 dark:text-white-600 font-sans">
        &copy; {new Date().getFullYear()} Mubashir Mohsin
      </div>
    </motion.aside>
  );
};

export default Sidebar;
