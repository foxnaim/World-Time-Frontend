'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function BillingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const { slug } = useParams<{ slug: string }>();
  const message = error.message || 'Неизвестная ошибка';

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-[#D8C3A5]/60 bg-white/70 p-8 shadow-sm backdrop-blur">
        <h1 className="font-serif text-3xl text-[#2B2A28]">
          Что-то пошло не так
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[#5A5852]">
          {message}
        </p>
        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={() => reset()}
            className="rounded-full bg-[#E98074] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#d66d61]"
          >
            Попробовать снова
          </button>
          <Link
            href={`/company/${slug}`}
            className="text-sm text-[#5A5852] underline-offset-4 hover:text-[#2B2A28] hover:underline"
          >
            Вернуться к компании
          </Link>
        </div>
      </div>
    </div>
  );
}
