export default function Loading() {
  return (
    <div
      className="flex min-h-[60vh] items-center justify-center"
      role="status"
      aria-label="Загрузка"
    >
      <svg
        className="animate-spin"
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle
          cx="24"
          cy="24"
          r="21"
          stroke="rgba(142, 141, 138, 0.25)"
          strokeWidth="1.5"
        />
        <path
          d="M45 24C45 12.4 35.6 3 24 3"
          stroke="#E98074"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="24"
          y1="9"
          x2="24"
          y2="24"
          stroke="#E98074"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="24" cy="24" r="2" fill="#E98074" />
      </svg>
      <span className="sr-only">Загрузка…</span>
    </div>
  );
}
