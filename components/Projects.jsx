import {
  ArrowUpRight,
  BookOpenText,
  CheckCircle2,
  Github,
  Sparkles,
} from 'lucide-react';
import { projects } from '@/data/projects';

const Projects = () => {
  return (
    <div className="grid grid-cols-1 gap-6">
      {projects.map((project) => (
        <article
          key={project.slug}
          className="group relative overflow-hidden rounded-2xl border border-pastel-accent/20 bg-white/80 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-dark-accent/20 dark:bg-white/5"
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-pastel-accent/70 via-pastel-accent/30 to-transparent dark:from-dark-accent/70 dark:via-dark-accent/30" />

          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-3 flex flex-wrap items-center gap-2 font-sans text-xs">
                <span className="rounded-full bg-pastel-accent/10 px-3 py-1 font-semibold text-pastel-accent dark:bg-dark-accent/10 dark:text-dark-accent">
                  {project.type}
                </span>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-600 dark:bg-white/10 dark:text-gray-300">
                  {project.year}
                </span>
                {project.featured && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 font-semibold text-amber-700 dark:bg-amber-400/10 dark:text-amber-300">
                    <Sparkles className="h-3.5 w-3.5" />
                    Featured
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-pastel-accent/10 p-2.5 text-pastel-accent dark:bg-dark-accent/10 dark:text-dark-accent">
                  <BookOpenText className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {project.title}
                </h3>
              </div>

              <p className="mt-4 text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                {project.description}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {project.features.map((feature) => (
              <div key={feature} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-pastel-accent dark:text-dark-accent" />
                <span className="leading-relaxed">{feature}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {project.tech.map((item) => (
              <span
                key={item}
                className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 font-sans text-xs text-gray-600 dark:border-gray-700 dark:bg-white/5 dark:text-gray-300"
              >
                {item}
              </span>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3 border-t border-gray-200/80 pt-5 dark:border-gray-700/80">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-pastel-accent px-4 py-2 font-sans text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-dark-accent dark:text-gray-900"
              >
                Launch App
                <ArrowUpRight className="h-4 w-4" />
              </a>
            )}

            {project.sourceUrl && (
              <a
                href={project.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white/70 px-4 py-2 font-sans text-sm font-semibold text-gray-700 transition-all hover:-translate-y-0.5 hover:bg-gray-50 dark:border-gray-600 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10"
              >
                <Github className="h-4 w-4" />
                Source
              </a>
            )}
          </div>
        </article>
      ))}
    </div>
  );
};

export default Projects;
