import { ProjectStatus } from '@prisma/client';

export interface DemoProjectSeed {
  name: string;
  description: string;
  hourlyRate: string | null;
  fixedPrice: string | null;
  currency: string;
  status: ProjectStatus;
}

/**
 * Five B2C freelance projects attached to the Exteta owner user. Mix of
 * fixed-price vs hourly, active vs done, so the dashboard has variety to
 * render for the demo.
 */
export const DEMO_PROJECTS: DemoProjectSeed[] = [
  {
    name: 'Landing page redesign',
    description: 'Полный редизайн главной страницы клиента: новая навигация, hero-секция и кейсы.',
    hourlyRate: null,
    fixedPrice: '120000.00',
    currency: 'RUB',
    status: ProjectStatus.DONE,
  },
  {
    name: 'Mobile app concept',
    description: 'Концепт iOS-приложения для бронирования столиков в кафе. UI-kit + прототип.',
    hourlyRate: '1500.00',
    fixedPrice: null,
    currency: 'RUB',
    status: ProjectStatus.ACTIVE,
  },
  {
    name: 'Rebranding',
    description: 'Ребрендинг локальной сети пекарен: логотип, айдентика, guidelines, упаковка.',
    hourlyRate: null,
    fixedPrice: '300000.00',
    currency: 'RUB',
    status: ProjectStatus.ACTIVE,
  },
  {
    name: 'Blog writing',
    description: 'Ведение корпоративного блога клиента — 4 статьи в месяц, SEO-оптимизация.',
    hourlyRate: '800.00',
    fixedPrice: null,
    currency: 'RUB',
    status: ProjectStatus.ACTIVE,
  },
  {
    name: 'SEO audit',
    description: 'Технический и контентный SEO-аудит сайта с планом работ на 3 месяца.',
    hourlyRate: null,
    fixedPrice: '50000.00',
    currency: 'RUB',
    status: ProjectStatus.DONE,
  },
];
