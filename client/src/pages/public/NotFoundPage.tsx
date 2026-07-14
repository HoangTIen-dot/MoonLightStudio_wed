import siteLogo from '../../assets/images/ML_Alpha.png';

export function NotFoundPage() {
  return (
    <section className="grid min-h-screen place-items-center bg-[#0C0C0C] px-5 py-10 text-white">
      <section className="w-full max-w-xl text-center">
        <a href="/" className="mx-auto mb-10 block h-16 w-48 overflow-hidden rounded-md" aria-label="MoonLight Studio">
          <img src={siteLogo} alt="MoonLight Studio" className="h-full w-full object-cover" />
        </a>

        <p className="mb-4 text-sm font-light uppercase tracking-[0.35em] text-white/45">404</p>
        <h1 className="text-5xl font-black uppercase leading-none tracking-tight sm:text-7xl">
          Page not found
        </h1>
        <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-white/55">
          This page does not exist or has been moved. Return to the public portfolio or open the CMS dashboard.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-bold uppercase text-zinc-950 transition hover:bg-[#BBCCD7]"
          >
            Public site
          </a>
          <a
            href="/admin"
            className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 px-6 text-sm font-bold uppercase text-white transition hover:border-white/45"
          >
            Admin CMS
          </a>
        </div>
      </section>
    </section>
  );
}
