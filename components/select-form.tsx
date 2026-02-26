/* eslint-disable no-unused-vars */
import { Check, ChevronsUpDown, LoaderCircle } from 'lucide-react'
import { Button } from './ui/button'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { Label } from './ui/label'

type ItemProps = {
  label: string
  value: string
}

interface SelectFormProps {
  items: ItemProps[]
  label: string
  fieldName?: string
  error?: string
  isRequired?: boolean
  itemSelected: (value: any) => void
  defaultValue?: string
  value?: string
  isLoading?: boolean
}

export function SelectForm({
  items,
  label,
  fieldName,
  error,
  isRequired = false,
  itemSelected,
  defaultValue = '',
  value: controlledValue,
  isLoading = false,
}: SelectFormProps) {
  const [open, setOpen] = useState(false)
  const [internalValue, setInternalValue] = useState(defaultValue)

  // Valor do select: controlado externamente ou interno
  const value = controlledValue !== undefined ? controlledValue : internalValue

  const handleChangeValue = (value: string) => {
    if (controlledValue === undefined) {
      setInternalValue(value)
    }
    itemSelected(value)
  }

  return (
    <div className="w-full flex flex-col space-y-2">
      {fieldName && (
        <Label
          className={isLoading ? 'opacity-50' : error ? 'text-red-600' : ''}
        >
          {fieldName} {isRequired && <span className="text-red-600">*</span>}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={`w-full justify-between h-12 ${value ? 'text-muted-foreground' : 'text-zinc-300'}`}
            disabled={isLoading || items.length === 0}
          >
            {value
              ? items.find((item) => item.value === value)?.label
              : `Selecione ${label}`}

            {isLoading ? (
              <LoaderCircle size={16} className="animate-spin opacity-50" />
            ) : (
              <ChevronsUpDown />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full sm:w-[350px] p-0">
          <Command
            filter={(value, search) => {
              const item = items.find((item) => item.value === value)
              if (!item) return 0
              if (item.label.toLowerCase().includes(search.toLowerCase()))
                return 1

              return 0
            }}
          >
            <CommandInput placeholder={`Busque ${label}`} className="h-9" />
            <CommandList>
              <CommandEmpty>{fieldName} não encontrado(a).</CommandEmpty>
              <CommandGroup>
                {!isLoading &&
                  items.map((item) => (
                    <CommandItem
                      key={item.value}
                      value={item.value}
                      onSelect={(currentValue) => {
                        handleChangeValue(
                          currentValue === value ? '' : currentValue,
                        )
                        setOpen(false)
                      }}
                    >
                      {item.label}
                      <Check
                        className={cn(
                          'ml-auto',
                          value === item.value ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
