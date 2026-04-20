export default function ReportsLoading() {
  return (
    <div className="px-6 py-10">
      <div className="mb-6 h-8 w-48 animate-pulse rounded-lg bg-[#D8C3A5]/40" />
      <div className="mb-6 flex gap-2">
        <div className="h-9 w-24 animate-pulse rounded-full bg-[#D8C3A5]/40" />
        <div className="h-9 w-28 animate-pulse rounded-full bg-[#D8C3A5]/40" />
        <div className="h-9 w-20 animate-pulse rounded-full bg-[#D8C3A5]/40" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-xl bg-[#D8C3A5]/40"
          />
        ))}
      </div>
    </div>
  );
}
