"use client";
import Sidebar from '@/components/Sidebar';
import ThemeToggle from '@/components/ThemeToggle';
import ScholarFeed from '@/components/ScholarFeed';
import Unpublished from '@/components/Unpublished';
import { motion } from 'framer-motion';

export default function Home() {
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen">
      <ThemeToggle />
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="pl-0 md:pl-80 transition-all duration-500">
        <div className="max-w-4xl mx-auto px-8 py-16 space-y-24">
          
          {/* About Section */}
          <motion.section 
            id="about" 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }}
            variants={sectionVariants}
          >
            <h2 className="text-3xl font-bold mb-6 text-pastel-accent dark:text-dark-accent">About Me</h2>
            <p className="text-xl leading-relaxed opacity-90">
              I am a Master of Computer Science student at Dalhousie University, currently navigating the intersection of Artificial Intelligence, Machine Learning, and Healthcare. My research focuses on making AI interpretable and trustworthy, specifically in the context of data privacy and medical diagnostics.
            </p>
            <p className="text-xl leading-relaxed opacity-90 mt-4">
              I am passionate about Python, Data Analysis, and developing robust statistical models to solve real-world problems.
            </p>
          </motion.section>

          {/* Publications Section */}
          <motion.section 
            id="publications"
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }}
            variants={sectionVariants}
          >
            <h2 className="text-3xl font-bold mb-8 text-pastel-accent dark:text-dark-accent flex items-center gap-2">
              Publications
              <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full font-sans font-normal">Auto-Updated from Scholar</span>
            </h2>
            <ScholarFeed />
          </motion.section>

          {/* Unpublished Works */}
          <motion.section 
            id="unpublished"
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }}
            variants={sectionVariants}
          >
            <h2 className="text-3xl font-bold mb-6 text-pastel-accent dark:text-dark-accent">Unpublished Works & Pre-prints</h2>
            <div className="bg-white dark:bg-white/5 p-6 rounded-lg shadow-sm border border-pastel-accent/20">
               <Unpublished />
            </div>
          </motion.section>

           {/* Interests */}
           <motion.section 
            id="interests"
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }}
            variants={sectionVariants}
          >
            <h2 className="text-3xl font-bold mb-6 text-pastel-accent dark:text-dark-accent">Research Interests</h2>
            <div className="flex flex-wrap gap-3">
              {['Machine Learning', 'Healthcare AI', 'Data Privacy', 'Statistical Analysis', 'Interpretability', 'Python'].map(tag => (
                <span key={tag} className="px-4 py-2 bg-pastel-accent/20 dark:bg-dark-accent/20 text-pastel-accent dark:text-dark-accent rounded-full text-sm font-sans font-medium">
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