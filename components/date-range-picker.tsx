/* eslint-disable no-unused-vars */
'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'
import { DateRange } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface DateRangePickerProps {
  className?: string
  value: DateRange | undefined
  onChange: (date: DateRange | undefined) => void
}

export function DateRangePicker({
  className,
  value,
  onChange,
}: DateRangePickerProps) {
  const [selectedRange, setSelectedRange] = React.useState<
    DateRange | undefined
  >(value)
  const [open, setOpen] = React.useState(false)

  // Atualiza o estado local quando o valor externo muda
  React.useEffect(() => {
    setSelectedRange(value)
  }, [value])

  const handleSelect = (range: DateRange | undefined) => {
    setSelectedRange(range)
  }

  const handleFilter = () => {
    onChange(selectedRange)
    setOpen(false)
  }

  const handleClear = () => {
    setSelectedRange(undefined)
    onChange(undefined)
  }

  return (
    <div className={cn('w-full md:w-[300px] flex gap-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'w-full md:w-[300px] h-12 justify-start text-left font-normal',
              !selectedRange && 'text-muted-foreground',
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedRange?.from ? (
              selectedRange.to ? (
                <>
                  {format(selectedRange.from, 'LLL dd, y', { locale: ptBR })} -{' '}
                  {format(selectedRange.to, 'LLL dd, y', { locale: ptBR })}
                </>
              ) : (
                format(selectedRange.from, 'LLL dd, y', { locale: ptBR })
              )
            ) : (
              <span>Selecione um período</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="center">
          <Calendar
            initialFocus
            mode="range"
            captionLayout="dropdown"
            defaultMonth={selectedRange?.from}
            selected={selectedRange}
            onSelect={handleSelect}
            numberOfMonths={2}
            locale={ptBR}
            showOutsideDays={false}
          />
          <div className="mt-4 flex justify-end gap-2">
            <Button
              onClick={handleClear}
              variant="outline"
              disabled={!selectedRange}
            >
              Limpar
            </Button>
            <Button
              onClick={handleFilter}
              disabled={!selectedRange?.from || !selectedRange?.to}
            >
              Filtrar
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
