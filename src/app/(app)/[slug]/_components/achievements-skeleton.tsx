export function AchievementsSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-5 pt-10 sm:pt-16 pb-12">
        {/* Title */}
        <div className="h-9 sm:h-10 w-48 rounded-xl bg-muted animate-pulse mb-1" />
        <div className="h-4 w-32 rounded-lg bg-muted animate-pulse mb-5 sm:mb-6" />

        {/* Search — mobile only */}
        <div className="h-8 rounded-lg bg-muted animate-pulse mb-4 sm:hidden" />

        {/* Filters row */}
        <div className="flex items-center justify-between gap-3 mb-6 sm:mb-7">
          <div className="flex gap-1">
            {[72, 96, 110, 90].map((w, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder
                key={i}
                className="h-9 rounded-full bg-muted animate-pulse"
                style={{ width: `${w}px` }}
              />
            ))}
          </div>
          {/* Search — desktop only */}
          <div className="h-8 w-44 rounded-lg bg-muted animate-pulse hidden sm:block" />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder
              key={i}
              className="flex flex-col items-center gap-4 p-5 rounded-2xl border bg-card h-full"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="w-14 h-14 rounded-xl bg-muted animate-pulse" />
              <div className="flex flex-col items-center gap-1.5 w-full">
                <div className="h-3.5 w-3/4 rounded-md bg-muted animate-pulse" />
                <div className="h-3 w-1/2 rounded-md bg-muted animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
