import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Безопасность — Work Tact",
};

export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-[#EAE7DC] text-[#3d3b38] px-6 py-16 md:px-16 md:py-24">
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
              Безопасность
            </span>
            <h1 className="font-[Fraunces,serif] text-4xl md:text-5xl font-semibold leading-tight">
              Как мы защищаем ваши данные
            </h1>
          </div>
        </header>

        <section className="flex flex-col gap-3 border-t border-[#8E8D8A]/20 pt-8">
          <span className="text-[10px] uppercase tracking-[0.28em] text-[#6b6966]">
            Аутентификация
          </span>
          <h2 className="font-[Fraunces,serif] text-2xl font-medium">
            Вход через Telegram
          </h2>
          <p className="text-sm leading-relaxed text-[#6b6966]">
            Work Tact не хранит пароли. Вход осуществляется исключительно через Telegram Bot: пользователь подтверждает личность в мессенджере, после чего сервер выдаёт JWT-токен с коротким сроком действия. Токен обновляется автоматически при активной сессии и немедленно инвалидируется при выходе. Это исключает утечку учётных данных даже при компрометации базы данных.
          </p>
        </section>

        <section className="flex flex-col gap-3 border-t border-[#8E8D8A]/20 pt-8">
          <span className="text-[10px] uppercase tracking-[0.28em] text-[#6b6966]">
            QR-токены
          </span>
          <h2 className="font-[Fraunces,serif] text-2xl font-medium">
            Одноразовые коды для отметки
          </h2>
          <p className="text-sm leading-relaxed text-[#6b6966]">
            Каждый QR-код содержит уникальный токен, сгенерированный с помощью nanoid. Срок жизни токена — 45 секунд. После первого успешного сканирования токен помечается как использованный в PostgreSQL, повторное сканирование того же кода невозможно. Генерация нового кода происходит только на сервере — клиент не может подделать или переиспользовать токен.
          </p>
        </section>

        <section className="flex flex-col gap-3 border-t border-[#8E8D8A]/20 pt-8">
          <span className="text-[10px] uppercase tracking-[0.28em] text-[#6b6966]">
            Геозоны
          </span>
          <h2 className="font-[Fraunces,serif] text-2xl font-medium">
            Проверка местоположения на сервере
          </h2>
          <p className="text-sm leading-relaxed text-[#6b6966]">
            Координаты, переданные клиентом, никогда не принимаются на веру. Все геозональные проверки выполняются на стороне сервера: расчёт расстояния между точкой сотрудника и радиусом офиса происходит исключительно в бэкенде. Подмена координат на устройстве не позволит зарегистрировать присутствие вне допустимой зоны.
          </p>
        </section>

        <section className="flex flex-col gap-3 border-t border-[#8E8D8A]/20 pt-8">
          <span className="text-[10px] uppercase tracking-[0.28em] text-[#6b6966]">
            Транспорт
          </span>
          <h2 className="font-[Fraunces,serif] text-2xl font-medium">
            Только HTTPS / TLS
          </h2>
          <p className="text-sm leading-relaxed text-[#6b6966]">
            Все соединения между клиентом, сервером и внешними сервисами защищены протоколом TLS. HTTP-запросы автоматически перенаправляются на HTTPS. Webhook-адреса Telegram Bot также работают только по зашифрованному каналу. Незашифрованная передача данных полностью исключена на уровне инфраструктуры.
          </p>
        </section>

        <section className="flex flex-col gap-3 border-t border-[#8E8D8A]/20 pt-8">
          <span className="text-[10px] uppercase tracking-[0.28em] text-[#6b6966]">
            Хранение данных
          </span>
          <h2 className="font-[Fraunces,serif] text-2xl font-medium">
            PostgreSQL и Redis
          </h2>
          <p className="text-sm leading-relaxed text-[#6b6966]">
            Основные данные хранятся в PostgreSQL с шифрованием на уровне диска (encryption at rest). Сессии и временные токены кешируются в Redis с явным TTL — данные удаляются автоматически по истечении срока. Резервные копии базы данных создаются ежедневно и хранятся в зашифрованном виде. Прямой публичный доступ к базе данных закрыт; подключение возможно только через приватную сеть.
          </p>
        </section>

        <section className="flex flex-col gap-3 border-t border-[#8E8D8A]/20 pt-8">
          <span className="text-[10px] uppercase tracking-[0.28em] text-[#6b6966]">
            Доступ к данным
          </span>
          <h2 className="font-[Fraunces,serif] text-2xl font-medium">
            Изоляция по компании
          </h2>
          <p className="text-sm leading-relaxed text-[#6b6966]">
            Данные сотрудников строго изолированы на уровне компании. Только владелец и менеджеры компании могут просматривать статистику посещаемости, отчёты и профили своих сотрудников. Сотрудник видит только собственную историю. Доступ между разными компаниями исключён на уровне каждого запроса к API.
          </p>
        </section>

        <section className="flex flex-col gap-3 border-t border-[#8E8D8A]/20 pt-8">
          <span className="text-[10px] uppercase tracking-[0.28em] text-[#6b6966]">
            Уязвимости
          </span>
          <h2 className="font-[Fraunces,serif] text-2xl font-medium">
            Ответственное раскрытие
          </h2>
          <p className="text-sm leading-relaxed text-[#6b6966]">
            Если вы обнаружили уязвимость в Work Tact, пожалуйста, сообщите нам через Telegram-бот Work Tact. Мы обязуемся ответить в течение 72 часов, не предпринимать юридических действий против исследователей, действующих добросовестно, и устранить подтверждённые проблемы в приоритетном порядке. Публичное раскрытие просим согласовывать с нами заранее.
          </p>
        </section>

        <footer className="border-t border-[#8E8D8A]/20 pt-8">
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#6b6966]">
            Последнее обновление — апрель 2026
          </p>
        </footer>

      </div>
    </main>
  );
}
