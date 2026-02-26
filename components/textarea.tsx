import { Label } from './ui/label'
import { Textarea } from './ui/textarea'

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  isRequired?: boolean
  loading?: boolean
}

export const TextareaComponent = ({
  label,
  error,
  isRequired,
  loading,
  ...props
}: TextareaProps) => {
  return (
    <>
      <Label
        htmlFor={props.id}
        className={loading ? 'opacity-50' : error ? 'text-red-600' : ''}
      >
        {label} {isRequired && <span className="text-red-600">*</span>}
      </Label>
      <Textarea
        className={`w-full ${error ? 'border-red-600' : ''}`}
        rows={10}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </>
  )
}
