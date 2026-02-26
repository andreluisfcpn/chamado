'use client'
import React, { useState } from 'react'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from './ui/dialog'
import { Star } from 'lucide-react'
import axios from 'axios'
import { useParams } from 'next/navigation'
import useSWR from 'swr'
import { toast } from 'sonner'
import { TextareaComponent } from './textarea'

const fetcherTicket = async ([url, code]: any) =>
  await axios.get(url, { params: { code } }).then((res) => res.data)

export function TicketRating({
  initialRating,
  initialComment,
  canRate,
}: {
  initialRating?: number | null
  initialComment?: string | null
  canRate?: boolean
}) {
  const params = useParams<{ code: string }>()

  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState<number>(initialRating ?? 0)
  const [hover, setHover] = useState<number | null>(null)
  const [comment, setComment] = useState(initialComment ?? '')
  const [loading, setLoading] = useState(false)

  const { mutate } = useSWR(
    ['/api/tickets/details', params.code],
    fetcherTicket,
  )

  const submit = async () => {
    if (!canRate) return
    setLoading(true)

    await axios
      .post(`/api/tickets/ticket/rating`, {
        rating,
        comment,
        ticketCode: params.code,
      })
      .then((response) => {
        toast.success(response.data.message)
        mutate(['/api/tickets/details', params.code])
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || 'Erro ao enviar avaliação')
      })
      .finally(() => {
        setLoading(false)
        setOpen(false)
      })
  }

  return (
    <div className={canRate ? 'mt-4 block' : 'hidden'}>
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(null)}
            onClick={() => setRating(n)}
            aria-label={`${n} estrelas`}
            className="p-1 cursor-pointer"
          >
            <Star
              className={`h-5 w-5 transition-all ${(hover ?? rating) >= n ? 'text-yellow-400' : 'text-slate-300'}`}
              strokeWidth={2.5}
              fill={rating >= n ? 'currentColor' : 'none'}
            />
          </button>
        ))}
        <span className="text-sm text-muted-foreground">
          {rating ? `${rating}/5` : 'Sem avaliação'}
        </span>
      </div>

      {canRate && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="mt-2">
              Avaliar Chamado
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Avaliar Chamado</DialogTitle>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setRating(n)}
                    className="p-1 cursor-pointer"
                  >
                    <Star
                      className={`h-6 w-6 ${rating >= n ? 'text-yellow-400' : 'text-slate-300'}`}
                      strokeWidth={2.5}
                      fill={rating >= n ? 'currentColor' : 'none'}
                    />
                  </button>
                ))}
              </div>
              <TextareaComponent
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                label="Comentário (opcional)"
                placeholder="Deixe seu comentário sobre o atendimento"
                rows={5}
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={submit} disabled={loading || rating === 0}>
                  {loading ? 'Enviando...' : 'Enviar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
