export default function FreelanceProjectsLoading() {
  return (
    <div className="px-6 py-10">
      <div className="mb-6 h-8 w-48 animate-pulse rounded-lg bg-[#D8C3A5]/40" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-2xl bg-[#D8C3A5]/40"
          />
        ))}
      </div>
    </div>
  );
}
