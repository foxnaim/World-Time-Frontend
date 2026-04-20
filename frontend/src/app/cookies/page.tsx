import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Политика Cookies — Work Tact",
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-[#EAE7DC] text-[#3d3b38] px-6 py-16 md:px-16 md:py-24">
      <div className="max-w-3xl mx-auto flex flex-col gap-12">

        <header className="flex flex-col gap-4">
          <Link
            href="/"
            className="text-sm text-[#6b6966] hover:text-[#E98074] transition-colors w-fit"
          >
            ← На главную
          </Link>
          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-[0.28em] text-[#6b6966]">
              Политика Cookies
            </span>
            <h1 style={{ fontFamily: "Fraunces, serif" }} className="text-4xl font-semibold">
              Файлы cookies
            </h1>
          </div>
        </header>

        <section className="flex flex-col gap-3 border-t border-[#8E8D8A]/20 pt-8">
          <span className="text-[10px] uppercase tracking-[0.28em] text-[#6b6966]">
            01 — Что такое cookies
          </span>
          <h2 style={{ fontFamily: "Fraunces, serif" }} className="text-xl font-medium">
            Небольшие файлы в вашем браузере
          </h2>
          <p className="text-sm leading-relaxed text-[#6b6966]">
            Cookies — это небольшие текстовые файлы, которые сайт сохраняет в браузере при посещении.
            Они позволяют сайту запоминать ваши действия и предпочтения между сессиями.
            Work Tact использует минимальный набор cookies, необходимый исключительно для работы
            авторизации.
          </p>
        </section>

        <section className="flex flex-col gap-6 border-t border-[#8E8D8A]/20 pt-8">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-[0.28em] text-[#6b6966]">
              02 — Какие cookies мы используем
            </span>
            <h2 style={{ fontFamily: "Fraunces, serif" }} className="text-xl font-medium">
              Только необходимое
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1 p-4 rounded-lg border border-[#8E8D8A]/20 bg-[#E98074]/5">
              <span className="text-xs font-medium text-[#E98074] uppercase tracking-wide">
                Необходимые
              </span>
              <p className="text-sm leading-relaxed text-[#6b6966]">
                Сессионный токен авторизации — устанавливается при входе в аккаунт. Флаг{" "}
                <code className="text-[#3d3b38] bg-[#8E8D8A]/10 px-1 rounded text-xs">httpOnly</code>{" "}
                защищает его от доступа из JavaScript. Cookie не имеет фиксированного срока
                истечения и хранится до явного выхода из системы. Без него работа приложения
                невозможна.
              </p>
            </div>

            <div className="flex flex-col gap-1 p-4 rounded-lg border border-[#8E8D8A]/20 bg-[#8E8D8A]/5">
              <span className="text-xs font-medium text-[#6b6966] uppercase tracking-wide">
                Аналитические
              </span>
              <p className="text-sm leading-relaxed text-[#6b6966]">
                Мы не используем сторонние аналитические трекеры — ни Google Analytics, ни
                аналогичные сервисы. Данные о вашем поведении на сайте нам не нужны.
              </p>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-3 border-t border-[#8E8D8A]/20 pt-8">
          <span className="text-[10px] uppercase tracking-[0.28em] text-[#6b6966]">
            03 — Управление cookies
          </span>
          <h2 style={{ fontFamily: "Fraunces, serif" }} className="text-xl font-medium">
            Ваш контроль
          </h2>
          <p className="text-sm leading-relaxed text-[#6b6966]">
            Вы можете удалить или заблокировать cookies через настройки браузера. Однако имейте
            в виду: если вы заблокируете или удалите сессионный cookie, вы будете автоматически
            разлогинены и не сможете пользоваться приложением без повторного входа.
          </p>
        </section>

        <section className="flex flex-col gap-3 border-t border-[#8E8D8A]/20 pt-8">
          <span className="text-[10px] uppercase tracking-[0.28em] text-[#6b6966]">
            04 — Реклама и третьи стороны
          </span>
          <h2 style={{ fontFamily: "Fraunces, serif" }} className="text-xl font-medium">
            Никакой рекламы
          </h2>
          <p className="text-sm leading-relaxed text-[#6b6966]">
            Мы не используем рекламные cookies и не передаём какие-либо данные рекламным сетям,
            брокерам данных или иным третьим сторонам. Work Tact — продукт без рекламной модели.
          </p>
        </section>

        <section className="flex flex-col gap-3 border-t border-[#8E8D8A]/20 pt-8">
          <span className="text-[10px] uppercase tracking-[0.28em] text-[#6b6966]">
            05 — Вопросы
          </span>
          <h2 style={{ fontFamily: "Fraunces, serif" }} className="text-xl font-medium">
            Свяжитесь с нами
          </h2>
          <p className="text-sm leading-relaxed text-[#6b6966]">
            Если у вас есть вопросы по использованию cookies в Work Tact, обратитесь в поддержку через Telegram-бот.
          </p>
        </section>

        <footer className="border-t border-[#8E8D8A]/20 pt-8">
          <p className="text-[11px] text-[#6b6966]">
            Work Tact — Казахстан. Последнее обновление: апрель 2026.
          </p>
        </footer>

      </div>
    </div>
  );
}
