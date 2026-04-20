export default function EmployeesLoading() {
  return (
    <div className="px-6 py-10">
      <div className="mb-6 h-8 w-56 animate-pulse rounded-lg bg-[#D8C3A5]/40" />
      <div className="overflow-hidden rounded-2xl border border-[#D8C3A5]/40 bg-white/50">
        <div className="flex items-center gap-4 border-b border-[#D8C3A5]/40 bg-[#D8C3A5]/30 px-6 py-4">
          <div className="h-4 w-1/4 animate-pulse rounded bg-[#D8C3A5]/60" />
          <div className="h-4 w-1/5 animate-pulse rounded bg-[#D8C3A5]/60" />
          <div className="h-4 w-1/6 animate-pulse rounded bg-[#D8C3A5]/60" />
          <div className="h-4 w-1/6 animate-pulse rounded bg-[#D8C3A5]/60" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-[#D8C3A5]/30 px-6 py-5 last:border-b-0"
          >
            <div className="h-4 w-1/4 animate-pulse rounded bg-[#D8C3A5]/40" />
            <div className="h-4 w-1/5 animate-pulse rounded bg-[#D8C3A5]/40" />
            <div className="h-4 w-1/6 animate-pulse rounded bg-[#D8C3A5]/40" />
            <div className="h-4 w-1/6 animate-pulse rounded bg-[#D8C3A5]/40" />
          </div>
        ))}
      </div>
    </div>
  );
}
