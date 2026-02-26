import { Input } from './ui/input'
import { Label } from './ui/label'

interface InputTextProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  isRequired?: boolean
  loading?: boolean
}

export const InputText = ({
  label,
  error,
  isRequired,
  loading,
  ...props
}: InputTextProps) => {
  return (
    <>
      <Label
        htmlFor={props.id}
        className={`${loading ? 'opacity-50' : error ? 'text-red-600' : ''}`}
      >
        {label} {isRequired && <span className="text-red-600">*</span>}
      </Label>
      <Input
        className={`w-full h-12 ${error ? 'border-red-600' : ''}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </>
  )
}
