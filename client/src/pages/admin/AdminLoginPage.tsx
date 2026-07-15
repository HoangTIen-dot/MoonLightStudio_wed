import { type FormEvent, useState } from 'react';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import siteLogo from '../../assets/images/ML_Alpha-ui.webp';
import { loginAdmin, saveAdminToken } from '../../features/auth/auth.service';

export function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const { token } = await loginAdmin(email, password);
      saveAdminToken(token);
      window.location.assign('/admin');
    } catch {
      setError('Email hoặc mật khẩu admin không đúng.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0C0C0C] px-5 py-8 text-white sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center">
        <a href="/" className="mb-10 block h-16 w-48 overflow-hidden rounded-md" aria-label="MoonLight Studio">
          <img src={siteLogo} alt="MoonLight Studio" className="h-full w-full object-cover" />
        </a>

        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30">
          <div className="mb-8 flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-lg bg-white text-zinc-950">
              <LockKeyhole size={20} />
            </span>
            <div>
              <h1 className="text-2xl font-black uppercase leading-none">Admin Login</h1>
              <p className="mt-1 text-sm text-white/50">Quản lý project, brand và video.</p>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-white/50">Email</span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                required
                autoComplete="email"
                className="h-12 w-full rounded-md border border-white/10 bg-black/40 px-4 text-sm text-white outline-none transition focus:border-white/50"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-white/50">Password</span>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                required
                autoComplete="current-password"
                className="h-12 w-full rounded-md border border-white/10 bg-black/40 px-4 text-sm text-white outline-none transition focus:border-white/50"
              />
            </label>

            {error ? <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-bold uppercase text-zinc-950 transition hover:bg-[#BBCCD7] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Đang đăng nhập' : 'Đăng nhập'}
              <ArrowRight size={17} />
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
