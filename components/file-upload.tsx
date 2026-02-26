'use client'
import { useCallback } from 'react'
import { Trash, Paperclip } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { translateError } from '@/utils/file-validator'

interface FileUploadProps {
  setFiles: React.Dispatch<React.SetStateAction<File[]>>
  files: File[]
}

export function FileUpload({ setFiles, files }: FileUploadProps) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      setFiles((prev) => {
        const next = [...prev]
        for (const f of accepted) {
          const exists = next.some(
            (p) =>
              p.name === f.name &&
              p.size === f.size &&
              p.lastModified === f.lastModified,
          )
          if (!exists) next.push(f)
        }
        return next
      })
    },
    [setFiles],
  )

  const { getRootProps, getInputProps, fileRejections } = useDropzone({
    onDrop,
    maxFiles: 5,
    maxSize: 2 * 1024 * 1024,
    accept: {
      'image/jpg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'video/mp4': ['.mp4'],
      'application/pdf': ['.pdf'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
        '.xlsx',
      ],
      'text/csv': ['.csv'],
    },
  })

  const removeFile = (fileToRemove: File) => {
    setFiles((prev) =>
      prev.filter(
        (f) =>
          !(
            f.name === fileToRemove.name &&
            f.size === fileToRemove.size &&
            f.lastModified === fileToRemove.lastModified
          ),
      ),
    )
  }

  const acceptedFileItems = files.map((file) => {
    return (
      <div key={file.name} className="mt-2">
        <li className="w-full flex items-center justify-between">
          <small>{file.name}</small>
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="size-7"
            onClick={() => removeFile(file)}
          >
            <Trash />
          </Button>
        </li>
      </div>
    )
  })

  return (
    <section className="container">
      <Label>Anexos:</Label>

      <div
        {...getRootProps({ className: 'dropzone' })}
        className="w-full p-8 border border-dashed border-zinc-200 hover:border-primary transition-all cursor-pointer rounded-lg flex flex-col items-center justify-center"
      >
        <input {...getInputProps()} />
        <Paperclip className="text-zinc-400 mb-1" />
        <p className="text-sm text-center">
          Clique para anexar arquivos ou arraste e solte aqui
        </p>
        <small className="text-xs text-zinc-400 text-center">
          PDF, XLS, XLSX, CSV, JPG, PNG (máx. 2MB cada)
        </small>
      </div>

      <aside>
        <ul>{acceptedFileItems}</ul>
        <ul>
          {fileRejections.length > 0 &&
            (() => {
              const hasTooManyFilesError = fileRejections.some(({ errors }) =>
                errors.some((error) => error.code === 'too-many-files'),
              )

              return (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-red-700 font-bold mb-3">
                    Arquivos rejeitados:
                  </p>

                  {/* Erro geral de muitos arquivos - mostrar apenas uma vez */}
                  {hasTooManyFilesError && (
                    <p className="text-red-600 text-xs font-medium">
                      - Muitos arquivos selecionados. Máximo permitido: 5
                      arquivos
                    </p>
                  )}

                  {/* Erros específicos por arquivo */}
                  {fileRejections.map(({ file, errors }) => {
                    const fileSpecificErrors = errors.filter(
                      (error) => error.code !== 'too-many-files',
                    )

                    if (fileSpecificErrors.length === 0) return null

                    return (
                      <div key={file.name} className="mb-2">
                        <p className="text-red-700 font-medium text-xs">
                          {file.name}
                        </p>
                        <ul className="text-red-600 text-sm ml-4 mt-1">
                          {fileSpecificErrors.map((error) => (
                            <li key={error.code} className="text-xs">
                              - {translateError(error)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  })}
                </div>
              )
            })()}
        </ul>
      </aside>
    </section>
  )
}
