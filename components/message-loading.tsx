import { useEffect, useState } from 'react'

export function MessagesLoading({ isLoading }: { isLoading: boolean }) {
  const [loadingMessages, setLoadingMessages] = useState([
    { id: 1, isRight: false },
    { id: 2, isRight: true },
    { id: 3, isRight: false },
  ])

  useEffect(() => {
    if (!isLoading) return

    const interval = setInterval(() => {
      setLoadingMessages((prev) => {
        const newId = prev[prev.length - 1].id + 1
        const lastMessageWasRight = prev[prev.length - 1].isRight
        return [
          ...prev.slice(1),
          {
            id: newId,
            isRight: !lastMessageWasRight,
          },
        ]
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [isLoading])

  return (
    <div className="flex flex-col gap-2 overflow-y-hidden">
      {loadingMessages.map((message) => (
        <div
          key={message.id}
          className={`
              animate-slide-up
              bg-zinc-100/50
              h-fit
              p-8
              space-y-2
              rounded-md
              my-1
              w-[95%] 2xl:w-[85%]
              ${message.isRight ? 'ml-auto' : 'mr-auto'}
            `}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <div className="h-6 bg-zinc-200 rounded w-40 animate-pulse" />
              <div className="h-4 bg-zinc-200 rounded w-20 animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="h-4 bg-zinc-200 rounded animate-pulse" />
              <div className="h-4 bg-zinc-200 rounded w-[90%] animate-pulse" />
              <div className="h-4 bg-zinc-200 rounded w-[95%] animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
