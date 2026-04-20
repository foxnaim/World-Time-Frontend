'use client';

import * as React from 'react';
import Link from 'next/link';
import { ProjectForm } from '@/components/dashboard/freelance/project-form';
import { useLang } from '@/i18n/context';

export default function NewProjectPage() {
  const { t } = useLang();
  return (
    <div className="flex flex-col gap-8 py-8 md:py-12">
      <header>
        <Link
          href="/freelance/projects"
          className="text-xs uppercase tracking-[0.22em] text-stone/70 hover:text-coral"
        >
          {t('projects.backToProjects')}
        </Link>
        <h1
          className="mt-3 text-4xl font-medium tracking-editorial text-stone md:text-5xl"
          style={{ fontFamily: 'Fraunces, serif' }}
        >
          {t('projects.newProjectTitle')}
        </h1>
        <p className="mt-2 max-w-xl text-sm text-stone/80">{t('projects.newProjectHint')}</p>
      </header>

      <ProjectForm mode="create" />
    </div>
  );
}
