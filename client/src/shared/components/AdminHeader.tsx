import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import siteLogo from '../../assets/images/moon.png';

type AdminHeaderProps = {
  backToDashboard?: boolean;
  children?: ReactNode;
};

function AdminLogo() {
  return (
    <a href="/" className="block h-11 w-36 overflow-hidden rounded-md" aria-label="MoonLight Studio">
      <img src={siteLogo} alt="MoonLight Studio" className="h-full w-full object-cover" />
    </a>
  );
}

export function AdminHeader({ backToDashboard = false, children }: AdminHeaderProps) {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        {backToDashboard ? (
          <a href="/admin" className="inline-flex items-center gap-2 text-sm font-bold uppercase text-zinc-600">
            <ArrowLeft size={17} />
            Dashboard
          </a>
        ) : (
          <AdminLogo />
        )}

        {backToDashboard ? <AdminLogo /> : children}
      </div>
    </header>
  );
}
