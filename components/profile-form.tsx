'use client'

import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Camera, LoaderCircle, Trash } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'
import { InputText } from './input-text'
import { InputPassword } from './input-password'
import { Button } from './ui/button'
import { useSession } from 'next-auth/react'
import { CldUploadWidget } from 'next-cloudinary'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { getInitials } from '@/utils/helpers'
import { useState } from 'react'
import Link from 'next/link'

const schema = z.object({
  name: z.string().nonempty('O nome é obrigatório.'),
  email: z.string(),
  password: z.string(),
  image: z.string().url('Imagem inválida').nullable().optional(),
})

type EditProfileFormValues = z.infer<typeof schema>

export function EditProfileForm() {
  const { data: session, status, update } = useSession()
  const [publicId, setPublicId] = useState('')
  const [deleteImageLoading, setDeleteImageLoading] = useState(false)

  let backUrl = ''

  switch (session?.user.role) {
    case 'ADMINISTRADOR':
      backUrl = '/dashboard/administrador'
      break
    case 'ATENDENTE':
      backUrl = '/dashboard/atendente'
      break
    case 'CLIENTE':
      backUrl = '/dashboard/cliente'
      break
    case 'ADMINISTRADOR_EMPRESA':
      backUrl = '/dashboard/empresa'
      break
    default:
      backUrl = '/dashboard/administrador'
  }

  const {
    watch,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EditProfileFormValues>({
    resolver: zodResolver(schema),
  })

  const imageUrl = watch('image')

  const handleUpload = (result: any) => {
    const info = result?.info
    if (info?.secure_url) {
      setValue('image', info.secure_url, {
        shouldValidate: true,
        shouldDirty: true,
      })
      setPublicId(info?.public_id)
    }
  }

  const handleDeleteFile = async () => {
    setDeleteImageLoading(true)

    await fetch('/api/manage-file', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicId }),
    }).finally(() => setDeleteImageLoading(false))

    setValue('image', null)
    setPublicId('')
  }

  const onSubmit = async (data: EditProfileFormValues) => {
    await axios
      .patch('/api/profile', { ...data, id: session?.user.id })
      .then((response) => {
        reset()
        update({
          ...session,
          user: {
            ...session?.user,
            name: response.data.user.name,
            image: response.data.user.image,
          },
        })
        setValue('image', null)
        setPublicId('')
        toast.success(response.data.message)
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || 'Erro ao atualizar perfil')
      })
  }

  return status === 'loading' ? (
    <div className="w-full space-y-6 animate-pulse">
      <div className="w-28 h-28 bg-zinc-200 rounded-full"></div>
      <div>
        <div className="w-40 h-6 bg-zinc-200 rounded"></div>
        <div className="w-full h-12 mt-1 bg-zinc-200 rounded"></div>
      </div>
      <div>
        <div className="w-40 h-6 bg-zinc-200 rounded"></div>
        <div className="w-full h-12 mt-1 bg-zinc-200 rounded"></div>
      </div>
      <div>
        <div className="w-40 h-6 bg-zinc-200 rounded"></div>
        <div className="w-full h-12 mt-1 bg-zinc-200 rounded"></div>
      </div>
      <div className="w-full h-12 mt-1 bg-zinc-200 rounded"></div>
    </div>
  ) : (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
      <div className="w-28 h-28 relative">
        {!imageUrl ? (
          <CldUploadWidget
            onSuccess={handleUpload}
            uploadPreset="ml_default"
            options={{ maxFiles: 1, folder: 'chamado' }}
            config={{
              cloud: {
                cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
                apiKey: process.env.CLOUDINARY_API_KEY,
              },
            }}
          >
            {({ open }) => (
              <Button
                type="button"
                size="sm"
                onClick={() => open?.()}
                className="absolute z-50 -right-0 bottom-0"
              >
                <Camera />
              </Button>
            )}
          </CldUploadWidget>
        ) : (
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={handleDeleteFile}
            className="absolute z-50 -right-0 bottom-0 hover:bg-red-500"
            disabled={isSubmitting}
          >
            {deleteImageLoading ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <Trash />
            )}
          </Button>
        )}

        <Avatar className="w-28 h-28">
          <AvatarImage
            src={imageUrl || session?.user.image || undefined}
            className="object-cover"
          />
          <AvatarFallback className="text-2xl font-light">
            {getInitials(session?.user.name ?? '')}
          </AvatarFallback>
        </Avatar>
      </div>

      <div>
        <InputText
          id="name"
          label="Nome Completo"
          isRequired
          defaultValue={session?.user.name || ''}
          placeholder="Digite o nome completo"
          error={errors.name?.message}
          {...register('name')}
          disabled={isSubmitting}
          loading={isSubmitting}
        />
      </div>

      <div>
        <InputText
          id="email"
          label="E-mail"
          type="email"
          placeholder="Digite seu e-mail"
          isRequired
          defaultValue={session?.user.email || ''}
          error={errors.email?.message}
          {...register('email')}
          disabled
          loading={isSubmitting}
        />
      </div>

      <div>
        <InputPassword
          id="password"
          label="Senha:"
          placeholder="********"
          autoComplete="new-password"
          defaultValue=""
          error={errors.password?.message}
          {...register('password')}
          disabled={isSubmitting}
          loading={isSubmitting}
        />
      </div>

      <Button
        type="submit"
        className="flex w-full h-12 justify-center"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <div className="flex items-center gap-2">
            <LoaderCircle size={24} className="animate-spin" />
            <p>Aguarde um momento</p>
          </div>
        ) : (
          'Salvar Alterações'
        )}
      </Button>

      <Button
        variant="outline"
        className="flex w-full h-12 justify-center mt-2 md:hidden"
        asChild
      >
        <Link href={backUrl}>Cancelar</Link>
      </Button>
    </form>
  )
}
