import { useEffect, useMemo, useState } from 'react';
import { Inbox, Loader2 } from 'lucide-react';
import { hasAdminToken } from '../../features/auth/auth.service';
import { getAdminLeads, type Lead, type LeadStatus, updateLeadStatus } from '../../features/leads/lead.service';
import { AdminHeader } from '../../shared/components/AdminHeader';

const statusOptions: LeadStatus[] = ['new', 'contacted', 'closed'];

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [updatingLeadId, setUpdatingLeadId] = useState('');

  useEffect(() => {
    if (!hasAdminToken()) {
      window.location.replace('/admin/login');
      return;
    }

    void loadData();
  }, []);

  const counts = useMemo(
    () => ({
      total: leads.length,
      new: leads.filter((lead) => lead.status === 'new').length,
      contacted: leads.filter((lead) => lead.status === 'contacted').length,
      closed: leads.filter((lead) => lead.status === 'closed').length,
    }),
    [leads],
  );

  async function loadData() {
    setIsLoading(true);
    setError('');

    try {
      const response = await getAdminLeads();
      setLeads(response.leads);
    } catch {
      setError('Could not load leads. Check the backend server and MongoDB connection.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStatusChange(lead: Lead, status: LeadStatus) {
    try {
      setUpdatingLeadId(lead._id);
      setError('');
      const response = await updateLeadStatus(lead._id, status);
      setLeads((currentLeads) => currentLeads.map((item) => (item._id === lead._id ? response.lead : item)));
    } catch {
      setError('Could not update this lead.');
    } finally {
      setUpdatingLeadId('');
    }
  }

  return (
    <main className="min-h-screen bg-[#F4F4F1] text-zinc-950">
      <AdminHeader backToDashboard />

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-md bg-zinc-950 text-white">
                <Inbox size={20} />
              </span>
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tight">Leads</h1>
                <p className="text-sm text-zinc-500">Review contact requests submitted from the public website.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-zinc-500">
              <span className="rounded bg-white px-3 py-1">Total {counts.total}</span>
              <span className="rounded bg-white px-3 py-1">New {counts.new}</span>
              <span className="rounded bg-white px-3 py-1">Contacted {counts.contacted}</span>
              <span className="rounded bg-white px-3 py-1">Closed {counts.closed}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void loadData()}
            className="h-10 rounded-md border border-zinc-200 bg-white px-3 text-sm font-semibold hover:bg-zinc-100"
          >
            Refresh
          </button>
        </div>

        {error ? <p className="mb-5 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

        <section className="rounded-lg border border-zinc-200 bg-white p-5">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center text-zinc-500">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {leads.map((lead) => (
                <article key={lead._id} className="rounded-md border border-zinc-200 p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-bold">{lead.name}</h2>
                        {lead.company ? (
                          <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-500">
                            {lead.company}
                          </span>
                        ) : null}
                        <span className="rounded bg-zinc-950 px-2 py-0.5 text-xs font-semibold uppercase text-white">
                          {lead.status}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-500">
                        {lead.email ? <a href={`mailto:${lead.email}`} className="underline">{lead.email}</a> : null}
                        {lead.phone ? <a href={`tel:${lead.phone}`} className="underline">{lead.phone}</a> : null}
                        <span>{formatDate(lead.createdAt)}</span>
                      </div>
                      <p className="mt-3 whitespace-pre-line text-sm leading-6 text-zinc-600">{lead.message}</p>
                    </div>

                    <label className="block min-w-40">
                      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-zinc-500">Status</span>
                      <select
                        value={lead.status}
                        onChange={(event) => void handleStatusChange(lead, event.target.value as LeadStatus)}
                        disabled={updatingLeadId === lead._id}
                        className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-500 disabled:opacity-60"
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </article>
              ))}

              {!leads.length ? (
                <div className="rounded-md border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500">
                  No leads yet.
                </div>
              ) : null}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
