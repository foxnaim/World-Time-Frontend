import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Политика конфиденциальности — Work Tact',
};

const SECTIONS = [
  {
    label: '01 — Общее',
    heading: 'Кто собирает данные',
    body: 'Настоящая политика конфиденциальности регулирует обработку персональных данных пользователей сервиса Work Tact. Оператором данных является Work Tact, зарегистрированная в городе Алматы, Республика Казахстан. Используя приложение, вы соглашаетесь с условиями настоящей политики.',
  },
  {
    label: '02 — Данные',
    heading: 'Какие данные мы собираем',
    body: 'Мы собираем: Telegram ID и отображаемое имя пользователя, адрес электронной почты (по желанию, при регистрации через веб-интерфейс), временны́е метки входа и выхода с рабочего места, данные геолокации устройства — только если вы явно разрешили доступ к ней и только в момент сканирования QR-кода.',
  },
  {
    label: '03 — Использование',
    heading: 'Как мы используем данные',
    body: 'Собранные данные используются исключительно для: ведения учёта рабочего времени сотрудников, формирования отчётов для работодателя и сотрудника, отправки уведомлений и напоминаний через Telegram-бот, обнаружения попыток мошенничества (подмена GPS, эмулятор, повторное сканирование). Данные не передаются третьим лицам и не используются в рекламных целях.',
  },
  {
    label: '04 — Хранение',
    heading: 'Где и как хранятся данные',
    body: 'Данные хранятся на серверах, расположенных в Европейском Союзе (Германия). Передача данных осуществляется по зашифрованному каналу (TLS 1.3). Данные в базе хранятся в зашифрованном виде. Срок хранения — не более 36 месяцев с момента последней активности аккаунта, если иное не предусмотрено законодательством Республики Казахстан.',
  },
  {
    label: '05 — Права',
    heading: 'Ваши права',
    body: 'Вы вправе в любой момент: запросить экспорт всех своих данных в формате JSON через раздел «Профиль», удалить аккаунт и все связанные с ним данные — функция доступна в настройках профиля, отозвать разрешение на геолокацию в настройках своего устройства. Запрос на удаление обрабатывается в течение 7 рабочих дней.',
  },
  {
    label: '06 — Контакт',
    heading: 'Связь и вопросы',
    body: 'По любым вопросам, связанным с обработкой персональных данных, обратитесь в поддержку через Telegram-бот Work Tact. Мы ответим в течение 3 рабочих дней. Настоящая политика вступила в силу в апреле 2026 года и может быть обновлена — актуальная версия всегда доступна по адресу /privacy.',
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#EAE7DC] text-[#3d3b38] px-6 py-16 md:px-16 md:py-24">
      <div className="max-w-3xl mx-auto flex flex-col gap-12">
        <header className="flex flex-col gap-5">
          <Link
            href="/"
            className="self-start text-[10px] uppercase tracking-[0.28em] text-[#6b6966] hover:text-[#E98074] transition-colors"
          >
            ← На главную
          </Link>
          <div className="flex flex-col gap-3 border-b border-[#8E8D8A]/20 pb-10">
            <span className="text-[10px] uppercase tracking-[0.28em] text-[#6b6966]">
              Политика конфиденциальности
            </span>
            <h1
              className="text-5xl md:text-6xl font-medium leading-[0.95] tracking-tight text-[#3d3b38]"
              style={{ fontFamily: 'Fraunces, serif' }}
            >
              Конфиденциальность
            </h1>
            <p className="text-sm text-[#6b6966] mt-2">
              Work Tact · Work Tact · Алматы · апрель 2026
            </p>
          </div>
        </header>

        {SECTIONS.map((s) => (
          <section
            key={s.label}
            className="flex flex-col gap-4 border-b border-[#8E8D8A]/20 pb-10 last:border-0 last:pb-0"
          >
            <span className="text-[10px] uppercase tracking-[0.28em] text-[#6b6966]">
              {s.label}
            </span>
            <h2
              className="text-2xl md:text-3xl font-medium tracking-tight text-[#3d3b38]"
              style={{ fontFamily: 'Fraunces, serif' }}
            >
              {s.heading}
            </h2>
            <p className="text-sm leading-relaxed text-[#3d3b38]">{s.body}</p>
          </section>
        ))}

        <footer className="pt-2 flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-[0.28em] text-[#6b6966]">
            © 2026 Work Tact
          </span>
        </footer>
      </div>
    </div>
  );
}
