import { MoveUpRight } from 'lucide-react';

export function LiveProjectButton() {
  return (
    <a
      href="mailto:jack@creator.studio"
      className="inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-white hover:text-zinc-950"
    >
      Live Project
      <MoveUpRight size={14} />
    </a>
  );
}
