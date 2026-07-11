export default function Loading() {
  return (
    <div className="space-y-4 py-4">
      <div className="h-14 animate-pulse rounded-xl bg-slate-100" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
      </div>
      <div className="h-80 animate-pulse rounded-xl bg-slate-100" />
    </div>
  );
}
