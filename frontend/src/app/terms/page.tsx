import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Условия использования — Work Tact',
};

export default function TermsPage() {
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
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#6b6966]">
            Условия использования
          </p>
          <h1 style={{ fontFamily: 'Fraunces, serif' }} className="text-4xl md:text-5xl font-semibold leading-tight">
            Условия использования Work Tact
          </h1>
          <p className="text-sm text-[#6b6966]">
            Последнее обновление: апрель 2026
          </p>
        </header>

        <div className="h-px bg-[#8E8D8A]/20" />

        <section className="flex flex-col gap-3">
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#6b6966]">01 — Описание сервиса</p>
          <h2 style={{ fontFamily: 'Fraunces, serif' }} className="text-2xl font-semibold">
            Что такое Work Tact
          </h2>
          <p className="text-sm leading-relaxed text-[#3d3b38]">
            Work Tact — это облачная система учёта рабочего времени, разработанная Work Tact (Казахстан).
            Сервис позволяет фиксировать приходы и уходы сотрудников с помощью QR-кодов и геозон,
            формировать отчёты, экспортировать данные в Google Sheets и настраивать гибкие правила
            присутствия. Используя Work Tact, вы соглашаетесь с настоящими Условиями использования
            в полном объёме.
          </p>
        </section>

        <div className="h-px bg-[#8E8D8A]/20" />

        <section className="flex flex-col gap-3">
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#6b6966]">02 — Регистрация</p>
          <h2 style={{ fontFamily: 'Fraunces, serif' }} className="text-2xl font-semibold">
            Учётные записи
          </h2>
          <p className="text-sm leading-relaxed text-[#3d3b38]">
            Доступ к сервису предоставляется через авторизацию по Telegram. Каждый пользователь
            вправе иметь только одну учётную запись, привязанную к его Telegram-аккаунту.
            Регистрация нескольких аккаунтов одним лицом запрещена. Вы несёте полную ответственность
            за сохранность доступа к вашему Telegram-аккаунту и за все действия, совершённые
            от вашего имени в Work Tact.
          </p>
        </section>

        <div className="h-px bg-[#8E8D8A]/20" />

        <section className="flex flex-col gap-3">
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#6b6966]">03 — Правила использования</p>
          <h2 style={{ fontFamily: 'Fraunces, serif' }} className="text-2xl font-semibold">
            Допустимое использование
          </h2>
          <p className="text-sm leading-relaxed text-[#3d3b38]">
            Пользователь обязуется не передавать доступ к своей учётной записи третьим лицам,
            не использовать сервис в интересах иных организаций без отдельного письменного
            соглашения, а также не предпринимать попыток подделать или фальсифицировать данные
            о присутствии — в том числе путём имитации геолокации, использования чужих QR-кодов,
            автоматических скриптов или иных технических средств обхода системы контроля.
            Нарушение данных правил является основанием для немедленного прекращения доступа
            к сервису.
          </p>
        </section>

        <div className="h-px bg-[#8E8D8A]/20" />

        <section className="flex flex-col gap-3">
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#6b6966]">04 — Тарифы и оплата</p>
          <h2 style={{ fontFamily: 'Fraunces, serif' }} className="text-2xl font-semibold">
            Планы и подписка
          </h2>
          <p className="text-sm leading-relaxed text-[#3d3b38]">
            Work Tact предоставляет бесплатный план для организаций численностью до 5 сотрудников
            без ограничения по времени использования. Для более крупных команд доступны платные
            тарифные планы с ежемесячной или ежегодной подпиской. Стоимость и условия каждого
            плана указаны на странице тарифов. Оплата производится в тенге (KZT). При отмене
            подписки доступ к платным функциям сохраняется до конца оплаченного периода;
            возврат средств за неиспользованное время не производится.
          </p>
        </section>

        <div className="h-px bg-[#8E8D8A]/20" />

        <section className="flex flex-col gap-3">
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#6b6966]">05 — Ответственность</p>
          <h2 style={{ fontFamily: 'Fraunces, serif' }} className="text-2xl font-semibold">
            Ограничение ответственности
          </h2>
          <p className="text-sm leading-relaxed text-[#3d3b38]">
            Сервис предоставляется «как есть». Work Tact прилагает разумные усилия для
            обеспечения бесперебойной работы Work Tact, однако не несёт ответственности за
            убытки или ущерб, возникшие вследствие технических сбоев, плановых или внеплановых
            технических работ, недоступности серверов, а также сбоев на стороне провайдеров
            Telegram, Google или иных третьих сторон. Совокупная ответственность Work Tact
            перед пользователем ни при каких обстоятельствах не превышает суммы, уплаченной
            за последний расчётный период.
          </p>
        </section>

        <div className="h-px bg-[#8E8D8A]/20" />

        <section className="flex flex-col gap-3">
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#6b6966]">06 — Изменения условий</p>
          <h2 style={{ fontFamily: 'Fraunces, serif' }} className="text-2xl font-semibold">
            Обновление Условий
          </h2>
          <p className="text-sm leading-relaxed text-[#3d3b38]">
            Work Tact оставляет за собой право вносить изменения в настоящие Условия
            использования. О существенных изменениях пользователи будут уведомлены через
            Telegram-бот Work Tact не позднее чем за 7 календарных дней до вступления
            изменений в силу. Продолжение использования сервиса после указанной даты означает
            принятие обновлённых Условий.
          </p>
        </section>

        <div className="h-px bg-[#8E8D8A]/20" />

        <section className="flex flex-col gap-3">
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#6b6966]">07 — Расторжение</p>
          <h2 style={{ fontFamily: 'Fraunces, serif' }} className="text-2xl font-semibold">
            Удаление аккаунта
          </h2>
          <p className="text-sm leading-relaxed text-[#3d3b38]">
            Пользователь вправе удалить свою учётную запись в любой момент через раздел
            «Профиль» в настройках приложения. После удаления все персональные данные
            пользователя будут удалены с серверов в течение 30 дней, за исключением
            информации, хранение которой предусмотрено действующим законодательством
            Республики Казахстан. Work Tact также вправе прекратить доступ к сервису
            в одностороннем порядке при систематическом нарушении настоящих Условий.
          </p>
        </section>

        <div className="h-px bg-[#8E8D8A]/20" />

        <section className="flex flex-col gap-3">
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#6b6966]">08 — Применимое право</p>
          <h2 style={{ fontFamily: 'Fraunces, serif' }} className="text-2xl font-semibold">
            Юрисдикция
          </h2>
          <p className="text-sm leading-relaxed text-[#3d3b38]">
            Настоящие Условия использования регулируются и толкуются в соответствии с
            законодательством Республики Казахстан. Все споры, возникающие в связи с
            использованием сервиса, подлежат урегулированию путём переговоров, а при
            невозможности достижения согласия — в судебном порядке по месту нахождения
            Work Tact.
          </p>
        </section>

        <div className="h-px bg-[#8E8D8A]/20" />

        <section className="flex flex-col gap-3">
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#6b6966]">09 — Контакты</p>
          <h2 style={{ fontFamily: 'Fraunces, serif' }} className="text-2xl font-semibold">
            Связаться с нами
          </h2>
          <p className="text-sm leading-relaxed text-[#3d3b38]">
            По вопросам, связанным с настоящими Условиями использования, обратитесь в поддержку через Telegram-бот Work Tact. Мы стараемся отвечать в течение двух рабочих дней.
          </p>
        </section>

        <div className="h-px bg-[#8E8D8A]/20" />

        <footer className="text-[10px] text-[#6b6966] uppercase tracking-[0.2em]">
          © 2026 Work Tact, Казахстан — Work Tact
        </footer>

      </div>
    </div>
  );
}
