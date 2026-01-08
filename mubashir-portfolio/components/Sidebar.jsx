import Image from 'next/image';
import { FaGithub, FaLinkedin, FaGraduationCap, FaOrcid } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const navItems = [
    { name: 'About', id: 'about' },
    { name: 'Publications', id: 'publications' },
    { name: 'Unpublished Works', id: 'unpublished' },
    { name: 'Research Interests', id: 'interests' },
  ];

  return (
    <motion.aside 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed left-0 top-0 h-screen w-80 bg-pastel-card dark:bg-dark-card shadow-lg p-8 flex flex-col justify-between z-50 transition-colors duration-500"
    >
      <div className="flex flex-col items-center">
        {/* Profile Image */}
        <div className="relative w-40 h-40 mb-6 rounded-full overflow-hidden border-4 border-pastel-accent dark:border-dark-accent shadow-md">
           {/* Replace '/profile.jpg' with your actual image in the public folder */}
          <Image src="/profile.jpg" alt="Mubashir Mohsin" fill className="object-cover" />
        </div>
        
        <h1 className="text-2xl font-bold mb-1">Mubashir Mohsin</h1>
        <p className="text-sm text-center opacity-80 mb-6 italic">
          Master of Computer Science @ Dalhousie <br/>
          AI • Healthcare • Privacy
        </p>

        {/* Social Links */}
        <div className="flex gap-4 mb-8 text-xl text-pastel-accent dark:text-dark-accent">
          <a href="https://github.com/Mubashir42884" target="_blank" className="hover:scale-110 transition-transform"><FaGithub /></a>
          <a href="https://linkedin.com/in/Mubashir-Mohsin" target="_blank" className="hover:scale-110 transition-transform"><FaLinkedin /></a>
          <a href="#" target="_blank" className="hover:scale-110 transition-transform"><FaGraduationCap /></a>
          <a href="#" target="_blank" className="hover:scale-110 transition-transform"><FaOrcid /></a>
        </div>

        {/* Navigation */}
        <nav className="w-full">
          <ul className="space-y-4">
            {navItems.map((item) => (
              <li key={item.id}>
                <a 
                  href={`#${item.id}`} 
                  className="block text-lg hover:text-pastel-accent dark:hover:text-dark-accent cursor-pointer transition-colors"
                >
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="text-xs text-center opacity-50">
        &copy; {new Date().getFullYear()} Mubashir Mohsin
      </div>
    </motion.aside>
  );
};

export default Sidebar;