import Link from 'next/link'
import { Input } from './ui/input'
import { Label } from './ui/label'

interface InputPasswordProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  isRequired?: boolean
  loading?: boolean
  hasForgotPasswordLink?: boolean
}

export const InputPassword = ({
  label,
  error,
  isRequired,
  loading,
  hasForgotPasswordLink = false,
  ...props
}: InputPasswordProps) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <Label
          htmlFor={props.id}
          className={`${error ? 'text-red-600' : ''} ${loading ? 'opacity-50' : ''}`}
        >
          {label} {isRequired && <span className="text-red-600">*</span>}
        </Label>
        {hasForgotPasswordLink && (
          <Link
            href="/esqueci-minha-senha"
            className="text-sm text-primary hover:underline"
          >
            Esqueceu sua senha?
          </Link>
        )}
      </div>
      <Input
        type="password"
        className={`w-full h-12 mt-1 ${error ? 'border-red-600' : ''}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </>
  )
}
