import { getFirstAndLastName, getInitials } from '@/utils/helpers'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { User } from '@prisma/client'
import { Star } from 'lucide-react'

type TicketRatingCardProps = {
  rating: number
  comment?: string
  user: User
}

export function TicketRatingCard({
  rating,
  comment = '',
  user,
}: TicketRatingCardProps) {
  return (
    <div>
      <p className="text-lg font-bold mb-2 text-zinc-600">
        Avaliação do atendimento:
      </p>
      <div className="border p-4 rounded-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 mb-4 md:mb-2">
          <div className="flex items-center gap-2">
            <Avatar className="w-10 h-10 bg-zinc-200 rounded-full flex justify-center items-center">
              <AvatarImage
                src={user.image || ''}
                alt={user.name}
                className="object-cover"
              />
              <AvatarFallback className="w-10 h-10 bg-zinc-200 rounded-full flex justify-center items-center">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>

            <div>
              <span className="font-semibold">
                {getFirstAndLastName(user.name)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className={`h-4 w-4 transition-all ${rating >= n ? 'text-yellow-400' : 'text-slate-300'}`}
                  fill={rating >= n ? 'currentColor' : 'none'}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">{rating}/5</span>
          </div>
        </div>
        {comment && (
          <span className="text-gray-500 whitespace-pre-wrap">{comment}</span>
        )}
      </div>
    </div>
  )
}
