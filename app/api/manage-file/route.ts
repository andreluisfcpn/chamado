import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { cloudinary } from '@/lib/cloudinary-config'

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { publicId } = await request.json()

  if (!publicId) {
    return NextResponse.json(
      { message: 'publicId é obrigatório' },
      { status: 400 },
    )
  }

  try {
    await cloudinary.uploader.destroy(publicId)
    return NextResponse.json({ message: 'Imagem removida com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar imagem Cloudinary:', error)
    return NextResponse.json(
      { message: 'Erro ao deletar imagem' },
      { status: 500 },
    )
  }
}
