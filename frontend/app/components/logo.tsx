'use client';
import Image from 'next/image';

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Image src="/logo.png" alt="Konyx" width={36} height={36} priority />
      <span className="text-xl font-bold tracking-tight text-brand-600">Konyx</span>
    </div>
  );
}
