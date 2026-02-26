// Mapeamento das mensagens de erro do React-Dropzone para português
export const errorMessages: Record<string, string> = {
  'file-invalid-type':
    'Tipo de arquivo não permitido. Formatos aceitos: imagens (JPEG, PNG), vídeos (MP4), PDF, Excel (XLS, XLSX) e CSV',
  'file-too-large': 'Arquivo muito grande. Tamanho máximo permitido: 2MB',
  'file-too-small': 'Arquivo muito pequeno',
  'too-many-files':
    'Muitos arquivos selecionados. Máximo permitido: 5 arquivos',
}

// Função para traduzir mensagens de erro
export const translateError = (error: { code: string; message: string }) => {
  // Se temos uma tradução personalizada, usa ela
  if (errorMessages[error.code]) {
    return errorMessages[error.code]
  }

  // Traduz mensagens específicas do react-dropzone
  const message = error.message.toLowerCase()

  if (message.includes('file is larger than')) {
    const bytes = message.match(/(\d+)\s*bytes/)?.[1]
    const mb = bytes ? Math.round(parseInt(bytes) / 1024 / 1024) : 2
    return `Arquivo muito grande. Tamanho máximo permitido: ${mb}MB`
  }

  if (message.includes('file type must be')) {
    return 'Tipo de arquivo não permitido. Formatos aceitos: imagens (JPEG, PNG), vídeos (MP4), PDF, Excel (XLS, XLSX) e CSV'
  }

  if (message.includes('too many files')) {
    return 'Muitos arquivos selecionados. Máximo permitido: 5 arquivos'
  }

  // Retorna a mensagem original se não encontrar tradução
  return error.message
}
