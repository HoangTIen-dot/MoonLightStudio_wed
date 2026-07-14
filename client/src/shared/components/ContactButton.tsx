import { ArrowUpRight } from 'lucide-react';

type ContactButtonProps = {
  label?: string;
};

export function ContactButton({ label = 'Contact Me' }: ContactButtonProps) {
  return (
    <a
      href="#contact"
      className="group inline-flex items-center gap-3 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-[#BBCCD7]"
    >
      {label}
      <span className="grid size-8 place-items-center rounded-full bg-zinc-950 text-white transition group-hover:rotate-45">
        <ArrowUpRight size={16} />
      </span>
    </a>
  );
}
