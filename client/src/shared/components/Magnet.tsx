import type { ReactNode } from 'react';

type MagnetProps = {
  children: ReactNode;
};

export function Magnet({ children }: MagnetProps) {
  return <div className="transition-transform duration-300 hover:-translate-y-1">{children}</div>;
}
