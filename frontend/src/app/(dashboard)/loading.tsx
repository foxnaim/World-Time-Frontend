export default function DashboardLoading() {
  return (
    <div className="px-6 py-10">
      <div className="mb-8 h-8 w-48 animate-pulse rounded-lg bg-[#D8C3A5]/40" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="h-36 animate-pulse rounded-2xl bg-[#D8C3A5]/40" />
        <div className="h-36 animate-pulse rounded-2xl bg-[#D8C3A5]/40" />
        <div className="h-36 animate-pulse rounded-2xl bg-[#D8C3A5]/40" />
      </div>
    </div>
  );
}
