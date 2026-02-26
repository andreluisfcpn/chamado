'use client'

import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { InputText } from '../input-text'
import { Button } from '../ui/button'
import { LoaderCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import useSWR from 'swr'
import { Checkbox } from '../ui/checkbox'
import { Label } from '../ui/label'
import { Company, TicketType } from '@prisma/client'
import { useEffect } from 'react'
import { SelectForm } from '../select-form'
import { companyStatuses } from '@/lib/data'
import Link from 'next/link'

const fetcher = (url: string) => axios.get(url).then((res) => res.data)
const fetcherCompany = async ([url, id]: any) =>
  await axios.get(url, { params: { id } }).then((res) => res.data)

const schema = z.object({
  name: z.string().nonempty('O nome é obrigatório.'),
  ticketTypes: z
    .array(z.string())
    .min(1, 'Selecione ao menos um tipo de chamado'),
  status: z.string().nonempty('O status é obrigatório.'),
})

export type EditCompanyFormValues = z.infer<typeof schema>

export function EditCompanyForm() {
  const { data, isLoading } = useSWR('/api/ticket-types', fetcher)
  const { mutate } = useSWR('/api/companies', fetcher)

  const router = useRouter()
  const params = useParams<{ id: string }>()

  const { data: companyData, isLoading: isLoadingCompany } = useSWR(
    ['/api/companies/company', params.id],
    fetcherCompany,
  )

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditCompanyFormValues>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    const company = companyData?.company || ({} as Company)

    if (company) {
      reset({
        name: company.name,
        status: company.status,
        ticketTypes:
          company.availableTypes?.map(
            (type: { ticketTypeId: string }) => type.ticketTypeId,
          ) || [],
      })
    }
  }, [reset, companyData])

  const onSubmit = async (data: EditCompanyFormValues) => {
    await axios
      .patch('/api/companies', { id: companyData?.company.id, ...data })
      .then((response) => {
        reset()
        mutate('/api/companies')
        toast.success(response.data.message)
        router.push('/dashboard/administrador/empresas')
      })
      .catch((error) => {
        toast.error(
          error.response?.data?.message || 'Erro ao adicionar a empresa',
        )
      })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-6">
      <div>
        <InputText
          id="name"
          label="Nome da Empresa"
          isRequired
          placeholder="Digite o nome da empresa"
          error={errors.name?.message}
          {...register('name')}
          disabled={isSubmitting || isLoadingCompany || isLoading}
          loading={isSubmitting || isLoadingCompany || isLoading}
        />
      </div>

      <div>
        <Label className="mb-3 block">
          Tipos de Chamado da Empresa: <span className="text-red-500">*</span>
        </Label>
        {isLoading || isLoadingCompany ? (
          <p>Carregando...</p>
        ) : (
          <Controller
            name="ticketTypes"
            control={control}
            render={({ field: { value = [], onChange } }) => {
              return (
                <div className="grid grid-cols-2 gap-6">
                  {data?.ticketTypes.map((ticketType: TicketType) => (
                    <div
                      key={ticketType.id}
                      className="flex items-center gap-3"
                    >
                      <Checkbox
                        id={`ticket-type-${ticketType.id}`}
                        checked={value.includes(ticketType.id)}
                        className="cursor-pointer"
                        onCheckedChange={(checked) => {
                          if (checked) {
                            onChange([...value, ticketType.id])
                          } else {
                            onChange(value.filter((id) => id !== ticketType.id))
                          }
                        }}
                        disabled={isSubmitting || isLoadingCompany || isLoading}
                      />
                      <Label
                        htmlFor={`ticket-type-${ticketType.id}`}
                        className="cursor-pointer"
                      >
                        {ticketType.name}
                      </Label>
                    </div>
                  ))}
                </div>
              )
            }}
          />
        )}
        {errors.ticketTypes && (
          <p className="mt-2 text-sm text-red-600">
            {errors.ticketTypes.message}
          </p>
        )}
      </div>

      <div>
        <Controller
          name="status"
          control={control}
          defaultValue={companyData?.company.status || ''}
          render={({ field: { onChange, value } }) => (
            <SelectForm
              items={companyStatuses}
              label="uma opção"
              fieldName="Status:"
              error={errors.status?.message}
              isRequired
              itemSelected={onChange}
              value={value}
              isLoading={isSubmitting || isLoadingCompany || isLoading}
            />
          )}
        />
      </div>

      <Button
        type="submit"
        className="flex w-full h-12 justify-center"
        disabled={isSubmitting || isLoadingCompany || isLoading}
      >
        {isSubmitting || isLoadingCompany || isLoading ? (
          <div className="flex items-center gap-2">
            <LoaderCircle size={24} className="animate-spin" />
            <p>Aguarde um momento</p>
          </div>
        ) : (
          'Cadastrar Empresa'
        )}
      </Button>

      <Button
        variant="outline"
        className="flex w-full h-12 justify-center md:hidden mt-2"
        asChild
      >
        <Link href="/dashboard/administrador/empresas">Cancelar</Link>
      </Button>
    </form>
  )
}
