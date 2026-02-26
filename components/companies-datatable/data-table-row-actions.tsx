'use client'

import { Row } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useCallback, useState } from 'react'
import axios from 'axios'
import { toast } from 'sonner'
import useSWR from 'swr'
import { EllipsisVertical, LoaderCircle, TriangleAlert } from 'lucide-react'
import { Companies } from './columns'

const fetcher = (url: string) => axios.get(url).then((res) => res.data)

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const { mutate } = useSWR('/api/companies', fetcher)
  const empresa = row.original as Companies

  const [openDelete, setOpenDelete] = useState(false)

  const [loadingDelete, setLoadingDelete] = useState(false)
  const handleDelete = useCallback(async () => {
    setLoadingDelete(true)

    await axios
      .delete('/api/companies', { data: { id: empresa.id } })
      .then((response) => {
        setOpenDelete(false)
        toast.success(response.data.message)
        mutate('/api/companies')
        window.location.href = '/dashboard/administrador/empresas'
      })
      .catch((error) => {
        toast.error(error.response.data.message)
      })

    setLoadingDelete(false)
  }, [empresa, mutate])

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
          >
            <EllipsisVertical className="h-4 w-4 text-zinc-400" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[180px]">
          <DropdownMenuItem>
            <a href={`/dashboard/administrador/empresa/${empresa.id}/editar`}>
              Editar
            </a>
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => setOpenDelete(true)}
          >
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={openDelete}
        onOpenChange={(isOpen) => {
          if (isOpen === true) return
          setOpenDelete(false)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <div className="w-12 h-12 rounded bg-red-100 mb-2 flex items-center justify-center">
                <TriangleAlert className="inline h-6 w-6 text-red-600" />
              </div>
              Você está excluindo uma empresa!
            </AlertDialogTitle>

            <AlertDialogDescription>
              Você está prestes a excluir a empresa{' '}
              <span className="font-medium text-red-600">{empresa.name}</span>{' '}
              do sistema. Você tem certeza que deseja fazer isso?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={loadingDelete}
              onClick={() => handleDelete()}
            >
              {loadingDelete ? (
                <div className="flex items-center gap-2">
                  <LoaderCircle size={24} className="animate-spin" />
                </div>
              ) : (
                'Excluir'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
