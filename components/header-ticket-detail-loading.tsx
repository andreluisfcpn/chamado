export function HeaderTicketDetailLoading() {
  return (
    <div className="animate-pulse">
      <div className="flex flex-col 2xl:flex-row items-start 2xl:items-center justify-between gap-0 2xl:gap-4">
        <div className="w-64 h-6 rounded bg-zinc-100" />
        <div className="w-32 h-6 rounded bg-zinc-100 mt-1" />
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-2 mt-4 md:mt-1">
        <div className="w-48 h-6 rounded bg-zinc-100" />
        <div className="w-32 h-6 rounded bg-zinc-100" />
        <div className="w-40 h-6 rounded bg-zinc-100" />
      </div>

      <div className="flex flex-col md:flex-row items-start justify-start md:justify-center gap-8 md:gap-16 bg-zinc-50 p-8 mt-4 rounded-md">
        <div className="flex flex-row md:flex-col items-center justify-center text-center gap-3 md:gap-1">
          <div className="w-12 h-12 bg-zinc-200 rounded-full flex justify-center items-center" />
          <div className="flex flex-col items-start md:items-center">
            <div className="w-28 h-4 rounded bg-zinc-200" />
            <div className="w-48 h-6 rounded bg-zinc-200 mt-1" />
          </div>
        </div>

        <div className="flex flex-row md:flex-col items-center justify-center text-center gap-3 md:gap-1">
          <div className="w-12 h-12 bg-zinc-200 rounded-full flex justify-center items-center" />
          <div className="flex flex-col items-start md:items-center">
            <div className="w-28 h-4 rounded bg-zinc-200" />
            <div className="w-48 h-6 rounded bg-zinc-200 mt-1" />
          </div>
        </div>
      </div>
    </div>
  )
}
