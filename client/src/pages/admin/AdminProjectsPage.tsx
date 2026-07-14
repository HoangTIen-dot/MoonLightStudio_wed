import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { ExternalLink, FolderKanban, Loader2, Pencil, Plus, Trash2, X, Video } from 'lucide-react';
import { hasAdminToken } from '../../features/auth/auth.service';
import { getAdminBrands, type Brand } from '../../features/brands/brand.service';
import {
  createProject,
  deleteProject,
  getAdminProjects,
  type Project,
  updateProject,
} from '../../features/projects/project.service';
import {
  createVideo,
  deleteVideo,
  getAdminVideos,
  type Video as CmsVideo,
  updateVideo,
} from '../../features/videos/video.service';
import { AdminHeader } from '../../shared/components/AdminHeader';

type SaveState = 'idle' | 'saving' | 'complete' | 'failed';

const DEFAULT_THUMBNAIL_URL = 'https://placehold.co/1200x675/111111/ffffff?text=MoonLight+Project';
const PROJECT_TITLE_LIMIT = 90;
const PROJECT_DESCRIPTION_LIMIT = 360;
const PROJECT_CATEGORY_LIMIT = 40;

function resolveProjectId(video: CmsVideo) {
  return typeof video.projectId === 'string' ? video.projectId : video.projectId._id;
}

function resolveBrand(project: Project) {
  return typeof project.brandId === 'string' ? null : project.brandId;
}

export function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [videos, setVideos] = useState<CmsVideo[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [projectTitle, setProjectTitle] = useState('');
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [category, setCategory] = useState('Portfolio');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [vimeoUrl, setVimeoUrl] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [isVideoPublished, setIsVideoPublished] = useState(true);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!hasAdminToken()) {
      window.location.replace('/admin/login');
      return;
    }

    void loadData();
  }, []);

  const videosByProjectId = useMemo(() => {
    const groups = new Map<string, CmsVideo[]>();

    for (const video of videos) {
      const projectId = resolveProjectId(video);
      groups.set(projectId, [...(groups.get(projectId) ?? []), video]);
    }

    return groups;
  }, [videos]);

  async function loadData() {
    setIsLoading(true);
    setError('');

    try {
      const [projectsResponse, videosResponse, brandsResponse] = await Promise.all([
        getAdminProjects(),
        getAdminVideos(),
        getAdminBrands(),
      ]);
      setProjects(projectsResponse.projects);
      setVideos(videosResponse.videos);
      setBrands(brandsResponse.brands);
    } catch {
      setError('Could not load projects. Check the backend server and MongoDB connection.');
    } finally {
      setIsLoading(false);
    }
  }

  function resetForm(nextSaveState: SaveState = 'idle') {
    setProjectTitle('');
    setSelectedBrandId('');
    setCategory('Portfolio');
    setDescription('');
    setThumbnailUrl('');
    setVideoTitle('');
    setVimeoUrl('');
    setIsPublished(true);
    setIsVideoPublished(true);
    setEditingProjectId(null);
    setEditingVideoId(null);
    setSaveState(nextSaveState);
  }

  function handleEditProject(project: Project) {
    setEditingProjectId(project._id);
    setProjectTitle(project.title);
    setSelectedBrandId(resolveBrand(project)?._id ?? '');
    setCategory(project.category);
    setDescription(project.description);
    setThumbnailUrl(project.thumbnailUrl === DEFAULT_THUMBNAIL_URL ? '' : project.thumbnailUrl);
    setVideoTitle('');
    setVimeoUrl('');
    setIsPublished(project.isPublished);
    setIsVideoPublished(project.isPublished);
    setEditingVideoId(null);
    setSaveState('idle');
    setError('');
  }

  function handleEditVideo(project: Project, video: CmsVideo) {
    setEditingProjectId(project._id);
    setEditingVideoId(video._id);
    setProjectTitle(project.title);
    setSelectedBrandId(resolveBrand(project)?._id ?? '');
    setCategory(project.category);
    setDescription(project.description);
    setThumbnailUrl(project.thumbnailUrl === DEFAULT_THUMBNAIL_URL ? '' : project.thumbnailUrl);
    setVideoTitle(video.title);
    setVimeoUrl(video.videoUrl);
    setIsPublished(project.isPublished);
    setIsVideoPublished(video.isPublished);
    setSaveState('idle');
    setError('');
  }

  async function handleDeleteProject(project: Project) {
    const confirmed = window.confirm(`Delete project "${project.title}"? This cannot be undone.`);

    if (!confirmed) {
      return;
    }

    try {
      setError('');
      await deleteProject(project._id);

      if (editingProjectId === project._id) {
        resetForm();
      }

      await loadData();
    } catch {
      setError('Could not delete this project. Check the backend terminal.');
    }
  }

  async function handleDeleteVideo(video: CmsVideo) {
    const confirmed = window.confirm(`Delete Vimeo video "${video.title}"?`);

    if (!confirmed) {
      return;
    }

    try {
      setError('');
      await deleteVideo(video._id);

      if (editingVideoId === video._id) {
        setEditingVideoId(null);
        setVideoTitle('');
        setVimeoUrl('');
        setIsVideoPublished(true);
      }

      await loadData();
    } catch {
      setError('Could not delete this Vimeo video. Check the backend terminal.');
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!projectTitle.trim()) {
      setError('Project title is required.');
      return;
    }

    if ((!editingProjectId || editingVideoId) && !vimeoUrl.trim()) {
      setError('Vimeo URL is required.');
      return;
    }

    try {
      setSaveState('saving');
      const projectPayload = {
        title: projectTitle.trim(),
        description: description.trim() || `${projectTitle.trim()} case study.`,
        brandId: selectedBrandId || null,
        category: category.trim() || 'Portfolio',
        thumbnailUrl: thumbnailUrl.trim() || DEFAULT_THUMBNAIL_URL,
        thumbnailPublicId: thumbnailUrl.trim() ? `external-${Date.now()}` : 'quick-project-placeholder',
        isPublished,
      };

      if (editingProjectId) {
        await updateProject(editingProjectId, projectPayload);

        if (editingVideoId) {
          await updateVideo(editingVideoId, {
            title: videoTitle.trim() || projectTitle.trim(),
            projectId: editingProjectId,
            videoProvider: 'vimeo',
            videoUrl: vimeoUrl.trim(),
            displayOrder: 0,
            isPublished: isVideoPublished,
          });
        } else if (vimeoUrl.trim()) {
          await createVideo({
            title: videoTitle.trim() || projectTitle.trim(),
            projectId: editingProjectId,
            videoProvider: 'vimeo',
            videoUrl: vimeoUrl.trim(),
            displayOrder: 0,
            isPublished: isVideoPublished,
          });
        }

        resetForm('complete');
        await loadData();
        return;
      }

      const projectResponse = await createProject(projectPayload);

      await createVideo({
        title: videoTitle.trim() || projectTitle.trim(),
        projectId: projectResponse.project._id,
        videoProvider: 'vimeo',
        videoUrl: vimeoUrl.trim(),
        displayOrder: 0,
        isPublished: isVideoPublished,
      });

      resetForm('complete');
      await loadData();
    } catch (caughtError) {
      setSaveState('failed');
      setError(caughtError instanceof Error ? caughtError.message : 'Could not save this project.');
    }
  }

  return (
    <main className="min-h-screen bg-[#F4F4F1] text-zinc-950">
      <AdminHeader backToDashboard />

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[0.85fr_1.15fr]">
        <form className="rounded-lg border border-zinc-200 bg-white p-5" onSubmit={handleSubmit}>
          <div className="mb-6 flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-md bg-zinc-950 text-white">
              <FolderKanban size={20} />
            </span>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight">
                {editingVideoId ? 'Update project video' : editingProjectId ? 'Update project' : 'Create project'}
              </h1>
              <p className="text-sm text-zinc-500">
                {editingVideoId
                  ? 'Edit project metadata and the selected Vimeo video.'
                  : editingProjectId
                    ? 'Edit project metadata or attach another Vimeo video.'
                    : 'Create a case study and attach a Vimeo video in one flow.'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-zinc-500">Project title</span>
              <input
                value={projectTitle}
                onChange={(event) => setProjectTitle(event.target.value)}
                placeholder="Batdongsan.com.vn"
                maxLength={PROJECT_TITLE_LIMIT}
                required
                className="h-11 w-full rounded-md border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-500"
              />
              <span className="mt-1 block text-right text-xs text-zinc-400">
                {projectTitle.length}/{PROJECT_TITLE_LIMIT}
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-zinc-500">Brand</span>
              <select
                value={selectedBrandId}
                onChange={(event) => setSelectedBrandId(event.target.value)}
                className="h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-500"
              >
                <option value="">No brand selected</option>
                {brands.map((brand) => (
                  <option key={brand._id} value={brand._id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-zinc-500">Category</span>
                <input
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  maxLength={PROJECT_CATEGORY_LIMIT}
                  className="h-11 w-full rounded-md border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-500"
                />
              </label>

              <label className="flex items-end gap-3 rounded-md border border-zinc-200 px-3 py-3">
                <input
                  checked={isPublished}
                  onChange={(event) => setIsPublished(event.target.checked)}
                  type="checkbox"
                  className="size-5"
                />
                <span className="text-sm font-semibold">Publish on homepage</span>
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-zinc-500">Description</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                maxLength={PROJECT_DESCRIPTION_LIMIT}
                placeholder="Short case study note for this work."
                className="w-full resize-none rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-500"
              />
              <span className="mt-1 block text-right text-xs text-zinc-400">
                {description.length}/{PROJECT_DESCRIPTION_LIMIT}
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-zinc-500">Thumbnail URL</span>
              <input
                value={thumbnailUrl}
                onChange={(event) => setThumbnailUrl(event.target.value)}
                type="url"
                placeholder="Optional image URL"
                className="h-11 w-full rounded-md border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-500"
              />
            </label>

            <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Video size={17} />
                  <span className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-500">
                    {editingVideoId ? 'Edit Vimeo video' : 'Vimeo video'}
                  </span>
                </div>
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600">
                  <input
                    checked={isVideoPublished}
                    onChange={(event) => setIsVideoPublished(event.target.checked)}
                    type="checkbox"
                    className="size-4"
                  />
                  Publish video
                </label>
              </div>
              <div className="space-y-3">
                <input
                  value={videoTitle}
                  onChange={(event) => setVideoTitle(event.target.value)}
                  placeholder="Video title, optional"
                  className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-500"
                />
                <input
                  value={vimeoUrl}
                  onChange={(event) => setVimeoUrl(event.target.value)}
                  type="url"
                  placeholder="https://vimeo.com/1063130270"
                  required={!editingProjectId || Boolean(editingVideoId)}
                  className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-500"
                />
              </div>
            </div>
          </div>

          {error ? <p className="mt-5 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
          {saveState === 'complete' ? (
            <p className="mt-5 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              Project saved.
            </p>
          ) : null}

          <div className="mt-6 grid gap-2 sm:grid-cols-[1fr_auto]">
            <button
              type="submit"
              disabled={saveState === 'saving'}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-bold uppercase text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saveState === 'saving' ? <Loader2 className="animate-spin" size={17} /> : <Plus size={17} />}
              {saveState === 'saving'
                ? 'Saving project'
                : editingVideoId
                  ? 'Update project video'
                  : editingProjectId
                    ? 'Update project'
                    : 'Create project'}
            </button>
            {editingProjectId ? (
              <button
                type="button"
                onClick={() => resetForm()}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-zinc-200 px-4 text-sm font-bold uppercase transition hover:bg-zinc-100"
              >
                <X size={17} />
                Cancel
              </button>
            ) : null}
          </div>
        </form>

        <section className="rounded-lg border border-zinc-200 bg-white p-5">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">Projects</h2>
              <p className="text-sm text-zinc-500">{projects.length} items</p>
            </div>
            <button
              type="button"
              onClick={() => void loadData()}
              className="h-10 rounded-md border border-zinc-200 px-3 text-sm font-semibold hover:bg-zinc-100"
            >
              Refresh
            </button>
          </div>

          {isLoading ? (
            <div className="flex h-40 items-center justify-center text-zinc-500">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => {
                const projectVideos = videosByProjectId.get(project._id) ?? [];
                const brand = resolveBrand(project);

                return (
                  <article key={project._id} className="rounded-md border border-zinc-200 p-4">
                    <div className="flex flex-col gap-4 sm:flex-row">
                      <img
                        src={project.thumbnailUrl}
                        alt={project.title}
                        className="aspect-video w-full rounded-md bg-zinc-100 object-cover sm:w-40"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold">{project.title}</h3>
                          {brand ? (
                            <span className="inline-flex items-center gap-2 rounded bg-zinc-50 px-2 py-1 text-xs font-semibold text-zinc-600">
                              <img src={brand.logoUrl} alt="" className="h-4 w-8 rounded-sm object-cover" />
                              {brand.name}
                            </span>
                          ) : null}
                          <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-500">
                            {project.isPublished ? 'Published' : 'Draft'}
                          </span>
                          <span className="rounded bg-zinc-950 px-2 py-0.5 text-xs font-semibold uppercase text-white">
                            {project.category}
                          </span>
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm text-zinc-500">{project.description}</p>
                        <div className="mt-3 space-y-2">
                          {projectVideos.map((video) => (
                            <div
                              key={video._id}
                              className="flex flex-col gap-2 rounded-md border border-zinc-100 bg-zinc-50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <a
                                href={video.videoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex min-w-0 items-center gap-2 text-sm text-zinc-500 underline"
                              >
                                <ExternalLink size={14} />
                                <span className="truncate">{video.title}</span>
                                <span className="shrink-0 rounded bg-white px-2 py-0.5 text-[11px] font-semibold text-zinc-500">
                                  {video.isPublished ? 'Published' : 'Draft'}
                                </span>
                              </a>
                              <div className="flex shrink-0 gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleEditVideo(project, video)}
                                  className="inline-flex h-8 items-center gap-1 rounded-md border border-zinc-200 bg-white px-2 text-xs font-semibold hover:bg-zinc-100"
                                >
                                  <Pencil size={13} />
                                  Edit video
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void handleDeleteVideo(video)}
                                  className="inline-flex h-8 items-center gap-1 rounded-md border border-red-200 bg-white px-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 size={13} />
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                          {!projectVideos.length ? <p className="text-sm text-zinc-400">No Vimeo video attached.</p> : null}
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditProject(project)}
                            className="inline-flex h-9 items-center gap-2 rounded-md border border-zinc-200 px-3 text-sm font-semibold hover:bg-zinc-100"
                          >
                            <Pencil size={15} />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDeleteProject(project)}
                            className="inline-flex h-9 items-center gap-2 rounded-md border border-red-200 px-3 text-sm font-semibold text-red-700 hover:bg-red-50"
                          >
                            <Trash2 size={15} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}

              {!projects.length ? (
                <div className="rounded-md border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500">
                  No projects yet.
                </div>
              ) : null}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
