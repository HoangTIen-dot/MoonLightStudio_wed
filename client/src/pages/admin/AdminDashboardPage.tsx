import { ArrowUpRight, Building2, FolderKanban, Inbox, LogOut } from 'lucide-react';
import { clearAdminToken, hasAdminToken } from '../../features/auth/auth.service';
import { AdminHeader } from '../../shared/components/AdminHeader';

const adminAreas = [
  {
    title: 'Brands',
    description: 'Manage partner logos, website links, publish state, and display order.',
    icon: Building2,
    endpoint: 'GET/POST /api/admin/brands',
    href: '/admin/brands',
    enabled: true,
  },
  {
    title: 'Projects',
    description: 'Create case studies and attach Vimeo videos in one workflow.',
    icon: FolderKanban,
    endpoint: 'POST /api/admin/projects + /api/admin/videos',
    href: '/admin/projects',
    enabled: true,
  },
  {
    title: 'Leads',
    description: 'Review contact requests submitted from the public website.',
    icon: Inbox,
    endpoint: 'GET/PATCH /api/admin/leads',
    href: '/admin/leads',
    enabled: true,
  },
];

export function AdminDashboardPage() {
  if (!hasAdminToken()) {
    window.location.replace('/admin/login');
    return null;
  }

  function handleLogout() {
    clearAdminToken();
    window.location.assign('/admin/login');
  }

  return (
    <main className="min-h-screen bg-[#F4F4F1] text-zinc-950">
      <AdminHeader>
        <div className="flex items-center gap-2">
          <a
            href="/"
            className="inline-flex h-10 items-center gap-2 rounded-md border border-zinc-200 px-3 text-sm font-semibold transition hover:bg-zinc-100"
          >
            Public site
            <ArrowUpRight size={16} />
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-zinc-950 px-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </AdminHeader>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-zinc-500">Admin dashboard</p>
          <h1 className="text-4xl font-black uppercase leading-none tracking-tight sm:text-6xl">
            Content operations
          </h1>
          <p className="mt-4 text-base leading-relaxed text-zinc-600">
            Manage portfolio content from one focused workflow. Projects handle case study details, Vimeo embeds, publishing, updates, and deletes.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {adminAreas.map((area) => {
            const Icon = area.icon;
            const content = (
              <>
                <div className="mb-6 flex items-start justify-between gap-4">
                  <span className="grid size-11 place-items-center rounded-md bg-zinc-950 text-white">
                    <Icon size={20} />
                  </span>
                  <span className="rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-500">
                    {area.enabled ? 'Open' : 'Next'}
                  </span>
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tight">{area.title}</h2>
                <p className="mt-3 min-h-12 text-sm leading-relaxed text-zinc-600">{area.description}</p>
                <p className="mt-5 rounded-md bg-zinc-100 px-3 py-2 font-mono text-xs text-zinc-600">{area.endpoint}</p>
              </>
            );

            if (area.enabled) {
              return (
                <a key={area.title} href={area.href} className="rounded-lg border border-zinc-200 bg-white p-5 transition hover:border-zinc-400">
                  {content}
                </a>
              );
            }

            return (
              <article key={area.title} className="rounded-lg border border-zinc-200 bg-white p-5 opacity-75">
                {content}
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
