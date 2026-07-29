export default function Loading() {
  return (
    <div className="grid grid-cols-[1fr_128px] gap-2 sm:grid-cols-[1fr_200px] sm:gap-4 md:grid-cols-[1fr_340px] md:gap-6">
      <div className="min-w-0 space-y-2">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-8 w-20 shrink-0 animate-pulse rounded-full bg-[var(--color-sand-100)]" />
          ))}
        </div>
        <div className="mt-2 grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-2 sm:gap-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="card aspect-square animate-pulse bg-[var(--color-sand-100)]" />
          ))}
        </div>
      </div>
      <div className="min-w-0">
        <div className="card h-64 animate-pulse bg-[var(--color-sand-100)]" />
      </div>
    </div>
  );
}
