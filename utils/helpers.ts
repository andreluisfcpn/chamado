export const getInitials = (name: string) => {
  const words = name.trim().split(/\s+/)

  if (words.length >= 2) {
    const initials = words[0][0] + words[words.length - 1][0]
    return initials.toUpperCase()
  } else if (words.length === 1) {
    return words[0][0]?.toUpperCase()
  } else {
    return ''
  }
}

export const getFirstAndLastName = (fullName: string) => {
  const names = fullName?.trim().split(' ')

  if (names?.length > 1) {
    const firstName = names[0]
    const lastName = names[names.length - 1]

    return `${firstName} ${lastName}`
  } else {
    return fullName
  }
}

export const transformFileToBase64 = async (
  files: File[],
): Promise<string[]> => {
  const promises = files.map((file) => fileToBase64(file))
  return await Promise.all(promises)
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Erro ao converter o arquivo para base64.'))
      }
    }
    reader.onerror = (error) => reject(error)
  })
}

export const getCurrentTimeUTC = () => {
  const d = new Date()
  const d2 = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return d2.toISOString()
}

export const AddMinutesToCurrentTime = () => {
  const now = new Date(getCurrentTimeUTC())
  now.setMinutes(now.getMinutes() + 30)
  return now.toISOString()
}
