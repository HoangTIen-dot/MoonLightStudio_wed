import { type FormEvent, useEffect, useState } from 'react';
import { Loader2, Pencil, ShieldCheck, Trash2, UserPlus, X } from 'lucide-react';
import {
  createAdminUser,
  deleteAdminUser,
  getAdminUsers,
  type AdminRole,
  type AdminUser,
  updateAdminUser,
} from '../../features/admin-users/admin-user.service';
import { AdminHeader } from '../../shared/components/AdminHeader';

type SaveState = 'idle' | 'saving' | 'complete' | 'failed';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<AdminRole>('admin');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    void loadUsers();
  }, []);

  async function loadUsers() {
    setIsLoading(true);
    setError('');

    try {
      const response = await getAdminUsers();
      setUsers(response.users);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not load admin users.');
    } finally {
      setIsLoading(false);
    }
  }

  function resetForm(nextSaveState: SaveState = 'idle') {
    setEmail('');
    setPassword('');
    setRole('admin');
    setEditingUserId(null);
    setSaveState(nextSaveState);
  }

  function handleEdit(user: AdminUser) {
    setEmail(user.email);
    setPassword('');
    setRole(user.role);
    setEditingUserId(user._id);
    setSaveState('idle');
    setError('');
  }

  async function handleDelete(user: AdminUser) {
    const confirmed = window.confirm(`Delete admin user "${user.email}"?`);

    if (!confirmed) {
      return;
    }

    try {
      setError('');
      await deleteAdminUser(user._id);

      if (editingUserId === user._id) {
        resetForm();
      }

      await loadUsers();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not delete this admin user.');
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!editingUserId && password.length < 12) {
      setError('Password must be at least 12 characters.');
      return;
    }

    try {
      setSaveState('saving');

      if (editingUserId) {
        await updateAdminUser(editingUserId, {
          email,
          role,
          ...(password ? { password } : {}),
        });
      } else {
        await createAdminUser({ email, password, role });
      }

      resetForm('complete');
      await loadUsers();
    } catch (caughtError) {
      setSaveState('failed');
      setError(caughtError instanceof Error ? caughtError.message : 'Could not save this admin user.');
    }
  }

  return (
    <main className="min-h-screen bg-[#F4F4F1] text-zinc-950">
      <AdminHeader backToDashboard />

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[0.75fr_1.25fr]">
        <form className="rounded-lg border border-zinc-200 bg-white p-5" onSubmit={handleSubmit}>
          <div className="mb-6 flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-md bg-zinc-950 text-white">
              <ShieldCheck size={20} />
            </span>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight">
                {editingUserId ? 'Update admin user' : 'Create admin user'}
              </h1>
              <p className="text-sm text-zinc-500">Owner-only account management.</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-zinc-500">Email</span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                required
                className="h-11 w-full rounded-md border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-500"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-zinc-500">
                {editingUserId ? 'New password, optional' : 'Password'}
              </span>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                minLength={editingUserId ? undefined : 12}
                required={!editingUserId}
                className="h-11 w-full rounded-md border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-500"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-zinc-500">Role</span>
              <select
                value={role}
                onChange={(event) => setRole(event.target.value as AdminRole)}
                className="h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-500"
              >
                <option value="admin">Admin</option>
                <option value="owner">Owner</option>
              </select>
            </label>
          </div>

          {error ? <p className="mt-5 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
          {saveState === 'complete' ? (
            <p className="mt-5 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Admin user saved.</p>
          ) : null}

          <div className="mt-6 grid gap-2 sm:grid-cols-[1fr_auto]">
            <button
              type="submit"
              disabled={saveState === 'saving'}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-bold uppercase text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saveState === 'saving' ? <Loader2 className="animate-spin" size={17} /> : <UserPlus size={17} />}
              {saveState === 'saving' ? 'Saving user' : editingUserId ? 'Update user' : 'Create user'}
            </button>
            {editingUserId ? (
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
              <h2 className="text-2xl font-black uppercase tracking-tight">Admin users</h2>
              <p className="text-sm text-zinc-500">{users.length} accounts</p>
            </div>
            <button
              type="button"
              onClick={() => void loadUsers()}
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
              {users.map((user) => (
                <article key={user._id} className="rounded-md border border-zinc-200 p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold">{user.email}</h3>
                        <span className="rounded bg-zinc-950 px-2 py-0.5 text-xs font-semibold uppercase text-white">
                          {user.role}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-zinc-500">Updated {formatDate(user.updatedAt)}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(user)}
                        className="inline-flex h-9 items-center gap-2 rounded-md border border-zinc-200 px-3 text-sm font-semibold hover:bg-zinc-100"
                      >
                        <Pencil size={15} />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(user)}
                        className="inline-flex h-9 items-center gap-2 rounded-md border border-red-200 px-3 text-sm font-semibold text-red-700 hover:bg-red-50"
                      >
                        <Trash2 size={15} />
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}

              {!users.length ? (
                <div className="rounded-md border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500">
                  No admin users yet.
                </div>
              ) : null}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
