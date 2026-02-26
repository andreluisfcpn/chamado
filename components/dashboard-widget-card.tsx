import { LoaderCircle, Minus, TrendingDown, TrendingUp } from 'lucide-react'
import { Badge } from './ui/badge'
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card'

interface DashboardWidgetCardProps {
  total: number
  porcentagem: number
  message: string
  title: string
  isLoading?: boolean
  totalType?: 'number' | 'percentage' | 'time'
}

export function DashboardWidgetCard({
  isLoading,
  message,
  porcentagem,
  title,
  total,
  totalType = 'number',
}: DashboardWidgetCardProps) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>
          {isLoading ? (
            <div className="w-40 h-5 bg-zinc-200 rounded animate-pulse" />
          ) : (
            title
          )}
        </CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {isLoading ? (
            <div className="w-6 h-8 bg-zinc-200 rounded animate-pulse" />
          ) : (
            `${totalType === 'percentage' ? total + '%' : totalType === 'time' ? total + 'h' : total}`
          )}
        </CardTitle>
        <CardAction>
          <Badge
            variant="outline"
            className={`font-medium ${
              isLoading
                ? 'bg-transparent border-zinc-200 text-zinc-300 animate-pulse'
                : porcentagem > 0
                  ? 'bg-emerald-100 border-emerald-100 text-emerald-600'
                  : porcentagem === 0
                    ? 'text-zinc-500'
                    : 'bg-red-100 border-red-100 text-red-600'
            }`}
          >
            {isLoading ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : total > 0 ? (
              <TrendingUp className="mr-1 h-4 w-4" />
            ) : total === 0 ? (
              <Minus className="mr-1 h-4 w-4" />
            ) : (
              <TrendingDown className="mr-1 h-4 w-4" />
            )}
            {!isLoading && `${porcentagem}%`}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          {isLoading ? (
            <div className="w-80 h-4 bg-zinc-200 rounded animate-pulse" />
          ) : (
            message
          )}
        </div>
        <div className="text-muted-foreground">
          {isLoading ? (
            <div className="w-64 h-4 bg-zinc-200 rounded animate-pulse" />
          ) : (
            'Comparado com o período anterior'
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
