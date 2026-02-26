'use client'

import { ChevronsUpDown, LogOut, UserCog } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { signOut, useSession } from 'next-auth/react'
import { getFirstAndLastName, getInitials } from '@/utils/helpers'
import Link from 'next/link'
import { Button } from './ui/button'

export function NavUserNoAdmin() {
  const { data: session } = useSession()

  let role: string

  switch (session?.user.role) {
    case 'ADMINISTRADOR':
      role = 'administrador'
      break
    case 'ATENDENTE':
      role = 'atendente'
      break
    case 'ADMINISTRADOR_EMPRESA':
      role = 'empresa'
      break
    case 'CLIENTE':
      role = 'cliente'
      break
    default:
      role = 'administrador'
      break
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="px-0! md:px-6">
        <Button
          variant="ghost"
          size="lg"
          className="data-[state=open]:bg-transparent data-[state=open]:text-zinc-600 hover:bg-transparent hover:text-zinc-600"
        >
          <Avatar className="h-10 w-10 rounded-full">
            <AvatarImage
              src={session?.user.image ?? ''}
              alt={session?.user.name ?? ''}
              className="object-cover"
            />
            <AvatarFallback className="bg-zinc-100 rounded-full text-zinc-600">
              {getInitials(session?.user.name ?? '')}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">
              {getFirstAndLastName(session?.user.name ?? '')}
            </span>
            <span className="truncate text-xs">
              {session?.user.email ?? ''}
            </span>
          </div>
          <ChevronsUpDown className="ml-auto size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-full min-w-40 rounded-lg"
        side="bottom"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/${role}/perfil`}>
              <UserCog />
              Perfil
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 hover:text-red-600! hover:bg-red-600/10 focus:bg-red-600/10 active:bg-red-600/10"
          onClick={() =>
            signOut({
              redirect: true,
              callbackUrl: '/',
            })
          }
        >
          <LogOut className="text-red-600" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
