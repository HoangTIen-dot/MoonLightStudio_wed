import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { getPublicVideos, type Video } from '../../videos/video.service';
import { type Project as StaticProject, projects as staticProjects } from '../homepage.data';
import type { Project as CmsProject } from '../../projects/project.service';

type ProjectCardProps = {
  project: StaticProject;
  index: number;
};

function ProjectCard({ project, index }: ProjectCardProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const description = project.description || 'Selected production work presented as a focused case study.';
  const hasLongDescription = description.length > 190;
  const titleLength = project.title.length;
  const titleSizeClass =
    titleLength > 72
      ? 'text-2xl sm:text-3xl lg:text-[clamp(1.45rem,1.55vw,1.85rem)]'
      : titleLength > 46
        ? 'text-3xl sm:text-[2.15rem] lg:text-[clamp(1.65rem,1.85vw,2.15rem)]'
        : 'text-3xl sm:text-4xl lg:text-[clamp(1.85rem,2.15vw,2.55rem)]';
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.94, 1, 0.92]);

  return (
    <motion.div
      ref={ref}
      className="sticky top-8 overflow-hidden rounded-[2rem] bg-zinc-950 shadow-2xl shadow-black/40"
      style={{ scale, zIndex: index + 1 }}
    >
      <div>
        <div className="relative aspect-video bg-black">
          {project.videoEmbedUrl ? (
            <iframe
              src={`${project.videoEmbedUrl}?autoplay=0&loop=1&autopause=1&title=0&byline=0&portrait=0`}
              title={project.title}
              className="absolute inset-0 h-full w-full border-0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <img src={project.image} alt={project.title} className="absolute inset-0 h-full w-full object-cover" />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />
          <div className="pointer-events-none absolute left-5 top-5 z-10 flex items-center gap-3 sm:left-8 sm:top-8">
            <span className="rounded-full bg-black/50 px-3 py-1 text-xs font-light uppercase tracking-[0.28em] text-white/75 backdrop-blur">
              {project.type}
            </span>
          </div>
        </div>

        <aside className="border-t border-white/10 bg-[#121212] p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(20rem,0.8fr)] lg:items-start">
            <div className="min-w-0">
              <div className="mb-5 flex items-center justify-between gap-5">
                <span className="text-sm font-black text-white/70">0{index + 1}</span>
                <span className="text-xs font-light uppercase tracking-[0.28em] text-white/40">Project</span>
              </div>
              {project.brandLogoUrl ? (
                <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                  <img
                    src={project.brandLogoUrl}
                    alt={project.brandName ?? ''}
                    className="h-7 w-16 rounded-full object-cover"
                  />
                  {project.brandName ? (
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
                      {project.brandName}
                    </span>
                  ) : null}
                </div>
              ) : null}
              <h3 className={`max-w-4xl break-words font-black uppercase leading-[0.95] text-white ${titleSizeClass}`}>
                {project.title}
              </h3>
            </div>
            <div className="min-w-0 border-t border-white/10 pt-5 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
              <div className="mb-4 flex items-center justify-between gap-4">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">{project.type}</span>
                {hasLongDescription ? (
                  <button
                    type="button"
                    onClick={() => setIsDescriptionExpanded((current) => !current)}
                    className="shrink-0 text-xs font-semibold uppercase tracking-[0.22em] text-white/70 transition hover:text-white"
                  >
                    {isDescriptionExpanded ? 'See less' : 'See more'}
                  </button>
                ) : null}
              </div>
            <div
              className={`whitespace-pre-line pr-1 text-sm leading-6 text-white/55 ${
                isDescriptionExpanded ? 'max-h-36 overflow-y-auto' : 'line-clamp-3 lg:line-clamp-4'
              }`}
            >
              <p className="break-words">{description}</p>
            </div>
            </div>
          </div>
        </aside>
      </div>
    </motion.div>
  );
}

function resolveProject(video: Video) {
  return typeof video.projectId === 'string' ? null : (video.projectId as CmsProject);
}

function resolveBrand(project: CmsProject | null) {
  if (!project || !project.brandId || typeof project.brandId === 'string') {
    return null;
  }

  return project.brandId;
}

function mapVideoToProject(video: Video): StaticProject {
  const project = resolveProject(video);
  const brand = resolveBrand(project);

  return {
    title: project?.title ?? video.title,
    type: project?.category ?? 'Vimeo Film',
    image: project?.thumbnailUrl || 'https://images.unsplash.com/photo-1633355444132-695d5876cd00?auto=format&fit=crop&w=1400&q=85',
    brandName: brand?.name,
    brandLogoUrl: brand?.logoUrl,
    description: project?.description,
    videoEmbedUrl: video.embedUrl,
  };
}

export function ProjectsSection() {
  const [cmsVideos, setCmsVideos] = useState<Video[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadProjects() {
      try {
        const response = await getPublicVideos();

        if (isMounted) {
          setCmsVideos(response.videos);
        }
      } catch {
        if (isMounted) {
          setCmsVideos([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingProjects(false);
        }
      }
    }

    void loadProjects();

    return () => {
      isMounted = false;
    };
  }, []);

  const projects = useMemo(
    () => (cmsVideos.length ? cmsVideos.map(mapVideoToProject) : staticProjects),
    [cmsVideos],
  );

  return (
    <section id="projects" className="bg-[#0C0C0C] px-5 py-24 sm:px-10 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-4 text-sm font-light uppercase tracking-[0.35em] text-white/45">Projects</p>
            <h2 className="text-5xl font-black uppercase leading-none tracking-[-0.06em] text-white sm:text-7xl">
              Sticky selected works
            </h2>
          </div>
          <p className="max-w-sm text-base leading-relaxed text-white/55">
            Stacked case cards designed to feel like a compact gallery of finished worlds.
          </p>
        </div>
        <div className="space-y-8">
          {isLoadingProjects ? (
            <div className="rounded-[2rem] border border-white/10 p-10 text-center text-sm uppercase tracking-[0.3em] text-white/45">
              Loading projects
            </div>
          ) : null}

          {projects.map((project, index) => (
            <ProjectCard key={project.title} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
