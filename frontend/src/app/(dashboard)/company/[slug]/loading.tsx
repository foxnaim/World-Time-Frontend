export default function CompanyOverviewLoading() {
  return (
    <div className="px-6 py-10">
      <div className="mb-8 h-8 w-64 animate-pulse rounded-lg bg-[#D8C3A5]/40" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="h-28 animate-pulse rounded-2xl bg-[#D8C3A5]/40" />
        <div className="h-28 animate-pulse rounded-2xl bg-[#D8C3A5]/40" />
        <div className="h-28 animate-pulse rounded-2xl bg-[#D8C3A5]/40" />
        <div className="h-28 animate-pulse rounded-2xl bg-[#D8C3A5]/40" />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="h-64 animate-pulse rounded-2xl bg-[#D8C3A5]/40" />
        <div className="h-64 animate-pulse rounded-2xl bg-[#D8C3A5]/40" />
      </div>
    </div>
  );
}
