export function AchievementsSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-5 pt-16 pb-12">
        {/* Title */}
        <div className="h-10 w-48 rounded-xl bg-muted animate-pulse mb-1" />
        <div className="h-4 w-32 rounded-lg bg-muted animate-pulse mb-6" />

        {/* Filter pills */}
        <div className="flex gap-2 flex-wrap mb-7">
          {["All", "Unlocked", "In progress", "Locked"].map((f) => (
            <div
              key={f}
              className="h-8 rounded-full bg-muted animate-pulse"
              style={{ width: `${f.length * 9 + 24}px` }}
            />
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder
              key={i}
              className="flex flex-col items-center gap-4 p-5 rounded-2xl border bg-card"
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
