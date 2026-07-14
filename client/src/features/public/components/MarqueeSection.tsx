import { useEffect, useMemo, useState } from 'react';
import { getPublicBrands, type Brand } from '../../brands/brand.service';
import { marqueeRows } from '../homepage.data';

function getBrandTileUrl(imageUrl: string) {
  if (!imageUrl.includes('/image/upload/')) {
    return imageUrl;
  }

  return imageUrl.replace('/image/upload/', '/image/upload/c_pad,w_1400,h_800,b_auto,f_auto,q_auto/');
}

export function MarqueeSection() {
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadBrands() {
      try {
        const response = await getPublicBrands();

        if (isMounted) {
          setBrands(response.brands);
        }
      } catch {
        if (isMounted) {
          setBrands([]);
        }
      }
    }

    void loadBrands();

    return () => {
      isMounted = false;
    };
  }, []);

  const brandRows = useMemo(() => {
    if (!brands.length) {
      return [];
    }

    const midpoint = Math.ceil(brands.length / 2);
    const rows = [brands.slice(0, midpoint), brands.slice(midpoint)];
    return rows.filter((row) => row.length);
  }, [brands]);

  const hasCmsBrands = brandRows.length > 0;

  return (
    <section className="overflow-hidden bg-[#0C0C0C] py-16 sm:py-24">
      <div className="mb-8 flex items-center justify-between px-5 sm:px-10">
        <p className="text-sm font-light uppercase tracking-[0.3em] text-white/50">
          {hasCmsBrands ? 'Selected brands' : 'Selected loops'}
        </p>
        <p className="hidden text-sm font-light uppercase tracking-[0.3em] text-white/50 sm:block">
          {hasCmsBrands ? 'Partner archive' : 'Motion archive'}
        </p>
      </div>
      <div className="space-y-5">
        {hasCmsBrands
          ? brandRows.map((row, rowIndex) => {
              const doubled = [...row, ...row, ...row];
              return (
                <div key={`brands-${rowIndex}`} className="overflow-hidden">
                  <div className={`marquee-track flex gap-5 px-5 ${rowIndex === 1 ? 'reverse' : ''}`}>
                    {doubled.map((brand, index) => (
                      <div
                        key={`${brand._id}-${index}`}
                        className="relative h-44 w-72 shrink-0 overflow-hidden rounded-[2rem] bg-[#111] shadow-[0_18px_70px_rgba(0,0,0,0.45)] sm:h-64 sm:w-[28rem]"
                      >
                        <img
                          src={getBrandTileUrl(brand.logoUrl)}
                          alt={brand.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          : marqueeRows.map((row, rowIndex) => {
              const doubled = [...row, ...row];
          return (
            <div key={rowIndex} className="overflow-hidden">
              <div className={`marquee-track flex gap-5 px-5 ${rowIndex === 1 ? 'reverse' : ''}`}>
                {doubled.map((src, index) => (
                  <img
                    key={`${src}-${index}`}
                    src={src}
                    alt="3D motion study"
                    className="h-44 w-72 shrink-0 rounded-[2rem] object-cover sm:h-64 sm:w-[28rem]"
                  />
                ))}
              </div>
            </div>
          );
            })}
      </div>
    </section>
  );
}
