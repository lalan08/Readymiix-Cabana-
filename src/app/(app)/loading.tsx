export default function Loading() {
  return (
    <div className="space-y-5">
      <div className="h-7 w-40 animate-pulse rounded-lg bg-[var(--color-sand-200)]" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card h-24 animate-pulse bg-[var(--color-sand-100)]" />
        ))}
      </div>
      <div className="space-y-2.5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="card h-16 animate-pulse bg-[var(--color-sand-100)]" />
        ))}
      </div>
    </div>
  );
}
