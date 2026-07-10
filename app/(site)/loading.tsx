export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 animate-pulse">
      <div className="h-10 w-2/3 rounded bg-[var(--bg-elevated)]" />
      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-[4/3] rounded-lg bg-[var(--bg-elevated)]" />
            <div className="h-4 w-3/4 rounded bg-[var(--bg-elevated)]" />
            <div className="h-3 w-1/2 rounded bg-[var(--bg-elevated)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
